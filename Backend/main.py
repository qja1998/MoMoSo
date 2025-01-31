
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
# 데이터베이스 연결
from database import engine, get_db
from models import Base
from models import User
from novel import novel_crud, novel_schema
#테스트 후 삭제할 것.
from models import Novel, Comment, CoComment, Episode
# 카카오 로그인
# from user.kakao_manager import KaKaoAPI

# Middleware를 사용하기 위해서 필요하다고 함.secrete key생성용임. 
import secrets
secret_key = secrets.token_urlsafe(32) 


app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=secret_key)

# 테이블 자동 생성
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Hello":"World"}


# 모든 소설을 가져옴
@app.get("/api/v1/novel")
def all_novel(db: Session = Depends(get_db)):
    novel_all = novel_crud.get_all_novel(db)
    return novel_all

#소설 검색은 굳이 필요할까? front단에서 하는게 제일 좋을듯.
@app.get("/api/v1/novel/{novel_pk}")
def search_novel(novel_pk : int, db: Session = Depends(get_db)) : 
    novel = db.query(Novel).filter(Novel.novel_pk == novel_pk).all()
    return novel



@app.post("/api/v1/novel/{novel_pk}")
def create_episode(novel_pk : int, episode_data : novel_schema.EpisodeCreateBase,db: Session = Depends(get_db)) :
    episode = novel_crud.save_episode(novel_pk, episode_data,db)
    return episode


@app.get("/api/v1/novel/{novel_pk}")
def novel_episode(novel_pk : int, db: Session = Depends(get_db)) : 
    episodes = novel_crud.novel_episode(novel_pk, db)
    return episodes

# 왜 None 만 반환하는지 확인 필요. 그리고 검색을 novel & ep pk로 확인해야 함. 
@app.get("/api/v1/novel/{novel_pk}/{ep_pk}")
def ep_comment(novel_pk: int, ep_pk: int, db: Session = Depends(get_db)) :
    print(novel_pk, ep_pk)
    all_ep_comment = novel_crud.get_all_ep_comment(novel_pk,ep_pk, db)
    return all_ep_comment

@app.post("/api/v1/novel/{novel_pk}/{ep_pk}")
def write_comment(comment_info : novel_schema.CommentBase, novel_pk : int,ep_pk : int, user_pk : int, db: Session = Depends(get_db)) : 
    comment  = novel_crud.create_comment(comment_info, novel_pk, ep_pk, user_pk, db)
    if comment : 
        return comment
    else : 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="no comments written")


@app.put("/api/v1/novel/{novel_pk}/{ep_pk}/{comment_pk}") 
def change_comment(content : str, comment_pk : int, db : Session = Depends(get_db)) : 
    comment = novel_crud.update_comment(content,comment_pk, db )
    # http exception 넣어줘야 함. 
    return comment


@app.delete("/api/v1/novel/{novel_pk}/{ep_pk}/{comment_pk}")
def delete_comment(comment_pk : int, db : Session = Depends(get_db)) : 
    novel_crud.delete_comment(comment_pk,db )


@app.put("/api/v1/novel/{novel_pk}/{ep_pk}/{comment_pk}")
def like_comment(comment_pk : int, db : Session = Depends(get_db)) : 
    comment = novel_crud.like_comment(comment_pk , db)
    #얘도 HTTP 로 변경해야 함.
    return comment