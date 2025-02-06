from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from . import novel_schema
from models import Novel, Episode, Comment, CoComment, Character, Genre, novel_genre_table
# from sqlalchemy import select



# 모든 소설 가져오기
# 장르가 여러개가 되니까 이걸 같이 가져와야 함
def get_all_novel(db: Session):
    # stmt = select(Novel).join(novel_genre_table).join(Genre)
    return db.query(Novel).options(joinedload(Novel.genres)).all()


# 소설 검색 (pk 기반, 테스트 용도라 추후 삭제)
def search_novel(novel_pk: str, db: Session):
    return db.query(Novel).filter(Novel).all()

# 소설 생성
# def create_novel(novel_info: novel_schema.NovelCreateBase, user_pk: int, db: Session):
#     novel = Novel(
#         title=novel_info.title,
#         user_pk=user_pk,
#         worldview=novel_info.worldview,
#         synopsis=novel_info.synopsis
#     )
    
#     print("_____________thisistochecknovelgenre_______________________")
#     print(f"Received novel_info: {novel_info}")
#     for genre_name in novel_info.genres : 
#         genre = db.query(Genre).filter(Genre.genre == genre_name).first()
#         novel_genre = novel_genre_table(novel = novel.novel_pk, genre_pk = genre.genre_pk)
#         db.add(novel_genre)
        
#     db.commit()
#     db.refresh(novel)
#     return novel

def create_novel(novel_info: novel_schema.NovelCreateBase, user_pk: int, db: Session):
    novel = Novel(
        title=novel_info.title,
        user_pk=user_pk,
        worldview=novel_info.worldview,
        synopsis=novel_info.synopsis
    )
    
    db.add(novel)
    db.flush()  # 이 시점에서 novel_pk가 생성됩니다.
    
    print("_____________thisistochecknovelgenre_______________________")
    print(f"Received novel_info: {novel_info}")
    for genre_name in novel_info.genres:
        print("genre_name_is",type(genre_name))
        genre_data = db.query(Genre).filter(Genre.genre == genre_name).first()
        if genre_data:
            db.execute(novel_genre_table.insert().values(
                novel_pk=novel.novel_pk,
                genre_pk=genre_data.genre_pk
            ))
        else:
            print(f"Genre not found: {genre_name}")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="존재하지 않는 장르입니다.")
    db.commit()
    db.refresh(novel)

    # novel.genres를 문자열 리스트로 변환
    genre_names = [genre.genre for genre in novel.genres]

    # 스키마 객체 생성
    novel_base = novel_schema.NovelBase(
        novel_pk=novel.novel_pk,
        title=novel.title,
        worldview=novel.worldview,
        synopsis=novel.synopsis,
        num_episode=novel.num_episode,
        likes=novel.likes,
        views=novel.views,
        is_completed=novel.is_completed,
        genres=genre_names  # 변환된 문자열 리스트 할당
    )
    return novel_base

# 소설 부분 업데이트. 이건 전체 저장 용도로 쓰면 될듯.
def update_novel(novel_pk: int, update_data: novel_schema.NovelUpdateBase, db: Session):
    novel = db.query(Novel).filter(Novel.novel_pk == novel_pk).first()
    
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="소설을 찾을 수 없습니다.")

    update_data_dict = update_data.model_dump(exclude_unset=True)  # 변경된 데이터만 가져오기

    for key, value in update_data_dict.items():
        setattr(novel, key, value)  # 필드 업데이트

    db.commit()
    db.refresh(novel)
    return novel

#소설 삭제(장르 중계 테이블도 삭제해줘야 함.)
def delete_novel(novel_pk: int, db: Session):
    novel = db.query(Novel).filter(Novel.novel_pk == novel_pk).first()
    db.delete(novel)
    db.commit()
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)


# 특정 소설의 에피소드 조회
def novel_episode(novel_pk: int, db: Session):
    return db.query(Episode).filter(Episode.novel_pk == novel_pk).all()

# 에피소드 저장
def save_episode(novel_pk: int, episode_data: novel_schema.EpisodeCreateBase, db: Session):
    if not episode_data.ep_content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="에피소드 내용이 없습니다.")
    
    episode = Episode(
        ep_title=episode_data.ep_title,
        novel_pk=novel_pk,
        ep_content=episode_data.ep_content
    )
    db.add(episode)
    db.commit()
    db.refresh(episode)
    return episode

# 에피소드 수정
def change_episode(novel_pk: int, episode_pk : int, db: Session) :
    pass

# 에피소드 삭제
def delete_episode(novel_pk: int, episode_pk : int, db: Session) :
    episode = db.query(Episode).filter(Episode.ep_pk == episode_pk).first()
    db.delete(episode)
    db.commit()
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)


# 특정 에피소드의 모든 댓글 조회
def get_all_ep_comment(novel_pk: int, ep_pk: int, db: Session):
    return db.query(Comment).filter(Comment.ep_pk == ep_pk).all()

# 특정 소설의 모든 댓글 조회
def get_novel_comment(novel_pk: int, db: Session):
    return db.query(Comment).filter(Comment.novel_pk == novel_pk).all()

# 댓글 작성
def create_comment(comment_info: novel_schema.CommentBase, novel_pk: int, ep_pk: int, user_pk: int, db: Session):
    comment = Comment(
        novel_pk=novel_pk,
        ep_pk=ep_pk,
        user_pk=user_pk,
        content=comment_info.content,
        likes=comment_info.likes
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

# 댓글 수정
def update_comment(content: str, comment_pk: int, db: Session):
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="댓글을 찾을 수 없습니다.")
    
    comment.content = content
    db.commit()
    db.refresh(comment)
    return comment

# 댓글 삭제
def delete_comment(comment_pk: int, db: Session):
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="댓글을 찾을 수 없습니다.")
    
    db.delete(comment)
    db.commit()
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)

"""
여기서 부터 만들면 됨.

"""

# 댓글 좋아요 및 좋아요 취소
def like_comment(comment_pk: int, db: Session):
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="댓글을 찾을 수 없습니다.")
    
    print(comment.liked_users) #형태가 어떤지 봐야 로직을 짤 수 있을듯.
    
    comment.likes += 1

    

    # db.commit()
    # db.refresh(comment)
    # return comment

# 대댓글 작성
def create_cocoment(comment_pk: int, user_pk: int, cocoment_info: novel_schema.CoComentBase, db: Session):
    cocoment = CoComment(
        user_pk=user_pk,
        comment_pk=comment_pk,
        content=cocoment_info.content,
        likes=cocoment_info.likes
    )
    db.add(cocoment)
    db.commit()
    db.refresh(cocoment)
    return cocoment

# 대댓글 좋아요
def like_cocomment(cocomment_pk: int, db: Session):
    cocomment = db.query(CoComment).filter(CoComment.cocomment_pk == cocomment_pk).first()
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")
    
    cocomment.likes += 1
    db.commit()
    db.refresh(cocomment)
    return cocomment

# 대댓글 수정
def update_cocomment(content: str, cocoment_pk: int, db: Session):
    cocomment = db.query(CoComment).filter(CoComment.cocomment_pk == cocoment_pk).first()
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")
    
    cocomment.content = content
    db.commit()
    db.refresh(cocomment)
    return cocomment

# 대댓글 삭제
# 여기에 그 소설 댓글의 대댓글 갯수를 -1하는걸 만들어야 함
def delete_cocomment(cocomment_pk: int, db: Session):
    cocomment = db.query(CoComment).filter(CoComment.cocomment_pk == cocomment_pk).first()
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")
    
    db.delete(cocomment)
    db.commit()
    return {"message": "대댓글이 삭제되었습니다."}

# 전체 등장인물 불러오기
def get_character(novel_pk: int, db: Session):
    return db.query(Character).filter(Character.novel_pk == novel_pk).all()

# 특정 등장 인물 생성 
def save_character(novel_pk: int, character_info : novel_schema.CharacterBase, db: Session) : 
    new_character = Character(
        novel_pk=novel_pk,  # novel_pk는 함수 인자로 받아옴
        name=character_info.name,
        role=character_info.role,
        age=character_info.age,
        sex=character_info.sex,
        job=character_info.job,
        profile=character_info.profile,
    )
    db.add(new_character)
    db.commit()
    return new_character

# 특정 등장인물 정보 수정
def update_character(character_pk : int,update_data: novel_schema.CharacterUpdateBase, db: Session) : 
    character = db.query(Character).filter(Character.character_pk == character_pk).first()
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="등장 인물을 찾을 수 없습니다.")

    update_data_dict = update_data.model_dump(exclude_unset=True)  # 변경된 데이터만 가져오기

    for key, value in update_data_dict.items():
        setattr(character, key, value)  # 필드 업데이트

    db.commit()
    db.refresh(character)
    return character

#등장인물 삭제
def delete_character(character_pk : int, db: Session) : 
    character = db.query(Character).filter(Character.character_pk == character_pk)
    db.delete(character)
    db.commit()
    db.refresh()
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)

#등장인물 AI 생성

#등장인물 저장 

#표지 불러오기

#표지 생성하기

#표지 저장

