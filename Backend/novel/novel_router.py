from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from novel import novel_crud, novel_schema
from models import Novel
import secrets

from fastapi import Request # 삭제 예정 

app = APIRouter(
    prefix='/api/v1',
)

# 소설(Novel) CRUD
print("app has started")

# 모든 소설을 가져오기
# 장르도 같이 제공해줘야 함.
@app.get("/novel")#, response_model=list[novel_schema.NovelListBase])
def all_novel(db: Session = Depends(get_db)):
    return novel_crud.get_all_novel(db)


# 특정 소설 검색 왜 안돌가가지... ㅠㅠ 테스트 용도이긴 한데 좀 슬프군
@app.get("/novel/{novel_pk}")
def search_novel(novel_pk: int, db: Session = Depends(get_db)):
    novel = novel_crud.search_novel(novel_pk, db)
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="소설을 찾을 수 없습니다.")
    return novel

# 소설 생성
@app.post("/novel", response_model=novel_schema.NovelCreateBase)
def create_novel(novel_info: novel_schema.NovelCreateBase, user_pk: int, db: Session = Depends(get_db)):
    return novel_crud.create_novel(novel_info, user_pk, db)
    

#소설 정정
@app.put("/novel/{novel_pk}", response_model=novel_schema.NovelBase)
def update_novel(novel_pk: int, update_data: novel_schema.NovelUpdateBase,db: Session = Depends(get_db)):
    return novel_crud.update_novel(novel_pk, update_data, db)


# 에피소드 CRUD

# 특정 소설의 에피소드 조회
@app.get("/novel/{novel_pk}/episodes")
def novel_episode(novel_pk: int, db: Session = Depends(get_db)):
    return novel_crud.novel_episode(novel_pk, db)

# 특정 소설에 에피소드 추가
@app.post("/novel/{novel_pk}/episode", response_model=novel_schema.EpisodeCreateBase)
def create_episode(novel_pk: int, episode_data: novel_schema.EpisodeCreateBase, db: Session = Depends(get_db)):
    return novel_crud.save_episode(novel_pk, episode_data, db)


"""
여기서부터 짜면 됨. 
"""

"""
얘 짜기 귀찮으니까 일단 냅두자... 갸귀찮아
"""
# 에피소드 변경
@app.post("/novel/{novel_pk}/{episode_pk}", response_model=novel_schema.EpisodeCreateBase)
def change_episode(novel_pk: int, episode_pk : int, db: Session = Depends(get_db)) : 
    pass

#에피소드 삭제
@app.delete("/novel/{novel_pk}/{episode_pk}")
def delete_episode(novel_pk: int, episode_pk : int, db: Session = Depends(get_db)) : 
    return novel_crud.delete_episode

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
    novel_crud.delete_comment(comment_pk, db)
    return {"message": "댓글이 삭제되었습니다."}

# 댓글 좋아요
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/like")
def like_comment(comment_pk: int, db: Session = Depends(get_db)):
    comment = novel_crud.like_comment(comment_pk, db)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="댓글을 찾을 수 없습니다.")
    return comment

# 대댓글 CRUD

# 대댓글 작성
@app.post("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment", response_model=novel_schema.CoComentBase)
def create_cocoment(comment_pk: int, user_pk: int, cocoment_info: novel_schema.CoComentBase, db: Session = Depends(get_db)):
    return novel_crud.create_cocoment(comment_pk, user_pk, cocoment_info, db)

# 대댓글 좋아요
@app.put("/novel/{novel_pk}/episode/{ep_pk}/comment/{comment_pk}/cocomment/{cocomment_pk}/like")
def like_cocomment(cocomment_pk: int, db: Session = Depends(get_db)):
    cocomment = novel_crud.like_cocomment(cocomment_pk, db)
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")
    return cocomment

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
    return {"message": "대댓글이 삭제되었습니다."}



