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
