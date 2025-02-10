from sqlalchemy.orm import Session
from fastapi import HTTPException

import models
from models import User, Novel, Comment, CoComment
from sqlalchemy.sql import func

from passlib.context import CryptContext
from . import user_schema
from auth import auth_schema

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_users(db: Session):
    """
    데이터베이스에서 전체 사용자 조회
    :param db: SQLAlchemy 세션
    :return: User 리스트
    """
    return db.query(User).all()


def get_user(db: Session, user_id: int):
    """
    데이터베이스에서 특정 사용자 조회
    :param db: SQLAlchemy 세션
    :param user_id: 조회할 사용자의 ID
    :return: User 객체 또는 None
    """
    return db.get(User, user_id)

def get_user_profile(db: Session, user_id: int):
    """
    데이터베이스에서 특정 사용자 프로필 정보 조회
    :param db: SQLAlchemy 세션
    """
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not Found")
    
    novels_written  = db.query(Novel).filter(Novel.user_pk == user_id).all()
    comments = db.query(Comment).filter(Comment.user_pk == user_id).all()
    cocomments = db.query(CoComment).filter(CoComment.user_pk == user_id).all()
    recent_novels = user.recent_novels

    return user_schema.UserDetail(
        user_pk=user.user_pk,
        name=user.name,
        nickname=user.nickname,
        user_img=user.user_img,
        recent_novels=recent_novels,
        liked_novels=user.liked_novels,
        liked_comments=user.liked_comments,
        liked_cocomments=user.liked_cocomments,
        comments=comments,
        cocomments=cocomments,
        novels_written=novels_written or [],
    )


def get_user_by_email(db: Session, email: str):
    """
    데이터베이스에서 이메일로 특정 사용자 조회
    :param db: SQLAlchemy 세션
    :param email: 조회할 이메일
    :return: User 객체 또는 None
    """
    return db.query(User).filter(User.email == email).first()

def get_user_by_nickname(db: Session, nickname: str):
    """
    데이터베이스에서 닉네임으로 특정 사용자 조회
    :param db: SQLAlchemy 세션
    :param email: 조회할 이메일
    :return: User 객체 또는 None
    """
    return db.query(User).filter(User.nickname == nickname).first()

def get_user_by_name_and_phone(db: Session, name: str, phone: str):
    """
    이름과 전화번호로 사용자 조회 : 아이디 찾기용
    :param db: SQLAlchemy 세션
    :param name: 사용자의 이름
    :param phone: 사용자의 전화번호
    :return: User 객체 또는 None
    """
    return db.query(User).filter(User.name == name, User.phone == phone).first()

def update_user(db: Session, user: User, updated_user: user_schema.UpdateUserForm):
    """
    특정 사용자 정보 수정
    :param db: SQLAlchemy 세션
    :param user: 정보 수정할 유저
    :param updated_user: 사용자가 입력한 수정 정보
    :return: User 객체 또는 None
    """
    # 닉네임 수정
    if updated_user.nickname:
        # 닉네임 중복 확인
        existing_user = db.query(User).filter(User.nickname == updated_user.nickname).first()
        if existing_user and existing_user.user_pk != user.user_pk:
            raise HTTPException(status_code=409, detail="Nickname is already in use")
        user.nickname = updated_user.nickname
    
    # 전화번호 수정 (이미 인증된 경우)
    if updated_user.phone and updated_user.phone != user.phone:
        user.phone = updated_user.phone

    # 유저 이미지 수정
    if updated_user.user_img:
        user.user_img = updated_user.user_img

    # 데이터베이스 업데이트
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: models.User):
    """
    데이터베이스에서 사용자 삭제
    :param db: SQLAlchemy 세션
    :param user: 삭제할 유저
    """
    db.delete(user)
    db.commit()

def save_recent_novel(db: Session, user_pk: int, novel_pk: int):
    """
    로그인한 사용자가 조회한 소설을 최근 본 소설 목록에 저장
    """
    # 해당 소설이 존재하는지 확인
    novel = db.query(Novel).filter(Novel.novel_pk == novel_pk).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")

    # 이미 최근 본 소설 목록에 있는지 확인
    existing_entry = db.execute(
        models.user_recent_novel_table.select()
        .where(models.user_recent_novel_table.c.user_pk == user_pk)
        .where(models.user_recent_novel_table.c.novel_pk == novel_pk)
    ).fetchone()

    if existing_entry:
        # 기존 조회 기록이 있다면, viewed_date 갱신
        db.execute(
            models.user_recent_novel_table.update()
            .where(models.user_recent_novel_table.c.user_pk == user_pk)
            .where(models.user_recent_novel_table.c.novel_pk == novel_pk)
            .values(viewed_date=func.now())
        )
    else:
        # 새로운 조회 기록을 추가
        db.execute(
            models.user_recent_novel_table.insert().values(user_pk=user_pk, novel_pk=novel_pk, viewed_date=func.now())
        )

    db.commit()
    return {"message": "Recent novel updated successfully"}