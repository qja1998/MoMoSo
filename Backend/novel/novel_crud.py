from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status, Request

from sqlalchemy import select
from . import novel_schema
from models import Novel, Episode, Comment, CoComment, Character, Genre, novel_genre_table, user_like_table, User
# from sqlalchemy import select
from datetime import datetime, timedelta
from collections import Counter
import os 


# 구글 드라이브에 저장하는 기능 
from fastapi import File, UploadFile
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account

# 모든 소설 가져오기
# 장르가 여러개가 되니까 이걸 같이 가져와야 함
def get_all_novel(db: Session):
    novels = db.query(Novel).options(joinedload(Novel.genres)).all()
    
    # SQLAlchemy 객체를 Pydantic 모델로 변환
    return [
        novel_schema.NovelShowBase(
            novel_pk=novel.novel_pk,
            title=novel.title,
            created_date=novel.created_date,
            updated_date=novel.updated_date,
            novel_img=novel.novel_img,
            views=novel.views,
            likes=novel.likes,
            is_completed=novel.is_completed,
            genre=[
                novel_schema.GenreGetBase(
                    genre_pk=genre.genre_pk,
                    name=genre.name
                ) for genre in novel.genres  # 🔥 필수값 유지
            ]
        )
        for novel in novels
    ]




# 소설 검색 (pk 기반, 테스트 용도라 추후 삭제)
def search_novel(novel_pk: str, db: Session):
    return db.query(Novel).filter(Novel.novel_pk == novel_pk).all()


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

    update_data_dict = update_data.model_dump(exclude_unset=True)

    #필드 업데이트
    for key, value in update_data_dict.items():
        if key != "genre":
            setattr(novel, key, value)

        # 2. 장르 업데이트
        else :
            new_genres = update_data_dict["genre"]

            # *** Correct way to update genres ***
            novel.genres = []  # Clear existing genres
            for genre_name in new_genres:
                genre = db.query(Genre).filter(Genre.genre == genre_name).first()
                if genre:
                    novel.genres.append(genre)
                else:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{genre_name} 장르를 찾을 수 없습니다.")


    db.commit()
    db.refresh(novel)  # Refresh after commit
    
    return novel  # Return the updated novel

#소설 삭제(장르 중계 테이블도 삭제해줘야 함.)
def delete_novel(novel_pk: int, db: Session):
    novel = db.query(Novel).filter(Novel.novel_pk == novel_pk).first()
    db.delete(novel)
    db.commit()
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)

def like_novel(novel_pk: int, user_pk: int, db: Session):
    novel = db.query(Novel).filter(Novel.novel_pk == novel_pk).first()
    if not novel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="소설을 찾을 수 없습니다.")

    user = db.query(User).filter(User.user_pk == user_pk).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    if user in novel.liked_users:
        novel.liked_users.remove(user)
        novel.likes -= 1
    else:
        novel.liked_users.append(user)
        novel.likes += 1

    db.commit()
    db.refresh(novel)  # 갱신된 소설 객체를 DB에서 다시 로드
    return novel

# 메인 화면 추천 서비스 

# 실시간 인기
# 최근 이틀간 가장 선호작 수가 많은 책
#days에 2를 넣으면 지금뜨는 선호작, 30을넣으면 이번달 선호작
def recent_hit(days : int, db : Session) : 
    today = datetime.now()
    day_2_back = today - timedelta(days=days)

    recent_hit = db.query(user_like_table).filter(user_like_table.liked_date >= day_2_back).all()
    
    if not recent_hit : 
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="최근 선호작이 없습니다.")
    
    novel_pks = [like[0] for like in recent_hit]  # 각 튜플의 첫 번째 요소(novel_pk) 추출

    # Counter를 사용하여 가장 흔한 novel_pk 찾기
    if not novel_pks:
        most_common_novel_pk = Counter(novel_pks).most_common(1)[0][0]
        return most_common_novel_pk
    else:
        return None
    

#추천 작품
def momoso_recommend(db : Session) :
    #일단 유저가 가장 많이 읽은 장르를 sorting함.  #novel_genre 테이블에서가장 많이 한 것 sorting
    #조회수 높은 기준으로 sorting함. 
    #조회수 대비 선호작이 가장 놓은 작품 sorting함.
    #이거 3개를 매번 sorting하면 됨.
    # liked, views
    
    genres = db.query(Genre).all()
    
    genres_count = []
    for genre in genres : 
        count = db.query(Novel).join(Novel.genres).filter(Genre.gerne_pk == genre.genre_pk)
        genres_count.append([count, genre.genre])
        
    genre = genres_count.sort()[0][1]

    #속도가 느릴 것 같아서 조금 더 고민해보자. 딱 한번만 더 모델을 바꾸면 진짜 최고인데....ㅠㅠㅠㅠ 하 진짜 
    # 아니면 선호작만 할까?
    # 선호작 대비해서 조회수를 계산하면 좋긴한데 좀 느림.

#에피소드

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
def change_episode(novel_pk: int, update_data: novel_schema.EpisodeUpdateBase, episode_pk : int, db: Session) :
    
    episode  = db.query(Episode).filter(Episode.ep_pk == episode_pk).first()
    if not episode :
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    update_data_dict = update_data.model_dump(exclude_unset=True)  # 변경된 데이터만 가져오기
    print(update_data_dict)
    for key, value in update_data_dict.items():
        setattr(episode, key, value)  # 필드 업데이트
    db.commit()
    db.refresh(episode)
    return episode 


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
def like_comment(comment_pk: int,user_pk : int,db: Session):
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    user = db.query(User).filter(User.user_pk == user_pk).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="댓글을 찾을 수 없습니다.")
    if not user : 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail= "해당 유저를 찾을 수 없습니다.")

    if user in comment.liked_users:
        comment.liked_users.remove(user)
        comment.likes -= 1
    else:
        comment.liked_users.append(user)
        comment.likes += 1

    db.commit()
    db.refresh(comment)  # 변경된 comment 객체를 DB에서 다시 로드

    return comment


# 대댓글 작성
def create_cocoment(comment_pk: int, user_pk: int, cocoment_info: novel_schema.CoComentBase, db: Session):
    
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    print("______________________comment________")
    print(comment)
    
    if not comment : 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="no such comment")

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
def like_cocomment(cocomment_pk: int, user_pk: int, db: Session):
    cocomment = db.query(CoComment).filter(CoComment.cocomment_pk == cocomment_pk).first()
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")

    user = db.query(User).filter(User.user_pk == user_pk).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    if user in cocomment.liked_users:
        cocomment.liked_users.remove(user)
        cocomment.likes -= 1
    else:
        cocomment.liked_users.append(user)
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
# 흠 왜 안될까?
def delete_cocomment(cocomment_pk: int, db: Session):
    cocomment = db.query(CoComment).filter(CoComment.cocomment_pk == cocomment_pk).first()
    if not cocomment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="대댓글을 찾을 수 없습니다.")
    
    db.delete(cocomment)
    db.commit()
    return HTTPException(status_code=status.HTTP_204_NO_CONTENT)

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
def update_character(character_pk : int, update_data: novel_schema.CharacterUpdateBase, db: Session) : 
    character = db.query(Character).filter(Character.character_pk == character_pk).first()
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="등장 인물을 찾을 수 없습니다.")

    update_data_dict = update_data.model_dump(exclude_unset=True)  # 변경된 데이터만 가져오기

    print(update_data_dict)
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

#표지 불러오기(AI)
def generate_cover() : 
    pass


SCOPES = ['https://www.googleapis.com/auth/drive.file']
#표지 저장
def save_cover(image_path, drive_folder_id):
    """
    이미지를 Google Drive에 업로드합니다.

    Args:
        image_path (str): 업로드할 이미지 파일 경로.
        drive_folder_id (str): 이미지를 저장할 Google Drive 폴더 ID.

    Returns:
        dict: 업로드 성공 시 파일 ID를 포함한 결과 반환.
        None: 업로드 실패 시 None 반환.
    """
    # .env에서 서비스 계정 정보 로드
    credentials_info = {
        "type": os.getenv("GOOGLE_TYPE"),
        "project_id": os.getenv("GOOGLE_PROJECT_ID"),
        "private_key_id": os.getenv("GOOGLE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("GOOGLE_PRIVATE_KEY").replace('\\n', '\n'),
        "client_email": os.getenv("GOOGLE_CLIENT_EMAIL"),
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "auth_uri": os.getenv("GOOGLE_AUTH_URI"),
        "token_uri": os.getenv("GOOGLE_TOKEN_URI"),
        "auth_provider_x509_cert_url": os.getenv("GOOGLE_AUTH_PROVIDER_X509_CERT_URL"),
        "client_x509_cert_url": os.getenv("GOOGLE_CLIENT_X509_CERT_URL"),
        "universe_domain": "googleapis.com"
    }

    # Credentials 객체 생성
    creds = service_account.Credentials.from_service_account_info(credentials_info)

    # 파일 존재 여부 확인
    if not os.path.exists(image_path):
        print(f"파일이 존재하지 않습니다: {image_path}")

    try:
        # Google Drive API 서비스 객체 생성
        service = build('drive', 'v3', credentials=creds)

        # 파일 메타데이터 설정
        file_metadata = {
            'name': os.path.basename(image_path),
            'parents': [drive_folder_id]
        }

        # 미디어 파일 업로드 객체 생성
        media = MediaFileUpload(image_path, mimetype='image/jpeg', resumable=False)

        # 파일 업로드 요청 실행
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
        
        print(f'파일이 업로드되었습니다. File ID: {file.get("id")}')
        return {"file_id": file.get("id")}
    
    except Exception as e:
        print(f"업로드 실패: {e}")
        return None
