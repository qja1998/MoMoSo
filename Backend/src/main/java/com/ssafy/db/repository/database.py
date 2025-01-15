from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base



DB_URL = "mysql://stg-yswa-kr-practice-db-master.mariadb.database.azure.com:3306/S12P11B106?serverTimezone=UTC&useUnicode=true&characterEncoding=utf8"

engine = create_engine(DB_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False)

Base = declarative_base()
