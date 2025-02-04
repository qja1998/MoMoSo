from pydantic import BaseModel, Field, EmailStr, field_validator
from fastapi import HTTPException

# 사용자 조회
class User(BaseModel):
    user_pk: int
    email: str
    name: str
    nickname: str
    phone: str
    user_img: str

    class Config:
        orm_mode = True

# 사용자 정보 수정
class UpdateUserForm(BaseModel):
    nickname: str = Field(None, min_length=1, max_length=50, description="수정할 닉네임")
    phone: str = Field(None, description="수정할 전화번호")
    user_img: str = Field(None, description="수정할 유저 이미지")


    class Config:
        extra = "forbid"  # 정의되지 않은 필드는 허용하지 않음

    @field_validator('phone')
    @classmethod
    def check_phone_format(cls, v):
        if v and (not v.startswith("010") or len(v) != 13 or '-' not in v):
            raise HTTPException(status_code=422, detail="전화번호는 '010-XXXX-XXXX' 형식으로 입력해야 합니다.")
        return v


class DeleteUserForm(BaseModel):
    email: EmailStr = Field(..., description="사용자 이메일")
    password: str = Field(..., description="사용자 비밀번호")