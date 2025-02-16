from redis import Redis
from fastapi import HTTPException
from twilio.rest import Client
from datetime import datetime, timedelta, timezone
from typing import Optional
import random
import os

REDIS_PORT = os.getenv("REDIS_PORT")

# Redis 설정
redis_client = Redis(host="127.0.0.1", port=REDIS_PORT, db=0, decode_responses=True)

# Twilio 설정
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_VERIFY_SID = os.getenv("TWILIO_VERIFY_SID")
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# ====================================================== 휴대전화 인증 로직 ==========================================================

def send_sms(phone: str):
    """
    전화번호로 인증번호 발송
    """
    try:
        e164_phone = to_e164(phone)  # E.164 형식 변환
        client.verify.services(TWILIO_VERIFY_SID).verifications.create(
            to=e164_phone,
            channel="sms"
        )
        return {"message": "Verification code sent successfully"}
    except ValueError as e:
        raise HTTPException(status_code=422, detail="Invalid phone number format.")
    except Exception as e:
        # 로깅 추가 (예: Sentry 또는 파일 로그)
        print(f"Twilio error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send SMS. Please try again later.")

def verify_code(phone: str, code: str):
    """
    인증번호 검증 및 Redis에 인증 상태 저장
    """
    try:
        e164_phone = to_e164(phone)  # E.164 형식 변환
        verification_check = client.verify.services(TWILIO_VERIFY_SID).verification_checks.create(
            to=e164_phone,
            code=code
        )
        if verification_check.status == "approved":
            # Redis에 인증 상태 저장 (24시간간 유효)
            redis_client.setex(f"verified:{phone}", 86400, "true")
            return {"message": "Phone number verified successfully"}
        raise HTTPException(status_code=400, detail="Invalid verification code")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def check_verified(phone: str):
    """
    Redis에서 인증 상태 확인
    """
    verified = redis_client.get(f"verified:{phone}")
    if not verified or verified != "true":
        raise HTTPException(status_code=400, detail="Phone number not verified")
    return True

def to_e164(phone: str) -> str:
    """
    010-XXXX-XXXX 형식을 E.164 형식으로 변환
    """
    if phone.startswith("010") and '-' in phone:
        return "+82" + phone.replace("-", "")[1:]
    raise ValueError("Invalid phone number format")

def from_e164(e164_phone: str) -> str:
    """
    E.164 형식을 010-XXXX-XXXX 형식으로 변환
    """
    if e164_phone.startswith("+82") and len(e164_phone) >= 11:
        return "010-" + e164_phone[3:7] + "-" + e164_phone[7:]
    raise ValueError("Invalid E.164 format")

# ====================================================== 이메일일 인증 로직 ==========================================================

import string

def generate_verification_code():
    """6자리 랜덤 인증번호 생성"""
    return "".join(random.choices(string.digits, k=6))

def save_verification_code(email: str, code: str, name: str, expiration: int = 600):
    """Redis에 인증번호 저장 (10분 유효)"""
    redis_client.setex(f"email_verification:{email}", expiration, code)
    redis_client.setex(f"email_verification_name:{email}", expiration, name)

# ================================== 로그인 여부 확인 ===============================================

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



from fastapi import Depends, HTTPException, status, Header, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session
from database import get_db
from user import user_crud
import os
from datetime import timedelta
from typing import Optional

# JWT 발급 설정
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = float(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
# Bearer 인증 설정 : auto_error=False 비로그인 사용자 refresh_token 미입력
security = HTTPBearer(auto_error=False)

async def get_refresh_token(request: Request) -> str:
    """요청 헤더에서 refresh_token을 추출 (Swagger에서 감춤)"""
    return request.headers.get("refresh_token")  # 없으면 None 반환

async def get_current_user(
    request: Request,  # 쿠키를 가져오기 위해 Request 객체 사용
    response: Response = None,
    db: Session = Depends(get_db),
    refresh_token: str = Depends(get_refresh_token)  # 리프레시 토큰 검증용
):
    """
    현재 로그인된 사용자 검증.
    Access Token이 만료된 경우 Refresh Token을 이용하여 자동으로 재발급.
    """
    # 1️⃣ Access Token을 쿠키에서 가져옴
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token is missing."
        )

    try:
        # 2️⃣ JWT 검증
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

        # 3️⃣ DB에서 사용자 정보 가져오기
        user = user_crud.get_user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return user

    except ExpiredSignatureError:
        # 4️⃣ Access Token 만료 시 Refresh Token을 이용해 재발급
        if not refresh_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token expired. Please login again.")

        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")

            if email is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

            stored_token = redis_client.get(f"refresh_token:{email}")
            if stored_token != refresh_token:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

            # 새로운 Access Token 발급
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            new_access_token = create_access_token(data={"sub": email}, expires_delta=access_token_expires)

            # 5️⃣ 새 Access Token을 쿠키에 저장
            if response:
                response.set_cookie(
                    key="access_token",
                    value=new_access_token,
                    httponly=True,
                    secure=False,
                    samesite="Lax",
                    max_age=int(access_token_expires.total_seconds())
                )

            return user

        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")


async def get_optional_user(
    request: Request,  # 요청 객체에서 쿠키를 가져오기 위함
    response: Response = None,
    db: Session = Depends(get_db)
):  
    """
    로그인하지 않은 사용자도 허용하는 인증 함수 (쿠키 기반)
    """
    access_token = request.cookies.get("access_token")  # 쿠키에서 Access Token 가져오기
    refresh_token = request.cookies.get("refresh_token")  # 쿠키에서 Refresh Token 가져오기

    if not access_token:
        return None  # 비로그인 사용자 처리

    try:
        # Access Token 검증
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            return None  # 비로그인 처리

    except ExpiredSignatureError:
        if not refresh_token:
            return None  # Refresh Token도 없으면 비로그인 처리

        try:
            # Refresh Token 검증 및 새로운 Access Token 발급
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")

            if email is None:
                return None  # 비로그인 처리

            stored_token = redis_client.get(f"refresh_token:{email}")
            if stored_token != refresh_token:
                return None  # Refresh Token이 유효하지 않으면 비로그인 처리

            # 새로운 Access Token 발급
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            new_access_token = create_access_token(data={"sub": email}, expires_delta=access_token_expires)

            # 새 Access Token을 쿠키에 저장
            if response:
                response.set_cookie(
                    key="access_token",
                    value=new_access_token,
                    httponly=True,
                    secure=False,
                    samesite="Lax",
                    max_age=int(access_token_expires.total_seconds())
                )

            return user_crud.get_user_by_email(db, email)

        except JWTError:
            return None  # Refresh Token이 유효하지 않으면 비로그인 처리

    except JWTError:
        return None  # 토큰이 잘못되었으면 비로그인 처리

    # DB에서 사용자 정보 가져오기
    user = user_crud.get_user_by_email(db, email)
    if user is None:
        return None  # 사용자가 존재하지 않으면 비로그인 처리

    return user  # 유저 객체 반환