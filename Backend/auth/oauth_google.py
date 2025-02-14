from fastapi import APIRouter, Depends, HTTPException, status, Response, Form, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User, OAuthAccount
from jose import jwt
from datetime import datetime, timedelta, timezone
import os
import requests

# JWT 설정 (이 부분은 다른 파일에서 가져오거나 환경 변수로 설정하는 것이 좋습니다.)
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = float(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

# Google OAuth2 설정 (이 부분도 환경 변수로 설정하는 것이 좋습니다.)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
REDIRECT_URI = "http://127.0.0.1:8000/api/v1/oauth/google/callback"

router = APIRouter(
    prefix="/oauth",
)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """JWT Access Token 생성"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=30))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict, expires_delta: timedelta = None):
    """JWT Refresh Token 생성"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(days=7))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

import json
from fastapi.responses import HTMLResponse

async def process_google_callback(code: str, response: Response, db: Session):
    """
    Google OAuth2 콜백 처리 로직 (POST 및 GET 모두에서 사용)
    """
    if not code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code is missing.")

    # 1. Google OAuth2 Access Token 요청
    token_data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    try:
        token_response = requests.post(GOOGLE_TOKEN_URL, data=token_data)
        token_response.raise_for_status()  # HTTP 에러 발생 시 예외 발생
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error fetching token: {e}")

    token_json = token_response.json()
    access_token = token_json.get("access_token")

    # 2. Google 사용자 정보 조회
    user_info_response = requests.get(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
    user_info_response.raise_for_status() # HTTP 에러 발생 시 예외 발생
    user_info = user_info_response.json()
    email = user_info.get("email")
    name = user_info.get("name", "Google User")
    picture = user_info.get("picture", "default.png")

    # 3. 기존 사용자 확인
    existing_user = db.query(User).filter(User.email == email).first()
    oauth_connected = False

    if existing_user:
        # 기존 사용자
        if not existing_user.is_oauth_user:
            existing_user.is_oauth_user = True
            new_oauth = OAuthAccount(
                user_id=existing_user.user_pk,
                provider="google",
                access_token=access_token,
                account_id=email,  # account_id는 email로 설정
            )
            db.add(new_oauth)
            oauth_connected = True
        db.commit()  # 모든 변경 사항을 커밋

    else:
        # 신규 사용자
        new_user = User(
            email=email,
            name=name,
            nickname=name,
            phone=None,
            password=None,
            user_img=picture,
            is_oauth_user=True,
        )
        db.add(new_user)
        db.commit()
        existing_user = new_user  # 새로 가입한 사용자로 설정

    # 4. JWT Access Token 및 Refresh Token 발급
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    jwt_access_token = create_access_token(data={"sub": email}, expires_delta=access_token_expires)

    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    jwt_refresh_token = create_refresh_token(data={"sub": email}, expires_delta=refresh_token_expires)

    # 5. Redis에 Refresh Token 저장
    from utils.auth_utils import redis_client  # Redis 유틸 가져오기
    redis_client.setex(f"refresh_token:{email}", int(refresh_token_expires.total_seconds()), jwt_refresh_token)

    # 6. 쿠키에 JWT 저장 (자동 로그인)
    response.set_cookie(key="access_token", value=jwt_access_token, httponly=True, max_age=int(access_token_expires.total_seconds()))
    response.set_cookie(key="refresh_token", value=jwt_refresh_token, httponly=True, max_age=int(refresh_token_expires.total_seconds()))

    return {
        "message": "Google 로그인 성공",
        "user": email,
        "oauth_connected": oauth_connected,
        "access_token": jwt_access_token,
        "refresh_token": jwt_refresh_token,
        "token_type": "bearer",
    }

    # html_content = """
    # <script>
    #     window.opener.postMessage({type: "GOOGLE_LOGIN_SUCCESS", data: %s}, "*");
    #     window.close();
    # </script>
    # """ % json.dumps({
    #     "message": "Google 로그인 성공",
    #     "user": email,
    #     "oauth_connected": oauth_connected,
    # })

    # return HTMLResponse(content=html_content)


@router.get("/google/callback")
async def google_callback_get(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    GET 요청 처리 (쿼리 파라미터에서 code 추출)
    """
    code = request.query_params.get("code")
    return await process_google_callback(code=code, response=response, db=db)


@router.post("/google/callback")
async def google_callback_post(response: Response, db: Session = Depends(get_db), code: str = Form(...)):
    """
    POST 요청 처리 (Form 데이터에서 code 추출)
    """
    return await process_google_callback(code=code, response=response, db=db)


@router.get(path="/google/login", description="소셜 로그인")
def google_login():
    """
    ✅ Google OAuth 로그인 URL 생성
    - 브라우저에서 이 URL로 이동하면 Google 로그인 페이지가 표시됨.
    """
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=email%20profile"
    )
    return {"login_url": google_auth_url}