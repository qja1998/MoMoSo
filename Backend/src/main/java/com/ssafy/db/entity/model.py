from sqlalchemy import Column, VARCHAR, Integer, TEXT, DATETIME
from repository import database

class User(Base) :
    __tablename__ = "user"
    user_pk = Column(Integer, primary_key=True, autoincrement=True)
    nickname = Column(VARCHAR(20), nullable=False)
    password = Column(VARCHAR(50), nullable=False)
    user_img = Column(TEXT, nullable=True)
    
class Book(Base) : 
    book_pk = Column(Integer, nullable=False, primary_key=True,autoincrement=True)
    title = Column(TEXT, nullable=False)
    author = Column(VARCHAR(100), nullable=False)
    book_img = Column(TEXT, nullable=True)
    pub_date = Column(DATETIME, nullable=True)
    rating = Column(Integer, nullable=True, default=0)
    category = Column(VARCHAR(100), nullable=False, default=0) 

    
class BookClub(Base) :
    club_pk = Column(Integer, nullable=False, primary_key=True, autoincrement=True)
    title = Column(VARCHAR(100), nullable=False)
    summary = Column(VARCHAR(150), nullable=True)
    detail = Column(TEXT, nullable=True)
    max_user = Column(Integer, default=6)
    time_freq = Column(VARCHAR, nullable=False)
    meeting_time = Column(DATETIME, nullable=False)
    last_book = Column(TEXT, nullable=True)
    next_book = Column(TEXT, nullable=True)
    next_book_img = Column(TEXT, nullable=True)

class Rule(Base) : 
    meeting_pk = Column(Integer, primary_key=True, autoincrement=True)
    rule_pk = Column(Integer, primary_key=True, autoincrement=True)
    rule_content = Column(TEXT, nullable=False)

class Notice(Base) : 
    meeting_pk = Column(Integer, primary_key=True, autoincrement=True)
    notice_pk = Column(Integer, primary_key=True, autoincrement=True)
    rule_content = Column(TEXT, nullable=False)

class UserMeeting(Base) : 
    user_id = Column(Integer, nullable=False, primary_key=True)
    meeting_pk = Column(Integer, nullable=False, primary_key=True)

class Post(Base) : 
    post_pk = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(VARCHAR(20), nullable=False)
    title = Column(VARCHAR(150), nullable=False)
    content = Column(TEXT, nullable=True)
