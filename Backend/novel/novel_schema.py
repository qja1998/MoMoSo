from pydantic import BaseModel, field_validator
from fastapi import HTTPException

#순환 참조 문제 때문에 나머지도 SCHEMA를 만들어야 함 .특히 코멘트와 cocomet부분이 순환 참조가 일어나기 쉬운 형태라고 함.

class NovelCreateBase(BaseModel) : 
    title : str
    synopsis_pk : int
    description : str
    num_episode : int
    genre : str

class CommentBase(BaseModel) :    
    # ep_pk : int
    # user_pk : str
    content : str
    cocoment_cnt : int
    likes : int

class CoComentBase(BaseModel) : 
    # user_pk : int
    # comment_pk : int
    content : str
    likes : int

class SynopsisBase(BaseModel) : 
    category : str
    content : str


# class EpisodeBase(BaseModel) : 
#     ep_title : str
#     novel_pk : int
#     ep_content : str


class EpisodeCreateBase(BaseModel) : 
    ep_title : str
    ep_content : str


