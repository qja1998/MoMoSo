from pydantic import BaseModel, FutureDatetime, field_validator
from typing import List, Optional, Annotated, Any
from datetime import datetime
from fastapi import HTTPException, status
from pydantic_core.core_schema import ValidationInfo

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

    class Config:
        from_attributes = True

# Novel 스키마 (토론과 연결된 소설 정보)
class DiscussionNovel(BaseModel):
    novel_pk: int
    title: str

    class Config:
        from_attributes = True

# 토론 조회
class Discussion(BaseModel):
    discussion_pk: int
    session_id: Optional[str]
    novel: DiscussionNovel
    episode: Optional[DiscussionEpisode] = None
    topic: str
    start_time: datetime
    end_time: Optional[datetime] = None
    participants: List[DiscussionUser]

    class Config:
        from_attributes = True

# 토론 생성 후 조회
class GetNewDiscussion(BaseModel):
    novel_pk: int
    ep_pk: Optional[int] = None
    session_id: str
    category: bool
    topic: str
    start_time: datetime
    max_participants: int

    class Config:
        from_attributes = True


# 토론 생성
class NewDiscussionForm(BaseModel):
    novel_pk: int
    topic: str
    category: bool
    ep_pk: Optional[int] = None
    start_time: Annotated[FutureDatetime, "Must be a future datetime"]
    max_participants: int

    # category=1이면 ep_pk가 필수 검증(필수값 여부 검증)
    @field_validator("ep_pk")
    @classmethod
    def check_episode_pk(cls, ep_pk: Optional[int], values: ValidationInfo) -> Optional[int]:
        if values.data.get("category") == 1 and ep_pk is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="When category is 1, ep_pk (episode_pk) is required."
            )
        return ep_pk

    class Config:
        from_attributes = True




# 토론 요약본 조회
class Note(BaseModel):
    summary: str


# 소설 생성 AI 모델 응답용 스키마

# 토론 요약본 생성
class SummaryRequest(BaseModel):
    discussion_pk: int
    content: dict = {
        "id": str,
        "room_name": str,
        "host_name": str,
        "start_time": str,
        "end_time": str,
        "duration": int,
        "participants": list,
        "messages": list
    }

class MeetingMinutesRequest(BaseModel):
    discussion_pk: int
    room_name: str
    host_name: str
    start_time: str
    end_time: str
    duration: float
    participants: List[Any]  # 또는 더 구체적인 타입 지정 가능
    messages: List[Any] 

class FactCheckRequest(BaseModel):
    discussion_pk: int
    content: str

class SubjectRequest(BaseModel):
    discussion_pk: int
    content: dict = {
        "id": str,
        "room_name": str,
        "host_name": str,
        "start_time": str,
        "end_time": str,
        "duration": int,
        "participants": list,
        "messages": list
    }