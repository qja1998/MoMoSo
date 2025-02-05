from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import novel_schema
from models import Novel, Episode, Comment, CoComment, Character, Genre, novel_genre_table



# 모든 소설 가져오기
# 장르가 여러개가 되니까 이걸 같이 가져와야 함
def get_all_novel(db: Session):
    print("all_novel started")
    return db.query(Novel).all()


# 소설 검색 (pk 기반, 테스트 용도라 추후 삭제)
def search_novel(novel_pk: str, db: Session):
    return db.query(Novel).filter(Novel).all()

# 소설 생성
def create_novel(novel_info: novel_schema.NovelCreateBase, user_pk: int, db: Session):
    novel = Novel(
        title=novel_info.title,
        user_pk=user_pk,
        worldview=novel_info.worldview,
        synopsis=novel_info.synopsis
    )
    
    print("_____________thisistochecknovelgenre_______________________")
    print(f"Received novel_info: {novel_info}")
    for genre_name in novel_info.genres : 
        genre = db.query(Genre).filter(Genre.genre == genre_name).first()
        novel_genre = novel_genre_table(novel = novel.novel_pk, genre_pk = genre.genre_pk)
        db.add(novel_genre)
        
    db.commit()
    db.refresh(novel)
    return novel




