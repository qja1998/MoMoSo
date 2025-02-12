from pydantic import BaseModel, field_validator, Field
from typing import Optional, Dict, List
from datetime import datetime
from user.user_schema import RecentNovel

# 메인 페이지 스키마
class UserRecentNovel(BaseModel):
    user_pk: int
    name: str
    nickname: str
    recent_novels: Optional[List[RecentNovel]]

    class Config:
        from_attributes = True

class MainPageResponse(BaseModel):
    user: UserRecentNovel
    recent_best: Optional[str]  # 최근 인기 소설
    month_best: Optional[str]  # 한 달 동안 인기 소설

    class Config:
        from_attributes = True


class CharacterBase(BaseModel) :
    name : str
    role : str
    age : int 
    sex : bool
    job : str
    profile : str






class GenreGetBase(BaseModel) : 
    genre_pk: int
    genre : str

class NovelShowBase(BaseModel) : 
    novel_pk : int
    title: str
    created_date : datetime  
    updated_date : datetime   # 이거 뭐로 해야 하냐? 
    novel_img : str 
    views : int
    likes : int
    is_completed : bool
    genre: List[GenreGetBase] 
    
    class Config:
        from_attributes = True

class NovelCreateBase(BaseModel):
    title: str
    worldview: str
    synopsis: str
    genres: List[str] = Field(description="List of genre names")

    class Config:
        from_attributes = True


# 소설 기본 정보 (응답용)
class NovelBase(NovelCreateBase):
    novel_pk: int
    num_episode: int = 0
    likes: int = 0
    views: int = 0
    is_completed: bool = False

    class Config:
        from_attributes = True

    


# 소설 부분 업데이트 요청
class NovelUpdateBase(BaseModel):
    title: Optional[str] = None
    worldview: Optional[str] = None
    synopsis: Optional[str] = None
    genre: Optional[List[str]] = None
    is_completed: Optional[bool] = None
    
    #아래 부분 삭제해도 정상 작동하는지 확인
    @field_validator("title", "worldview", "synopsis")
    @classmethod
    def validate_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError("제목, 세계관, 시놉시스 필드는 비워둘 수 없습니다.")
        return v
    
    @field_validator("genre")
    @classmethod
    def validate_genre_not_empty(cls, v):
        if v is not None and not v: #none과 비어있는 리스트 모두 허용 불가
            raise ValueError("장르 필드는 비워둘 수 없습니다.")
        return v
    

# 에피소드 생성 요청
class EpisodeCreateBase(BaseModel):
    ep_title: str
    ep_content: str

    @field_validator("ep_title", "ep_content")
    @classmethod
    def validate_not_empty(cls, v):
        if not v.strip():
            raise ValueError("이 필드는 비워둘 수 없습니다.")
        return v

# 에피소드 기본 정보 (응답용)
class EpisodeBase(EpisodeCreateBase):
    ep_pk: int
    novel_pk: int
    views: int = 0
    comment_cnt: int = 0

    class Config:
        from_attributes = True


class EpisodeUpdateBase(BaseModel) : 
    ep_title: Optional[str] = None
    ep_content: Optional[str] = None


# 댓글 생성 요청
class CommentBase(BaseModel):
    content: str
    likes: Optional[int] = 0

    @field_validator("content")
    @classmethod
    def validate_not_empty(cls, v):
        if not v.strip():
            raise ValueError("댓글 내용을 입력하세요.")
        return v

# 대댓글 생성 요청
class CoComentBase(BaseModel):
    content: str
    likes: Optional[int] = 0

    @field_validator("content")
    @classmethod
    def validate_not_empty(cls, v):
        if not v.strip():
            raise ValueError("대댓글 내용을 입력하세요.")
        return v

class CharacterBase(BaseModel) : 
    # novel_pk : int
    name : str
    role : str
    age : int 
    sex : bool
    job : str
    profile : str

class CharacterUpdateBase(BaseModel) :
    name: Optional[str] = None
    role: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[bool] = None
    job: Optional[str] = None
    profile: Optional[str] = None

    @field_validator("name","role","job","profile")
    @classmethod
    def validate_not_empty(cls, v):
        if v is None and v.strip():
            raise ValueError("이 필드는 비워둘 수 없습니다.")
        return v  # 값을 반환해야 함
    
    @field_validator("age")
    @classmethod
    def validate_age(cls, v) :
        if v < 0 : 
            raise ValueError("나이는 0살 이하일 수 없습니다.")
        return v
    
    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v) :
        if v > 2 or v < 0 : 
            raise ValueError("성별은 3가지 옵션 중 하나로 선택해주십시오.")
        return v
    


# 소설 생성 AI 모델 응답용 스키마

class WorldviewRequest(BaseModel):
    genre: str
    title: str

class SynopsisRequest(BaseModel):
    genre: str
    title: str
    worldview: str

class CharacterModel(BaseModel):
    name: str
    sex: str
    age: str
    role: str
    job: str
    profile: str
    특징: str

class CharacterRequest(BaseModel):
    genre: str
    title: str
    worldview: str
    synopsis: str
    characters: List[CharacterModel] = []  # 기존 캐릭터가 있으면 함께 전달 가능


class CreateChapterRequest(BaseModel):
    novel_pk: Optional[int] = None 
    title: str
    genre: str
    synopsis: str
    worldview: str
    characters: List[Dict] = []