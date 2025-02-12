from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from novel import novel_crud, novel_schema
from models import Novel, User
from typing import List, Optional
from utils.auth_utils import get_optional_user
from fastapi import Request # 삭제 예정 
import os



app = APIRouter(
    prefix='/api/v1',
)

@app.get("/main", response_model=novel_schema.MainPageResponse)
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



# 영상 재생은 별개의 router 로 보여줌
# 아래가 예시임. 
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


# 소설(Novel) CRUD
print("app has started")

# 모든 소설을 가져오기 에러 잡는 중
# 장르도 같이 제공해줘야 함.
@app.get("/novels", response_model=List[novel_schema.NovelShowBase])
def all_novel(db: Session = Depends(get_db)):
    return novel_crud.get_all_novel(db)


# 에디터 페이지 아주 많은걸 인풋으로 받아야 하겠네. 일단 나누자고 얘기해보자. 

# 에디터 페이지 정보 가져오기.

@app.get("/novel/{novel_pk}") 
def get_novel_info(novel_pk : int, db: Session = Depends(get_db)) :
    # novel정보 
    novel = novel_crud.search_novel(novel_pk, db)
    # 등장인물 정보
    character = novel_crud.get_character(novel_pk, db)
    return {"novel" : novel, "character" : character} 

#등장인물 CUD
# 등장인물 완성함
#등장인물 CUD
@app.post("/novel/character/{novel_pk}", response_model=novel_schema.CharacterBase)
def save_character(novel_pk : int, character_info : novel_schema.CharacterBase, db: Session = Depends(get_db)) :
    return novel_crud.save_character(novel_pk, character_info ,db)

@app.put("/api/v1/novel/character/{character_pk}")
def update_character(character_pk : int, update_data: novel_schema.CharacterUpdateBase, db: Session = Depends(get_db)) : 
    return novel_crud.update_character(character_pk,update_data, db)

@app.delete("/api/v1/novel/character/{character_pk}")
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
@app.post("/novel/{novel_pk}/{ep_pk}",response_model=novel_schema.EpisodeCreateBase)
def change_episode(novel_pk: int, update_data: novel_schema.EpisodeUpdateBase, ep_pk : int, db: Session = Depends(get_db)) : 
    return novel_crud.change_episode(novel_pk, update_data, ep_pk, db)

#에피소드 삭제
@app.delete("/novel/{novel_pk}/{ep_pk}")
def delete_episode(novel_pk: int, ep_pk : int, db: Session = Depends(get_db)) : 
    return novel_crud.delete_episode(novel_pk,ep_pk,db)

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
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment")
def change_comment(content: str, comment_pk: int, db: Session = Depends(get_db)):
    comment = novel_crud.update_comment(content, comment_pk, db)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="댓글을 찾을 수 없습니다.")
    return comment

# 댓글 삭제
@app.delete("/novel/{novel_pk}/episode/{ep_pk}/comment")
def delete_comment(comment_pk: int, db: Session = Depends(get_db)):
    return novel_crud.delete_comment(comment_pk, db)

# 댓글 좋아요
@app.put("/novel/comment/{comment_pk}/like")
def like_comment(comment_pk: int, user_pk : int,db: Session = Depends(get_db)):
    return novel_crud.like_comment(comment_pk, user_pk,db)

# 대댓글 CRUD

# 대댓글 작성
@app.post("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment", response_model=novel_schema.CoComentBase)
def create_cocoment(comment_pk: int, user_pk: int, cocoment_info: novel_schema.CoComentBase, db: Session = Depends(get_db)):
    return novel_crud.create_cocoment(comment_pk, user_pk, cocoment_info, db)

# 대댓글 수정
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment")
def update_cocomment(content: str, cocoment_pk: int, db: Session = Depends(get_db)):
    cocomment = novel_crud.update_cocomment(content, cocoment_pk, db)
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")
    return cocomment

# 대댓글 삭제
@app.delete("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment")
def delete_cocomment(cocomment_pk: int, db: Session = Depends(get_db)):
    novel_crud.delete_cocomment(cocomment_pk, db)
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)


# 대댓글 좋아요
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment/like")
def like_cocomment(cocomment_pk: int, user_pk: int, db: Session = Depends(get_db)):
    return novel_crud.like_cocomment(cocomment_pk, user_pk, db)

@app.get("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment")
def get_cocoment(comment_pk : int, db: Session = Depends(get_db) ) : 
    return novel_crud.get_cocoment(comment_pk,db)

# 표지 이미지

import os
@app.post("/image")

#아래 리턴되는 값은 드라이브 내부의 img id임. 수정이 필요한경우 해당 걸로 하면 됨.
def save_img(novel_pk : int, file_name : str, drive_folder_id : str, db: Session = Depends(get_db)) : 
    novel = novel_crud.save_cover(novel_pk, file_name, drive_folder_id, db)
    
    return novel

# 1i_n_3NcwzKhESXw1tJqMtQRk7WVczI2N
@app.delete("/image")
def delete_img(file_id : str, drive_folder_id : str, novel_pk : int , db: Session = Depends(get_db)) :
    return novel_crud.delete_image(file_id, drive_folder_id)

from .novel_generator import NovelGenerator
from .novel_schema import WorldviewRequest, SynopsisRequest, CharacterRequest, CreateChapterRequest
from .novel_crud import get_previous_chapters
from utils.auth_utils import get_current_user

@app.post("/ai/worldview")
def recommend_worldview(request: WorldviewRequest) : 
    novel_gen = NovelGenerator(request.genre, request.title)
    worldview = novel_gen.recommend_worldview()
    return {"worldview": worldview}

@app.post("/ai/synopsis")
def recommend_synopsis(request: SynopsisRequest) : 
    novel_gen = NovelGenerator(request.genre, request.title, request.worldview)
    synopsis = novel_gen.recommend_synopsis()
    return {"synopsis": synopsis}

@app.post("/ai/characters")
def recommend_characters(request: CharacterRequest):
    novel_gen = NovelGenerator(request.genre, request.title, request.worldview, request.synopsis, request.characters)
    updated_characters = novel_gen.recommend_characters()
    return {"characters": updated_characters}

@app.post("/ai/episode")
def create_episode(request: CreateChapterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    novel = None
    if request.novel_pk:
        novel = db.query(Novel).filter(Novel.novel_pk == request.novel_pk).first()
        if not novel:
            raise HTTPException(status_code=404, detail="해당 novel_pk에 대한 소설을 찾을 수 없습니다.")
        
        # 소설 작성자가 현재 로그인된 사용자인지 검증
        if novel.user_pk != current_user.user_pk:
            raise HTTPException(status_code=403, detail="이 소설을 수정할 권한이 없습니다.")

    # novel_pk가 없으면 새로운 소설 생성
    else:
        novel = Novel(
            user_pk=current_user.user_pk,
            title=request.title,
            worldview=request.worldview,
            synopsis=request.synopsis,
            num_episode=0
        )
        db.add(novel)
        db.commit()
        db.refresh(novel)
    
    previous_chapters = get_previous_chapters(db, novel.novel_pk)

    generator = NovelGenerator(
        genre=request.genre,
        title=request.title,
        worldview=request.worldview,
        synopsis=request.synopsis,
        characters=request.characters,
        previous_chapters=previous_chapters
    )

    new_chapter = generator.create_chapter()

    return {"title": request.title, "genre": request.genre, "new_chapter": new_chapter}

from fastapi import File, UploadFile
@app.post("/upload")
async def upload_image(imgpath : str, pk : int, file: UploadFile = File(...)):
    return await novel_crud.image_upload(imgpath, pk, file)


from .novel_generator import NovelGenerator
from .novel_schema import WorldviewRequest, SynopsisRequest, CharacterRequest, CreateChapterRequest
from .novel_crud import get_previous_chapters
from utils.auth_utils import get_current_user

@app.post("/ai/worldview")
def recommend_worldview(request: WorldviewRequest) : 
    novel_gen = NovelGenerator(request.genre, request.title)
    worldview = novel_gen.recommend_worldview()
    return {"worldview": worldview}

@app.post("/ai/synopsis")
def recommend_synopsis(request: SynopsisRequest) : 
    novel_gen = NovelGenerator(request.genre, request.title, request.worldview)
    synopsis = novel_gen.recommend_synopsis()
    return {"synopsis": synopsis}

@app.post("/ai/characters")
def recommend_characters(request: CharacterRequest):
    novel_gen = NovelGenerator(request.genre, request.title, request.worldview, request.synopsis, request.characters)
    updated_characters = novel_gen.recommend_characters()
    return {"characters": updated_characters}

@app.post("/ai/episode")
def create_episode(request: CreateChapterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    novel = None
    if request.novel_pk:
        novel = db.query(Novel).filter(Novel.novel_pk == request.novel_pk).first()
        if not novel:
            raise HTTPException(status_code=404, detail="해당 novel_pk에 대한 소설을 찾을 수 없습니다.")
        
        # 소설 작성자가 현재 로그인된 사용자인지 검증
        if novel.user_pk != current_user.user_pk:
            raise HTTPException(status_code=403, detail="이 소설을 수정할 권한이 없습니다.")

    # novel_pk가 없으면 새로운 소설 생성
    else:
        novel = Novel(
            user_pk=current_user.user_pk,
            title=request.title,
            worldview=request.worldview,
            synopsis=request.synopsis,
            num_episode=0
        )
        db.add(novel)
        db.commit()
        db.refresh(novel)
    
    previous_chapters = get_previous_chapters(db, novel.novel_pk)

    generator = NovelGenerator(
        genre=request.genre,
        title=request.title,
        worldview=request.worldview,
        synopsis=request.synopsis,
        characters=request.characters,
        previous_chapters=previous_chapters
    )

    new_chapter = generator.create_chapter()

    return {"title": request.title, "genre": request.genre, "new_chapter": new_chapter}





# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List
# from fastapi.responses import Response

# from gen_func.gen_image import ImageGenerator

# generator = ImageGenerator()
# generator.gen_image_pipline
# JUPYTER_URL = os.environ["JUPYTER_URL"]

# payload = {
#     "genre": "fantasy",
#     "style": "watercolor",
#     "title": "The Last Dragon",
#     "worldview": "high",
#     "keywords": ["dragon", "knight", "adventure"]
# }
# import requests
# import os
# from io import BytesIO
# from PIL import Image


# @app.post("/image/generate")
# async def AI_img_generate(payload) :
#     headers = {"Content-Type": "application/json"}
#     response = requests.post(JUPYTER_URL + "/api/v1/editor/image_ai", json=payload, headers=headers)
#     if response.status_code == 200:
#         print("✅ 이미지 생성 성공!")

#     # 응답된 이미지 데이터를 BytesIO 객체로 변환
#     img_data = BytesIO(response.content)

#     # PIL로 이미지 열기
#     image = Image.open(img_data)

#     # 🖼️ 이미지 띄우기
#     image.show()

#     # 💾 이미지 저장
#     image.save(f"/static/{payload["title"]}.png", format="PNG")
#     print("📸 이미지가 'generated_image.png'로 저장되었습니다.")

    
# @app.post("/api/v1/editor/image_ai")    
# async def generate_image(req: novel_schema.ImageRequest):
#     try:
#         image = generator.gen_image_pipeline(
#             req.genre, req.style, req.title, req.worldview, req.keywords
#         )
#         # ✅ BytesIO 버퍼 생성 후 이미지 변환
#         img_buffer = BytesIO()
#         image.save(img_buffer, format="PNG")
#         img_buffer.seek(0)  # 버퍼의 시작 위치로 이동

#         return Response(content=img_buffer.getvalue(), media_type="image/png")
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))