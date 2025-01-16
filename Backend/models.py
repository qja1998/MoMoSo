from sqlalchemy import Column, VARCHAR, Integer, TEXT, DATETIME, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base) :
    __tablename__ = "user"
    user_pk = Column(Integer, primary_key=True, autoincrement=True)
    nickname = Column(VARCHAR(20), nullable=False)
    password = Column(VARCHAR(50), nullable=False)
    user_img = Column(TEXT, nullable=True)
    
class Book(Base) : 
    __tablename__ = "book"
    book_pk = Column(Integer, nullable=False, primary_key=True,autoincrement=True)
    title = Column(TEXT, nullable=False)
    author = Column(VARCHAR(100), nullable=False)
    book_img = Column(TEXT, nullable=True)
    pub_date = Column(DATETIME, nullable=True)
    rating = Column(Integer, nullable=True, default=0)
    category = Column(VARCHAR(100), nullable=False, default=0) 

    
class BookClub(Base) :
    __tablename__ = "bookclub"
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
    __tablename__ = "rule"
    meeting_pk = Column(Integer, primary_key=True, autoincrement=True)
    rule_pk = Column(Integer, primary_key=True, autoincrement=True)
    rule_content = Column(TEXT, nullable=False)

class Notice(Base) : 
    __tablename__ = "notice"
    meeting_pk = Column(Integer, primary_key=True, autoincrement=True)
    notice_pk = Column(Integer, primary_key=True, autoincrement=True)
    rule_content = Column(TEXT, nullable=False)

class UserMeeting(Base) : 
    __tablename__ = "usermeeting"
    user_id = Column(Integer, nullable=False, primary_key=True)
    meeting_pk = Column(Integer, nullable=False, primary_key=True)

class Post(Base) : 
    __tablename__ = "post"
    post_pk = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(VARCHAR(20), nullable=False)
    title = Column(VARCHAR(150), nullable=False)
    content = Column(TEXT, nullable=True)

class Note(Base):
    __tablename__ = "note"
    note_pk = Column(Integer, primary_key=True, autoincrement=True)
    speech_time = Column(DATETIME, nullable=False)
    speaker = Column(Integer, nullable=False)
    book_club_pk = Column(Integer, ForeignKey("club.pk"))
    book_club = relationship("BookClub", back_populates="bookclub")

class Conference(Base):
    __tablename__ = "conference"
    conference_pk = Column(Integer, primary_key=True, autoincrement=True)
    call_start_time = Column(DATETIME, nullable=False)
    call_end_time = Column(DATETIME, nullable=False)
    thumbnail = Column(TEXT, default="")
    title = Column(VARCHAR(100), nullable=False)
    description = Column(TEXT, nullable=False)

    owner_pk = Column(Integer, ForeignKey("user.pk"))
    owner = relationship("User", back_populates="userconference")



class ConferenceHistory(Base):
    __tablename__ = "conference_history"
    conference_history_pk = Column(Integer, primary_key=True, autoincrement=True)
    book_pk = Column(Integer, ForeignKey("book.book_pk"), nullable=False)
    conference_pk = Column(Integer, ForeignKey("conference.conference_pk"), nullable=False)

    book = relationship("Book", back_populates="conference_history")
    conference = relationship("Conference", back_populates="")