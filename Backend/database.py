from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

user = os.getenv("DB_USER")
passwd = os.getenv("DB_PASSWD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
db = os.getenv("DB_NAME")

DB_URL = f'mysql+pymysql://{user}:{passwd}@{host}:{port}/{db}?charset=utf8mb4'

pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "10"))
pool_recycle = int(os.getenv("DB_POOL_RECYCLE", "3600"))
pool_pre_ping = os.getenv("DB_POOL_PRE_PING", "true").lower() == "true"

engine = create_engine(
    DB_URL,
    echo=True,
    pool_size=pool_size,
    max_overflow=max_overflow,
    pool_recycle=pool_recycle,
    pool_pre_ping=pool_pre_ping
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()