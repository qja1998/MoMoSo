
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
# from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse

# 데이터베이스 연결
from database import engine
from models import Base
# 카카오 로그인
# from user.kakao_manager import KaKaoAPI

# Middleware를 사용하기 위해서 필요하다고 함.secrete key생성용임. 
import secrets
secret_key = secrets.token_urlsafe(32) 


app = FastAPI()
# app.add_middleware(SessionMiddleware, secret_key=secret_key)

# 테이블 자동 생성
Base.metadata.create_all(bind=engine)

# 라우터 연결
from user import user_router
from auth import auth_router
from auth.oauth_google import router as google_oauth_router

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 설정
app.include_router(auth_router.app, tags=["auth"])
app.include_router(user_router.app, tags=["user"])
app.include_router(google_oauth_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"Hello":"World"}