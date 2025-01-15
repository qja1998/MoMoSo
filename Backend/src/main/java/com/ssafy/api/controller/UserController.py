from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Optional

from app.schemas.user import (
    UserRegisterRequest, 
    UserResponse, 
    BaseResponseBody
)
from app.services.user_service import UserService
from app.utils.auth import get_current_user
from app.models.user import User

# 라우터 설정
router = APIRouter(
    prefix="/api/v1/users",
    tags=["User"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserController:
    def __init__(self):
        self.user_service = UserService()

    @router.post(
        "",
        response_model=BaseResponseBody,
        responses={
            200: {"description": "성공"},
            401: {"description": "인증 실패"},
            404: {"description": "사용자 없음"},
            500: {"description": "서버 오류"}
        }
    )
    async def register(self, register_info: UserRegisterRequest):
        """
        회원 가입 API
        
        Args:
            register_info: 회원가입 정보
            
        Returns:
            BaseResponseBody: 회원가입 결과
        """
        # 사용자 생성
        user = self.user_service.create_user(register_info)
        
        return BaseResponseBody(
            status_code=200,
            message="Success"
        )

    @router.get(
        "/me",
        response_model=UserResponse,
        responses={
            200: {"description": "성공"},
            401: {"description": "인증 실패"},
            404: {"description": "사용자 없음"},
            500: {"description": "서버 오류"}
        }
    )
    async def get_user_info(self, current_user: User = Depends(get_current_user)):
        """
        회원 본인 정보 조회 API
        
        Args:
            current_user: 현재 인증된 사용자 (토큰에서 추출)
            
        Returns:
            UserResponse: 사용자 정보
        """
        return UserResponse.from_orm(current_user)
