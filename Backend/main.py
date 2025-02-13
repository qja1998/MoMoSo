from fastapi import FastAPI
# from starlette.middleware.sessions import SessionMiddleware
import os

# 영상 보여주기 
from fastapi.staticfiles import StaticFiles

# 데이터베이스 연결
from database import engine
from models import Base

app = FastAPI()

# 테이블 자동 생성
Base.metadata.create_all(bind=engine)

# app.mount("/static", StaticFiles(path="static"), name="static")



# 라우터 연결
from user import user_router
from auth import auth_router
from novel import novel_router
from discussion import discussion_router
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
app.include_router(novel_router.app, tags=["novel"])
app.include_router(discussion_router.app, tags=["discussion"])
app.include_router(google_oauth_router, tags=["oauth"], prefix="/api/v1")

cert_key = os.path.join(os.getcwd(), "cert.key")
cert_crt = os.path.join(os.getcwd(), "cert.crt")

@app.get("/")
def read_root():
    return {"Hello":"World"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False,
        ssl_keyfile=cert_key,
        ssl_certfile=cert_crt
    )

