from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
# from mysql import connector
import os
from fastapi import Depends
from sqlalchemy.orm import Session
from fastapi_users.db import SQLAlchemyUserDatabase
# from .models import User, OAuthAccount

load_dotenv()

user = os.getenv("DB_USER")
passwd = os.getenv("DB_PASSWD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
db = os.getenv("DB_NAME")

DB_URL = f'mysql+pymysql://{user}:{passwd}@{host}:{port}/{db}?charset=utf8'

engine = create_engine(DB_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_db(db: Session = Depends(get_db)):
    """
    OAuth2 로그인 시 User + OAuth 계정 정보 DB 제공
    """
    from models import User, OAuthAccount  # ✅ 순환 참조 방지: 함수 내부에서 import
    yield SQLAlchemyUserDatabase(db, User, OAuthAccount)