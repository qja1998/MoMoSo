from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models import Discussion, Novel, User, Episode
from . import discussion_schema

def get_discussions(db: Session) -> List[Discussion]:
    """
    모든 토론 방 목록 조회
    """
    discussions = db.query(Discussion).all()
    return discussions

def get_discussion(db: Session, discussion_pk: int) -> Discussion:
    """
    특정 토론 방 조회
    """
    discussion = db.query(Discussion).filter(Discussion.discussion_pk == discussion_pk).first()
    if not discussion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discussion not found")
    return discussion

def create_discussion(db: Session, discussion: discussion_schema.NewDiscussionForm) -> Discussion:
    """
    새로운 토론 방 생성
    """
    # 1. Novel, User 존재 확인
    novel = db.query(Novel).filter(Novel.novel_pk == discussion.novel_pk).first()
    user = db.query(User).filter(User.user_pk == discussion.user_pk).first()

    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novel not found")
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 2. Discussion 생성
    new_discussion = Discussion(
        novel_pk=discussion.novel_pk,
        topic=discussion.topic,
        category=discussion.category,
        start_time=discussion.start_time,
        max_participants=discussion.max_participants,
    )

    # 3. 토론 생성자 자동 참여
    new_discussion.participants.append(user)

    db.add(new_discussion)
    db.commit()
    db.refresh(new_discussion)

    return new_discussion


def add_participant(db: Session, discussion_pk: int, user_pk: int) -> Discussion:
    """
    토론 방에 유저 참여
    """
    # 1. Discussion, User 존재 확인
    discussion = db.query(Discussion).filter(Discussion.discussion_pk == discussion_pk).first()
    user = db.query(User).filter(User.user_pk == user_pk).first()

    if not discussion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discussion not found")
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 2. 참여자 수 제한 확인
    if len(discussion.participants) >= discussion.max_participants:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maximum number of participants reached")

    # 3. 이미 참여한 유저인지 확인
    if user in discussion.participants:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already participating in this discussion")

    # 4. 유저 참여
    discussion.participants.append(user)
    db.commit()
    db.refresh(discussion)

    return discussion


def remove_participant(db: Session, discussion_pk: int, user_pk: int) -> Discussion:
    """
    토론 방에서 유저 삭제
    """
    # 1. Discussion, User 존재 확인
    discussion = db.query(Discussion).filter(Discussion.discussion_pk == discussion_pk).first()
    user = db.query(User).filter(User.user_pk == user_pk).first()

    if not discussion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discussion not found")
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # 2. 유저가 토론 방에 참여하고 있는지 확인
    if user not in discussion.participants:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is not participating in this discussion")

    # 3. 유저 삭제
    discussion.participants.remove(user)
    db.commit()
    db.refresh(discussion)

    return discussion


def update_discussion(db: Session, discussion_pk: int, discussion_update: discussion_schema.NewDiscussionForm) -> Discussion:
    """
    토론 방 정보 수정
    """
    discussion = db.query(Discussion).filter(Discussion.discussion_pk == discussion_pk).first()
    if not discussion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discussion not found")

    # Update discussion attributes
    discussion.novel_pk = discussion_update.novel_pk
    discussion.topic = discussion_update.topic
    discussion.category = discussion_update.category
    discussion.start_time = discussion_update.start_time
    discussion.max_participants = discussion_update.max_participants

    db.commit()
    db.refresh(discussion)
    return discussion

def delete_discussion(db: Session, discussion_pk: int):
    """
    토론 방 삭제
    """
    discussion = db.query(Discussion).filter(Discussion.discussion_pk == discussion_pk).first()
    if not discussion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discussion not found")

    db.delete(discussion)
    db.commit()
    return