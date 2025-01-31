from pydantic import BaseModel, Field, EmailStr, validator
from fastapi import HTTPException
from typing import Optional
from datetime import datetime

# 휴대전화 인증
class SmsRequest(BaseModel):
    phone: str

    @validator("phone")
    def validate_phone(cls, v):
        v = v.strip()

        # 기본 형식 검증
        if not v.startswith("010") or len(v) != 13 or '-' not in v:
            raise HTTPException(
                status_code=422,
                detail=f"전화번호는 '010-XXXX-XXXX' 형식이어야 합니다. 입력값: {v}"
            )
        return v

# 이메일 인증
class EmailVerificationRequestSchema(BaseModel):
    email: EmailStr
    name: str

class EmailVerificationSchema(BaseModel):
    email: EmailStr
    code: str
    name: str

class ResetPasswordSchema(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=128, description="새로운 비밀번호")
    confirm_password: str = Field(..., min_length=8, max_length=128, description="비밀번호 확인")


# id 찾기 검증
class FindIdRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="사용자 이름")
    phone: str

    @validator("phone")
    def validate_phone(cls, v):
        v = v.strip()

        # 기본 형식 검증
        if not v.startswith("010") or len(v) != 13 or '-' not in v:
            raise HTTPException(
                status_code=422,
                detail=f"전화번호는 '010-XXXX-XXXX' 형식이어야 합니다. 입력값: {v}"
            )
        return v

class Token(BaseModel):
    acess_token : str
    token_type : str


# 사용자 가입 폼
class NewUserForm(BaseModel):
    email: EmailStr = Field(..., description="이메일은 필수 항목입니다.")
    name: str = Field(..., min_length=1, max_length=50, description="이름을 입력해주세요.")
    nickname: str = Field(..., min_length=1, max_length=50, description="닉네임을 입력해주세요.")
    phone: str
    password: str
    confirm_password: str
    user_img: str = "static_url"  # 기본값 설정


    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8 or not any(char.isdigit() for char in v) or not any(char.isalpha() for char in v) or not any(char in "!@#$%^&*()-_=+[]{}|;:',.<>?/~`" for char in v):
            raise HTTPException(status_code=422, detail="비밀번호는 8자리 이상, 영문, 숫자, 특수문자를 포함해야 합니다.")
        return v
    
    @validator('confirm_password')
    def validate_confirm_password(cls, v, values):
        """
        비밀번호 확인 필드 검증
        """
        if 'password' in values and v != values['password']:
            raise HTTPException(status_code=422, detail="입력한 비밀번호가 일치하지 않습니다.")
        return v