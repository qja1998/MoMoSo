from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from typing import Optional

from app.schemas.user import UserLoginRequest, UserLoginResponse
from app.services.user_service import UserService
from app.utils.jwt_utils import create_access_token

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Auth"]
)

# 비밀번호 해싱을 위한 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthController:
    def __init__(self):
        self.user_service = UserService()

    @router.post("/login", response_model=UserLoginResponse)
    async def login(self, login_info: UserLoginRequest):
        """
        로그인 API
        
        Args:
            login_info: 아이디와 패스워드를 포함한 로그인 정보
            
        Returns:
            UserLoginResponse: 로그인 결과 및 액세스 토큰
            
        Raises:
            HTTPException: 인증 실패시 401 에러
        """
        user_id = login_info.id
        password = login_info.password
        
        # 사용자 조회
        user = self.user_service.get_user_by_user_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # 비밀번호 검증
        if pwd_context.verify(password, user.password):
            # 토큰 생성
            access_token = create_access_token(user_id)
            return UserLoginResponse(
                status_code=200,
                message="Success",
                access_token=access_token
            )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
