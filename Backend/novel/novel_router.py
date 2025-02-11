from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from novel import novel_crud, novel_schema
from models import Novel
import secrets
from typing import List, Optional

from fastapi import Request # 삭제 예정 
import os # 삭제 예정

from .novel_schema import MainPageResponse
from utils.auth_utils import get_optional_user
from models import User

app = APIRouter(
    prefix='/api/v1',
)

# 메인 페이지 Router

@app.get("/main", response_model=MainPageResponse)
def main_page(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)  # 로그인 검증만 수행
):
    """
    메인 페이지: 최근 인기 소설, 최근 본 소설 정보 반환
    """
    recent_best = novel_crud.recent_hit(2, db)  # 최근 좋아요 많은 소설
    month_best = novel_crud.recent_hit(30, db)  # 한 달 동안 좋아요 많은 소설

    if current_user:
        # 로그인한 경우, 최근 본 소설을 조회 (CRUD 호출)
        recent_novels = novel_crud.get_recent_novels(db, current_user.user_pk)
        response_data = {
            "user": {
                "user_pk": current_user.user_pk,
                "name": current_user.name,
                "nickname": current_user.nickname,
                "recent_novels": recent_novels
            },
            "recent_best": recent_best,
            "month_best": month_best
        }
    else:
        # 비로그인 사용자는 기본값(`Guest`)을 반환
        response_data = {
            "user": {
                "user_pk": 0,
                "name": "Guest",
                "nickname": "Guest",
                "recent_novels": None
            },
            "recent_best": recent_best,
            "month_best": month_best
        }

    return response_data

# 영상 재생은 Backend static 폴더에 넣어두고, 별개의 router 로 프단에 전송
"""
import React from 'react';

function VideoPlayer() {
  const videoUrl = '/static/my_video.mp4'; // FastAPI static 폴더에 있는 영상 URL

  return (
    <div>
      <video src={videoUrl} controls />
    </div>
  );
}

export default VideoPlayer;

"""

@app.get("/novels", response_model=List[novel_schema.NovelShowBase])
def all_novel(db: Session = Depends(get_db)):
    return novel_crud.get_all_novel(db)


# 에디터 페이지 정보 가져오기.
@app.get("/novel/{novel_pk}") 
def get_novel_info(novel_pk : int, db: Session = Depends(get_db)):
    novel = novel_crud.search_novel(novel_pk, db) # novel정보 
    character = novel_crud.get_character(novel_pk, db) # 등장인물 정보
    return {"novel" : novel, "character" : character} 


#등장인물 CUD
@app.post("/novel/character/{novel_pk}", response_model=novel_schema.CharacterBase)
def save_character(novel_pk : int, character_info : novel_schema.CharacterBase, db: Session = Depends(get_db)) :
    return novel_crud.save_character(novel_pk, character_info ,db)

# ======================= 코드 고침 =====================



















































@app.patch("/novel/character/{character_pk}", response_model=novel_schema.CharacterResponse)
def update_character(character_pk : int, update_data: novel_schema.CharacterUpdateBase, db: Session = Depends(get_db)) : 
    """
    특정 캐릭터 정보 수정
    """
    return novel_crud.update_character(character_pk,update_data, db)

@app.delete("/novel/character/{character_pk}")
def delete_character(character_pk : int, db: Session = Depends(get_db)) : 
    return novel_crud.delete_character(character_pk, db )

# 소설(시놉시스) CUD

# 수정한 소설 저장하기
@app.put("/novel/{novel_pk}")
def update_novel(novel_pk: int, update_data: novel_schema.NovelUpdateBase,db: Session = Depends(get_db)):
    novel_crud.update_novel(novel_pk, update_data, db)
    return HTTPException(status_code=status.HTTP_200_OK)

# 소설 생성
@app.post("/novel", response_model=novel_schema.NovelCreateBase)
def create_novel(novel_info: novel_schema.NovelCreateBase, user_pk: int, db: Session = Depends(get_db)):
    return novel_crud.create_novel(novel_info, user_pk, db)

@app.delete("/novel/{novel_pk}")
def delete_novel(novel_pk: int, db: Session = Depends(get_db)):
    return novel_crud.delete_novel(novel_pk, db)

#소설 detail page 


"""
디버깅 필요, 에피소드 가져오는 기능도 없음.
"""
#소설 좋아요 
@app.put("/novel/{novel_pk}/{user_pk}")
def like_novel(novel_pk: int, user_pk: int, db: Session = Depends(get_db)):
    return novel_crud.like_novel(novel_pk,user_pk, db)

# 에피소드 CRUD

# 특정 소설의 에피소드 조회
@app.get("/novel/{novel_pk}/episodes")
def novel_episode(novel_pk: int, db: Session = Depends(get_db)):
    return novel_crud.novel_episode(novel_pk, db)

# 특정 소설에 에피소드 추가
@app.post("/novel/{novel_pk}/episode", response_model=novel_schema.EpisodeCreateBase)
def create_episode(novel_pk: int, episode_data: novel_schema.EpisodeCreateBase, db: Session = Depends(get_db)):
    return novel_crud.save_episode(novel_pk, episode_data, db)

# 에피소드 변경
@app.post("/novel/{novel_pk}/{episode_pk}",response_model=novel_schema.EpisodeCreateBase)
def change_episode(novel_pk: int, update_data: novel_schema.EpisodeUpdateBase,episode_pk : int, db: Session = Depends(get_db)) : 
    return novel_crud.change_episode(novel_pk, update_data, episode_pk, db)

#에피소드 삭제
@app.delete("/novel/{novel_pk}/{episode_pk}")
def delete_episode(novel_pk: int, episode_pk : int, db: Session = Depends(get_db)) : 
    return novel_crud.delete_episode(novel_pk,episode_pk,db)


# ================================================================================================================



# 특정 에피소드의 댓글 조회
@app.get("/novel/{novel_pk}/episode/{ep_pk}/comments")
def ep_comment(novel_pk: int, ep_pk: int, db: Session = Depends(get_db)):
    all_ep_comment = novel_crud.get_all_ep_comment(novel_pk, ep_pk, db)
    return all_ep_comment

# 댓글 작성
@app.post("/novel/{novel_pk}/episode/{ep_pk}/comment", response_model=novel_schema.CommentBase)
def write_comment(comment_info: novel_schema.CommentBase, novel_pk: int, ep_pk: int, user_pk: int, db: Session = Depends(get_db)):
    comment = novel_crud.create_comment(comment_info, novel_pk, ep_pk, user_pk, db)
    if not comment:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="댓글 작성에 실패했습니다.")
    return comment

# 댓글 수정
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}")
def change_comment(content: str, comment_pk: int, db: Session = Depends(get_db)):
    comment = novel_crud.update_comment(content, comment_pk, db)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="댓글을 찾을 수 없습니다.")
    return comment

# 댓글 삭제
@app.delete("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}")
def delete_comment(comment_pk: int, db: Session = Depends(get_db)):
    return novel_crud.delete_comment(comment_pk, db)

# 댓글 좋아요
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/like")
def like_comment(comment_pk: int, user_pk : int,db: Session = Depends(get_db)):
    return novel_crud.like_comment(comment_pk, user_pk,db)

# 대댓글 CRUD

# 대댓글 작성
@app.post("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment", response_model=novel_schema.CoComentBase)
def create_cocoment(comment_pk: int, user_pk: int, cocoment_info: novel_schema.CoComentBase, db: Session = Depends(get_db)):
    return novel_crud.create_cocoment(comment_pk, user_pk, cocoment_info, db)

# 대댓글 수정
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment/{cocomment_pk}")
def update_cocomment(content: str, cocoment_pk: int, db: Session = Depends(get_db)):
    cocomment = novel_crud.update_cocomment(content, cocoment_pk, db)
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")
    return cocomment

# 대댓글 삭제
@app.delete("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment/{cocomment_pk}")
def delete_cocomment(cocomment_pk: int, db: Session = Depends(get_db)):
    novel_crud.delete_cocomment(cocomment_pk, db)
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)


# 대댓글 좋아요
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment/{cocomment_pk}/like")
def like_cocomment(cocomment_pk: int, user_pk: int, db: Session = Depends(get_db)):
    return novel_crud.like_cocomment(cocomment_pk, user_pk, db)


# 표지 이미지

import os
@app.post("/image")
def save_cover(image_path : str, drive_folder_id : str) : 
    image_path = os.path.join(os.getcwd(), "static", "test.jpg")
    drive_folder_id = "1i_n_3NcwzKhESXw1tJqMtQRk7WVczI2N"
    return novel_crud.save_cover(image_path, drive_folder_id)