from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base




Base = declarative_base()

# User와 Novel의 M:N 관계를 위한 연결 테이블
user_like_table = Table(
    "userlike",
    Base.metadata,
    Column("novel_pk", Integer, ForeignKey("novel.novel_pk"), primary_key=True),
    Column("user_pk", Integer, ForeignKey("users.user_pk"), primary_key=True),
)

# User와 Comment 간의 M:N 관계를 위한 연결 테이블 (댓글 좋아요)
user_comment_like_table = Table(
    "user_comment_like",
    Base.metadata,
    Column("user_pk", Integer, ForeignKey("users.user_pk"), primary_key=True),
    Column("comment_pk", Integer, ForeignKey("comment.comment_pk"), primary_key=True),
)

# User와 CoComment 간의 M:N 관계를 위한 연결 테이블 (대댓글 좋아요)
user_cocomment_like_table = Table(
    "user_cocomment_like",
    Base.metadata,
    Column("user_pk", Integer, ForeignKey("users.user_pk"), primary_key=True),
    Column("cocomment_pk", Integer, ForeignKey("cocomment.cocomment_pk"), primary_key=True),
)

novel_genre_table = Table(
    "novel_genre",
    Base.metadata,
    Column("novel_pk", Integer, ForeignKey("novel.novel_pk"), primary_key=True),
    Column("genre_pk", Integer, ForeignKey("genre.genre_pk"), primary_key=True),
)

# User Model
class User(Base):
    __tablename__ = "users"

    user_pk = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(50), nullable=False)
    nickname = Column(String(50), unique=True, nullable=False)
    phone = Column(String(50), nullable=False)
    password = Column(String(255), nullable=False)
    user_img = Column(Text, default="static_url")

    # M:N 관계 설정 (소설 좋아요)
    liked_novels = relationship("Novel", secondary=user_like_table, back_populates="liked_users")

    # M:N 관계 설정 (댓글 좋아요)
    liked_comments = relationship("Comment", secondary=user_comment_like_table, back_populates="liked_users")

    # M:N 관계 설정 (대댓글 좋아요)
    liked_cocomments = relationship("CoComment", secondary=user_cocomment_like_table, back_populates="liked_users")

    # 1:N 관계 설정 (작성한 댓글)
    comments = relationship("Comment", back_populates="user")

    # 1:N 관계 설정 (작성한 대댓글)
    cocomments = relationship("CoComment", back_populates="user")

# Novel Model (Synopsis와 병합됨)
class Novel(Base):
    __tablename__ = "novel"

    novel_pk = Column(Integer, primary_key=True, autoincrement=True)
    user_pk = Column(Integer, ForeignKey("users.user_pk"), nullable=False)
    title = Column(String(200), nullable=False)
    worldview = Column(Text, nullable=False)
    synopsis = Column(Text, nullable=False)  # = description
    novel_img = Column(Text, default="static_url")
    created_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime, default=func.now(), onupdate=func.now())
    num_episode = Column(Integer, default=0)
    likes = Column(Integer, default=0)
    views = Column(Integer, default=0)
    
    is_completed = Column(Boolean, default=False)

    # M:N 관계 설정
    liked_users = relationship("User", secondary=user_like_table, back_populates="liked_novels")

    # 장르 M:N 관계
    genres = relationship("Genre", secondary=novel_genre_table, back_populates="novels")

    @property
    def genre_names(self):
        return [genre.genre for genre in self.genres]


class Genre(Base) : 
    __tablename__ = "genre"
    genre_pk = Column(Integer, primary_key=True, autoincrement=True)  # Add a primary key
    genre = Column(String(50), nullable=False, unique=True) # Genre name should be unique
    # M:N relationship with Novel
    novels = relationship("Novel", secondary=novel_genre_table, back_populates="genres")


# Character Model (synopsis_fk -> novel_fk로 변경)
class Character(Base):
    __tablename__ = "character"

    character_pk = Column(Integer, primary_key=True, autoincrement=True)
    novel_pk = Column(Integer, ForeignKey("novel.novel_pk"), nullable=False)
    name = Column(String(20), nullable=False)
    role = Column(String(20), nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(Boolean, nullable=False)  # 0 for male, 1 for female
    job = Column(String(20), nullable=False)
    profile = Column(Text, nullable=False)

# Episode Model
class Episode(Base):
    __tablename__ = "episode"

    ep_pk = Column(Integer, primary_key=True, autoincrement=True)
    ep_title = Column(String(255), nullable=False)
    novel_pk = Column(Integer, ForeignKey("novel.novel_pk"), nullable=False)
    created_date = Column(DateTime, default=func.now())
    updated_date = Column(DateTime, default=func.now(), onupdate=func.now())
    views = Column(Integer, default=0)
    comment_cnt = Column(Integer, default=0)
    ep_content = Column(Text, nullable=False)

# Comment Model
class Comment(Base):
    __tablename__ = "comment"

    comment_pk = Column(Integer, primary_key=True, autoincrement=True)
    novel_pk = Column(Integer, ForeignKey("novel.novel_pk"), nullable=False)
    ep_pk = Column(Integer, ForeignKey("episode.ep_pk"), nullable=False)
    user_pk = Column(Integer, ForeignKey("users.user_pk"), nullable=False)
    created_date = Column(DateTime, default=func.now())
    content = Column(Text, nullable=False)
    cocomment_cnt = Column(Integer, default=0)
    likes = Column(Integer, default=0)

    # M:N 관계 설정 (댓글 좋아요)
    liked_users = relationship("User", secondary=user_comment_like_table, back_populates="liked_comments")

    # 1:N 관계 설정 (작성한 사용자)
    user = relationship("User", back_populates="comments")

    # 1:N 관계 설정 (대댓글)
    cocomments = relationship("CoComment", back_populates="comment")

# CoComment Model
class CoComment(Base):
    __tablename__ = "cocomment"

    cocomment_pk = Column(Integer, primary_key=True, autoincrement=True)
    user_pk = Column(Integer, ForeignKey("users.user_pk"), nullable=False)
    comment_pk = Column(Integer, ForeignKey("comment.comment_pk"), nullable=False)
    created_date = Column(DateTime, default=func.now())
    content = Column(Text, nullable=False)
    likes = Column(Integer, default=0)

    # M:N 관계 설정 (대댓글 좋아요)
    liked_users = relationship("User", secondary=user_cocomment_like_table, back_populates="liked_cocomments")

    # 1:N 관계 설정 (작성한 사용자)
    user = relationship("User", back_populates="cocomments")

    # 1:N 관계 설정 (댓글)
    comment = relationship("Comment", back_populates="cocomments")

# Discussion Model
class Discussion(Base):
    __tablename__ = "discussion"

    discussion_pk = Column(Integer, primary_key=True, autoincrement=True)
    novel_pk = Column(Integer, ForeignKey("novel.novel_pk"), nullable=False)
    user_pk = Column(Integer, ForeignKey("users.user_pk"), nullable=False)
    title = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    start_time = Column(DateTime, default=func.now())
    end_time = Column(DateTime)

# Note Model
class Note(Base):
    __tablename__ = "note"

    note_pk = Column(Integer, primary_key=True, autoincrement=True)
    novel_pk = Column(Integer, ForeignKey("novel.novel_pk"), nullable=False)
    user_pk = Column(Integer, ForeignKey("users.user_pk"), nullable=False)
    summary = Column(Text, nullable=False)
