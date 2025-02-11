from redis import Redis
from fastapi import HTTPException
from twilio.rest import Client
import random
import os

# Redis 설정
redis_client = Redis(host="127.0.0.1", port=6379, db=0, decode_responses=True)

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
    redis_client.setex(f"email_verification_name:{email}", expiration, name)  # 이름도 저장

# ================================== 로그인 여부 확인 ===============================================

from fastapi import Depends, HTTPException, status, Header, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session
from database import get_db
from user import user_crud
import os
from auth.auth_router import create_access_token
from datetime import timedelta

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")

# Bearer 인증 설정
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    response: Response = None,
    db: Session = Depends(get_db),
    refresh_token: str = Header(None)
):
    """
    현재 로그인된 사용자 검증
    Access Token이 만료된 경우 Refresh Token을 이용하여 자동으로 재발급
    """
    token = credentials.credentials  # Authorization 헤더에서 Access Token 추출

    try:
        # Access Token 검증
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )
        
    except ExpiredSignatureError:
        # **Access Token이 만료된 경우 → Refresh Token을 사용하여 새 Access Token 발급**
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token expired. Please login again."
            )

        try:
            # Refresh Token 검증
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")

            if email is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

            # Redis에서 저장된 Refresh Token 검증
            stored_token = redis_client.get(f"refresh_token:{email}")
            if stored_token != refresh_token:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

            # 새로운 Access Token 발급
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(data={"sub": email}, expires_delta=access_token_expires)

            # **쿠키에 새로운 Access Token 저장**
            if response:
                response.set_cookie(
                    key="access_token",
                    value=access_token,
                    httponly=True,
                    max_age=int(access_token_expires.total_seconds())
                )

            return user_crud.get_user_by_email(db, email)

        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token",
        )

    # DB에서 사용자 정보 가져오기
    user = user_crud.get_user_by_email(db, email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user  # 유저 객체 반환



from models import User

async def verify_user_pk(user_pk: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    특정 `user_pk`가 현재 로그인한 사용자와 동일한지    
    """
    # DB에서 `user_pk`를 기반으로 유저 조회
    target_user = user_crud.get_user(db, user_pk)
    
    if target_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # 본인이 아닌 경우 권한 없음 (403 Forbidden)
    if current_user.user_pk != target_user.user_pk:
        raise HTTPException(status_code=403, detail="You do not have permission to access this resource.")
    
    return target_user

