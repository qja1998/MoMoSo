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
@app.get("/novel", response_model=list[novel_schema.NovelBase])
def all_novel(db: Session = Depends(get_db)):
    print("WHY.....????")
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
async def create_novel(request: Request, novel_info: novel_schema.NovelCreateBase, user_pk: int, db: Session = Depends(get_db)):
    body = await request.json()
    print(f"Raw Request Body: {body}")  # ✅ Swagger가 보내는 JSON 확인
    print(f"Received novel_info: {novel_info.model_dump()}")
    
    return novel_crud.create_novel(novel_info, user_pk, db)

# @app.post("/novel")
# async def create_novel(request: Request, genre_info : novel_schema.GenreAddBase, novel_info: novel_schema.NovelCreateBase, user_pk: int, db: Session = Depends(get_db)):
#     body = await request.json()
#     print(f"Raw Request Body: {body}")  # ✅ Swagger가 보내는 JSON 확인
#     print(f"this is genres type : {type(body.get("genre_info", {}).get("genres", "")[0])}" )
#     print(f"Received novel_info: {novel_info.model_dump()}")
#     print(f"Received genre_info: {genre_info.model_dump()}")
    
#     return novel_crud.create_novel(genre_info, novel_info, user_pk, db)

