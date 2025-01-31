# from fastapi import APIRouter, Depends
# from fastapi_users.router.oauth import get_oauth_router
# from fastapi_users.authentication import AuthenticationBackend
# from sqlalchemy.orm import Session
# from ..database import get_db
# from ..models import User, OAuthAccount
# import os

# # 환경변수에서 OAuth2 클라이언트 정보 가져오기
# GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
# GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# REDIRECT_URI = "http://localhost:8000/auth/google/callback"

# router = APIRouter()

# # OAuth2 라우터 설정
# google_oauth_router = get_oauth_router(
#     backend=AuthenticationBackend(name="jwt"),
#     client_id=GOOGLE_CLIENT_ID,
#     client_secret=GOOGLE_CLIENT_SECRET,
#     redirect_uri=REDIRECT_URI,
# )

# # Google OAuth2 로그인 후 자동 회원가입 처리
# @router.post("/auth/google/callback")
# async def google_callback(db: Session = Depends(get_db), user_info: dict = Depends(google_oauth_router.callback)):
#     """
#     Google OAuth2 로그인 후 회원가입 처리
#     """
#     email = user_info.get("email")
#     name = user_info.get("name", "Google User")
#     picture = user_info.get("picture", "default.png")

#     # 기존 사용자 조회
#     existing_user = db.query(User).filter(User.email == email).first()
    
#     if existing_user:
#         return {"message": "로그인 성공", "user": existing_user.email}
    
#     # 새 사용자 생성 (자동 회원가입)
#     new_user = User(
#         email=email,
#         name=name,
#         nickname=name,
#         phone="",  # Google OAuth2 로그인에서는 전화번호 제공 안됨
#         password="",  # Google OAuth2 로그인은 비밀번호 필요 없음
#         user_img=picture,
#     )
    
#     db.add(new_user)
#     db.commit()
    
#     return {"message": "회원가입 완료 후 로그인 성공", "user": new_user.email}

# router.include_router(google_oauth_router, prefix="/auth/google", tags=["auth"])
