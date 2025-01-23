from fastapi import FastAPI

# 아래 3줄은 자동으로 테이블 생성성
import models
from database import engine
models.Base.metadata.create_all(bind=engine)

from board import board_router
from user import user_router

app = FastAPI()

# 라우터 등록록
app.include_router(board_router.app, tags=["board"])
app.include_router(user_router.app, tags=["user"])

@app.get("/")
def read_root():
    return {"Hello":"World"}