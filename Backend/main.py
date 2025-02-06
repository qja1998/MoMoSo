
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
# from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse

# 데이터베이스 연결
from database import engine
from models import Base


#테스트 후 삭제할 것.

# 카카오 로그인
# from user.kakao_manager import KaKaoAPI

# Middleware를 사용하기 위해서 필요하다고 함.secrete key생성용임. 
import secrets
secret_key = secrets.token_urlsafe(32) 


app = FastAPI()
# app.add_middleware(SessionMiddleware, secret_key=secret_key)

# 테이블 자동 생성
Base.metadata.create_all(bind=engine)


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
from novel import novel_router

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 설정

# user 라우터
app.include_router(auth_router.app, tags=["auth"])
app.include_router(user_router.app, tags=["user"])


# novel 라우터
app.include_router(novel_router.app, tags=["novel"])