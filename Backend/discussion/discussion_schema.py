from pydantic import BaseModel, FutureDatetime
from typing import List, Optional
from datetime import datetime

# 토론 조회 시 전달하는 유저 정보
class DiscussionUser(BaseModel):
    user_pk: int
    name: str
    nickname: str

    class Config:
        from_attributes = True

# Episode 스키마 (Novel에 연결된 에피소드 제목)
class DiscussionEpisode(BaseModel):
    ep_pk: int
    ep_title: str
    created_date: datetime

    class Config:
        from_attributes = True

# Novel 스키마 (토론과 연결된 소설 정보)
class DiscussionNovel(BaseModel):
    novel_pk: int
    title: str
    created_date: datetime
    episodes: List[DiscussionEpisode]  # Novel에 연결된 에피소드 목록

    class Config:
        from_attributes = True

# 토론 조회
class Discussion(BaseModel):
    discussion_pk: int
    novel_pk: int
    topic: str
    start_time: FutureDatetime
    end_time: datetime
    novel: DiscussionNovel
    participants: List[DiscussionUser]

    class Config:
        from_attributes = True


# 토론 생성
class NewDiscussionForm(BaseModel):
    novel_pk: int
    topic: str
    category: bool
    start_time: datetime
    max_participants: int

    class Config:
        from_attributes = True


# 토론 요약본 생성
class NewNoteForm(BaseModel):
    novel_pk: int
    user_pk: int
    summary: str


# 토론 요약본 조회
class Note(BaseModel):
    summary: str