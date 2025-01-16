from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base

import os
load_dotenv()

user = os.getenv("DB_USER")     # "root"
passwd = os.getenv("DB_PASSWD") # "1234"
host = os.getenv("DB_HOST")     # "127.0.0.1"
port = os.getenv("DB_PORT")     # "3306"
db = os.getenv("DB_NAME")       # "mydb"    

DB_URL = f'mysql://{user}:{passwd}@{host}:{port}/{db}?charset=utf8'

print(DB_URL)

engine = create_engine(DB_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()