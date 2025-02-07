from fastapi import Depends, Header, HTTPException, status, APIRouter, Response, BackgroundTasks
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional

from . import auth_crud, auth_schema
from database import get_db
from user import user_crud
from utils.auth_utils import send_sms, verify_code, check_verified, redis_client, generate_verification_code, save_verification_code

from dotenv import load_dotenv
import os

load_dotenv()


# JWT 발급 설정
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = float(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# 이메일 서버 설정
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT")),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,  # TLS 사용(포트 587)
    MAIL_SSL_TLS=False,  # SSL 비활성화(포트 465)
    USE_CREDENTIALS=True
)


app = APIRouter(
    prefix='/api/v1/auth',
)


# ======================================= 회원가입 로직 ======================================= 

@app.post("/signup")
async def signup(new_user: auth_schema.NewUserForm, db: Session = Depends(get_db)):
    """
    회원가입 API (비밀번호 일치 검증 추가)
    """
    # 이메일 소문자로 변환
    normalized_email = new_user.email.lower()

    existing_user = user_crud.get_user_by_email(db, normalized_email)

    if existing_user:
        if existing_user.is_oauth_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이 계정은 Google OAuth2 계정입니다. 일반 회원가입을 시도하지 말고, 소셜 로그인을 이용하세요."
            )
        raise HTTPException(status_code=409, detail="이미 사용 중인 이메일입니다.")

    # 닉네임 중복 체크
    if user_crud.get_user_by_nickname(db, new_user.nickname):
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")

    # 전화번호 인증 여부 확인
    check_verified(new_user.phone)

    # 비밀번호 일치 여부 검증
    if new_user.password != new_user.confirm_password:
        raise HTTPException(status_code=422, detail="입력한 비밀번호가 일치하지 않습니다.")

    # 사용자 생성
    user_data = new_user.dict()
    user_data["email"] = normalized_email  # 이메일을 소문자로 덮어쓰기
    auth_crud.create_user(auth_schema.NewUserForm(**user_data), db)

    return {"message": "회원가입이 완료되었습니다."}


# ======================================= 로그인 로직 ======================================= 

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Access Token 생성 함수
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})  # 만료 시간 추가
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Refresh Token 생성 함수
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})  # 만료 시간 추가
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 로그인 할 때 받아줄 폼 : OAuth2PasswordRequestForm -> pip install python-multipart 필요
@app.post("/login")
async def login(response: Response, login_form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    일반 로그인 처리 (OAuth2 연결된 사용자는 비밀번호 로그인도 가능)
    """
    # 이메일로 사용자 조회
    user = user_crud.get_user_by_email(db, login_form.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user")

    # OAuth2 연결이 되어 있어도 비밀번호 로그인 가능 (소셜 로그인 병행 가능)
    if user.is_oauth_user and user.password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이 계정은 Google OAuth2 계정입니다. 일반 로그인이 불가능합니다. Google 로그인을 이용하세요."
        )

    # 비밀번호 검증
    if not auth_crud.verify_password(login_form.password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid password")

    # Access Token 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    # Refresh Token 생성
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data={"sub": user.email}, expires_delta=refresh_token_expires)

    # Redis에 Refresh Token 저장 (만료 시간 설정)
    redis_client.setex(f"refresh_token:{user.email}", int(refresh_token_expires.total_seconds()), refresh_token)

    # 쿠키에 토큰 저장
    response.set_cookie(key="access_token", value=access_token, httponly=True, max_age=int(access_token_expires.total_seconds()))
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, max_age=int(refresh_token_expires.total_seconds()))

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@app.post("/refresh-token")
async def refresh_token(response: Response, refresh_token: str = Header(...)):
    """
    Refresh Token을 사용하여 새로운 Access Token 발급
    """
    try:
        # Refresh Token 검증
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        # Redis에서 Refresh Token 검증
        stored_token = redis_client.get(f"refresh_token:{email}")
        if stored_token != refresh_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

        # 새로운 Access Token 생성
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": email}, expires_delta=access_token_expires)

        # 쿠키에 새로운 Access Token 저장
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=int(access_token_expires.total_seconds())
        )

        return {"access_token": access_token, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")


# ======================================= 로그아웃 로직 ======================================= 

# Bearer 인증 설정
security = HTTPBearer()

@app.post("/logout")
async def logout(response: Response, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    로그아웃: Refresh Token을 검증하고 무효화
    """
    token = credentials.credentials  # Authorization 헤더에서 토큰 추출

    try:
        # Refresh Token 검증
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Redis에서 Refresh Token 확인
        stored_token = redis_client.get(f"refresh_token:{email}")
        if stored_token != token:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Redis에서 Refresh Token 삭제
        redis_client.delete(f"refresh_token:{email}")

        # 클라이언트 쿠키에서 토큰 제거
        response.delete_cookie(key="access_token")
        response.delete_cookie(key="refresh_token")

        return {"message": "Successfully logged out"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ======================================= 아이디 찾기 로직 =======================================

@app.post("/find-id")
def find_id(request: auth_schema.FindIdRequest, db: Session = Depends(get_db)):
    # 전화번호 인증 여부 확인
    check_verified(request.phone)

    # 사용자 조회
    user = user_crud.get_user_by_name_and_phone(db, request.name, request.phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not Found")

    return {"email": user.email}

# ======================================= sms 인증 로직 ==============================================

@app.post("/send-sms")
def send_sms_endpoint(phone: str):
    return send_sms(phone)

@app.post("/verify-sms-code")
def verify_code_endpoint(phone: str, code: str):
    return verify_code(phone, code)

@app.get("/check-sms-verified")
def check_verified_endpoint(phone: str):
    return {"verified": check_verified(phone)}


# ======================================= 이메일 인증 로직 ==========================================

@app.post("/send-verification-email")
async def send_verification_email_endpoint(background_tasks: BackgroundTasks, email_info: auth_schema.EmailVerificationRequestSchema):
    """
    사용자의 이메일로 인증번호 전송
    """
    verification_code = generate_verification_code()  # 랜덤 인증번호 생성
    save_verification_code(email_info.email, verification_code, email_info.name)  # Redis에 저장 (이메일+이름)

    subject = "[모모소]비밀번호 변경을 위한 인증번호"
    message = MessageSchema(
        subject=subject,
        recipients=[email_info.email],
        body=f"안녕하세요, 모모소입니다.\n\n비밀번호 변경을 위한 인증번호를 전송드리니, 인증 후 10분 이내에 비밀번호를 변경해주세요.\n\n 인증번호: {verification_code}",
        subtype="plain"
    )

    fm = FastMail(conf)
    background_tasks.add_task(fm.send_message, message)

    return {"message": "인증 이메일이 전송되었습니다."}


@app.post("/verify-email-code")
async def verify_email_code(email_verification: auth_schema.EmailVerificationSchema, db: Session = Depends(get_db)):
    """
    이메일 인증 코드 및 이름 검증
    """
    stored_code = redis_client.get(f"email_verification:{email_verification.email}")

    if stored_code is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="인증번호가 만료되었거나 존재하지 않습니다.")

    # Redis에서 가져온 값이 바이트 타입일 경우 디코딩, 문자열이면 그대로 사용
    if isinstance(stored_code, bytes):
        stored_code = stored_code.decode("utf-8")

    if stored_code != email_verification.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="잘못된 인증번호입니다.")

    # 사용자 이름 검증
    user = user_crud.get_user_by_email(db, email_verification.email)
    if not user or user.name != email_verification.name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="이름이 일치하지 않습니다.")

    # 인증 성공 후 Redis에서 인증번호 삭제
    redis_client.delete(f"email_verification:{email_verification.email}")

    # 사용자별 인증 완료 상태 저장 → `verified_email`
    redis_client.setex("verified_email", 600, email_verification.email)  # 10분 동안 유효

    return {"message": "이메일 인증이 완료되었습니다."}


@app.post("/reset-password")
async def reset_password(reset_password: auth_schema.ResetPasswordSchema, db: Session = Depends(get_db)):
    """
    인증된 사용자에 대해 비밀번호 재설정 (이메일 입력 불필요)
    """
    # Redis에서 인증된 이메일 가져오기
    email = redis_client.get("verified_email")
    if not email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="이메일 인증이 필요합니다.")

    # Redis에서 가져온 email이 바이트 타입일 수 있으므로 문자열 변환
    email = email.decode("utf-8") if isinstance(email, bytes) else email

    # 비밀번호 일치 여부 검증
    if reset_password.new_password != reset_password.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="입력한 비밀번호가 일치하지 않습니다.")

    # 사용자 확인
    user = user_crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    # OAuth2 사용자 비밀번호 변경 불가하도록 차단
    if user.is_oauth_user:
        print(f"🚨 OAuth2 사용자({user.email})가 비밀번호 변경 시도 → 차단됨")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이 계정은 Google OAuth2 로그인 전용입니다. 비밀번호 변경이 불가능합니다."
        )

    # 비밀번호 변경
    hashed_password = auth_crud.hash_password(reset_password.new_password)
    auth_crud.update_user_password(db, email, hashed_password)

    # 비밀번호 변경 후 강제 로그아웃 처리 (Redis에서 refresh token 삭제)
    redis_client.delete(f"refresh_token:{email}")
    redis_client.delete("verified_email")  # 인증 상태 제거

    return {"message": "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요."}