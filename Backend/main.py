from fastapi import FastAPI
import os
from contextlib import asynccontextmanager
from redis.asyncio import Redis
from concurrent.futures import ThreadPoolExecutor
from utils.redis_utils import create_redis_client

from user import user_router
from auth import auth_router
from novel import novel_router
from discussion import discussion_router
from auth.oauth_google import router as google_oauth_router

from database import engine
from models import Base

thread_pool = None # ThreadPoolExecutor를 전역 변수로 선언

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 애플리케이션 수명 주기 관리 (Redis 및 ThreadPool 초기화 및 종료)"""
    global thread_pool
    try:
        print("🚀 FastAPI 서버 시작 - lifespan 시작됨!")
        
        # Redis 클라이언트 생성
        app.state.redis = await create_redis_client()
        print("✅ Redis 연결 완료!")
        
        # ThreadPoolExecutor 초기화
        thread_pool = ThreadPoolExecutor(max_workers=4)
        print("✅ ThreadPoolExecutor 초기화 완료!")
        
        # 라우터 등록
        app.include_router(auth_router.router, tags=["auth"])
        app.include_router(user_router.router, tags=["user"])
        app.include_router(novel_router.router, tags=["novel"])
        app.include_router(discussion_router.router, tags=["discussion"])
        app.include_router(google_oauth_router, tags=["oauth"], prefix="/api/v1")
        
        yield
        
    except Exception as e:
        print(f"❌ 서버 초기화 실패: {e}")
        raise
    finally:
        # Redis 연결 종료
        if hasattr(app.state, "redis"):
            await app.state.redis.close()
        
        # ThreadPoolExecutor 종료
        if thread_pool:
            thread_pool.shutdown(wait=True)
            print("✅ ThreadPoolExecutor 정상 종료!")
            
        print("🛑 FastAPI 서버 종료!")

app = FastAPI(lifespan=lifespan)

# CORS 설정
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    "http://172.23.144.1:5173",
    "http://172.20.10.9:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "DELETE", "PATCH", "PUT"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=True,
    )