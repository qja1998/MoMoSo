from pydantic import BaseModel, field_validator, Field
from typing import Optional
from typing import List

# 장르 선택


# 소설 생성 요청
class NovelCreateBase(BaseModel):
    title: str
    worldview: str
    synopsis: str
    genres: List = Field(default_factory=list) 
    @field_validator("title")
    @classmethod
    def validate_not_empty(cls, v):
        if not v.strip():
            raise ValueError("이 필드는 비워둘 수 없습니다.")
        return v
    @field_validator("genres")
    @classmethod
    def validate_genre_not_empty(cls, v):
        if not v : 
            raise ValueError("이 필드는 비워둘 수 없습니다.")



# 소설 기본 정보 (응답용)
class NovelBase(NovelCreateBase):
    novel_pk: int
    num_episode: int = 0
    likes: int = 0
    views: int = 0
    is_completed: bool = False

    class Config:
        from_attributes = True
