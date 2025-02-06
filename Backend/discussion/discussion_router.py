from fastapi import Depends, HTTPException, APIRouter, status
from sqlalchemy.orm import Session
from typing import List

from . import discussion_crud, discussion_schema
from database import get_db

app = APIRouter(
    prefix='/api/v1/discussion',
)

@app.get('/', description="토론 방 전체 조회", response_model=List[discussion_schema.Discussion])
def get_all_discussions(db:Session=Depends(get_db)):
    """
    모든 토론 방 목록 조회.
    """
    discussions = discussion_crud.get_discussions(db)
    return discussions

@app.get("/{discussion_pk}", response_model=discussion_schema.Discussion)
def get_discussion(discussion_pk: int, db: Session = Depends(get_db)):
    """
    특정 토론 방 조회.
    """
    discussion = discussion_crud.get_discussion(db, discussion_pk)
    return discussion

@app.post("/", response_model=discussion_schema.Discussion, status_code=status.HTTP_201_CREATED)
def create_discussion(discussion: discussion_schema.NewDiscussionForm, db: Session = Depends(get_db)):
    """
    새로운 토론 방 생성.
    """
    new_discussion = discussion_crud.create_discussion(db, discussion)
    return new_discussion

@app.post("/{discussion_pk}/participants/{user_pk}", response_model=discussion_schema.Discussion, description="토론방 유저 참여")
def add_participant(discussion_pk: int, user_pk: int, db: Session = Depends(get_db)):
    """
    토론 방에 유저 참여.
    """
    updated_discussion = discussion_crud.add_participant(db, discussion_pk, user_pk)
    return updated_discussion

@app.delete("/{discussion_pk}/participants/{user_pk}", response_model=discussion_schema.Discussion, description="토론방 유저 삭제")
def remove_participant(discussion_pk: int, user_pk: int, db: Session = Depends(get_db)):
    """
    토론 방에서 유저 삭제.
    """
    updated_discussion = discussion_crud.remove_participant(db, discussion_pk, user_pk)
    return updated_discussion

@app.put("/{discussion_pk}", response_model=discussion_schema.Discussion)
def update_discussion(discussion_pk: int, discussion_update: discussion_schema.NewDiscussionForm, db: Session = Depends(get_db)):
    """
    토론 방 정보 수정.
    """
    updated_discussion = discussion_crud.update_discussion(db, discussion_pk, discussion_update)
    return updated_discussion

@app.delete("/{discussion_pk}", status_code=status.HTTP_204_NO_CONTENT)
def delete_discussion(discussion_pk: int, db: Session = Depends(get_db)):
    """
    토론 방 삭제.
    """
    discussion_crud.delete_discussion(db, discussion_pk)
    return

@app.post('/summary', description="토론 요약본 저장")
def create_discussion_summary(db:Session=Depends(get_db)):
    """
    AI 쪽에서 정보 받아와서 저장 필요
    """
    pass