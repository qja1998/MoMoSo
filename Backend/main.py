from fastapi import FastAPI, Depends, HTTPException

# 데이터베이스 연결
from .database import SessionLocal, engine, get_db, Base
from . import models


app = FastAPI()

# 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Hello":"World"}