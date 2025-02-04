from . import novel_schema
from models import Novel, Comment, CoComment, Episode
from fastapi import HTTPException, status
from sqlalchemy.orm import Session


def get_all_novel(db : Session) : 
    novel = db.query(Novel).all()
    return novel

# 이거 front에서 search 하는게 속도가 더 빠르니까 이거 없애자...``
def search_novel(keyword : str, db : Session) : 
    novel = db.query(Novel).filter(Novel.title==keyword).all()
    return novel

def create_novel(novel_info : novel_schema.NovelCreateBase, user_pk : int, db : Session ) : 
    novel = Novel(
        title = novel_info.title,
        user_pk = user_pk,
        synopsis_pk = novel_info.synopsis_pk,
        description = novel_info.description,
        num_episode = 0,
        genre = novel_info.genre,
    )
    db.add(novel)
    db.commit()
    db.refresh(novel)
    # 저장 완료 후 HTTP response로 변경 필요
    return novel


# 소설 에피소드 검색.테스트 용이므로 추후 삭제.
def novel_episode(novel_pk : int, db : Session) : 
    episode = db.query(Episode).filter(Episode.novel_pk == novel_pk)
    return episode

def save_episode(novel_pk : int, episode_data : novel_schema.EpisodeCreateBase, db : Session) : 
    if not episode_data.ep_content : 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="comment가 없습니다.")
    episode = Episode(
        ep_title = episode_data.ep_title,
        novel_pk = novel_pk, 
        ep_content = episode_data.ep_content
    )
    db.add(episode)
    db.commit()
    db.refresh(episode)
    # 여기는 잘 되면 HTTP 200으로 바꾸자. 
    return episode


# 이거 왜 값이 계속 null이 나오는지 확인 필요. 
def get_all_ep_comment(novel_pk : int, ep_pk : int, db : Session) : 
    
    print(novel_pk, ep_pk)
    ep_comments = db.query(Comment).filter(Comment.ep_pk == ep_pk).all()
    return ep_comments



#쓸 데가 있을랑가
def get_novel_comment(novel_pk : int, db : Session) : 
    novel_comments = db.query(Comment).filter(Comment.novel_pk == novel_pk)
    return novel_comments


# 댓글 쓰기
# 코드 줄일 수 있는 방법 있을듯
#comment_info : content, cocoment_cnt, likes
def create_comment(comment_info : novel_schema.CommentBase, novel_pk : int,ep_pk : int, user_pk : int, db : Session) : 
    comment = Comment(
        novel_pk = novel_pk,
        ep_pk = ep_pk,
        user_pk = user_pk,
        content = comment_info.content,
        # cocoment_cnt = comment_info.cocoment_cnt,
        likes = comment_info.likes
    )
    return comment

# 댓글 수정
#comment_info : content, cocoment_cnt, likes
def update_comment(content : str, comment_pk : int, db : Session) : 
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    if content :
        comment.content = content
    else :
        raise HTTPException(status_code=status.HTTP_200_OK)
    db.commit()
    db.refresh(comment)
    return comment

# 댓글 삭제 

def delete_comment(comment_pk : int, db : Session) : 
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    if comment : 
        db.delete()
        db.commit()
        return HTTPException(status_code=status.HTTP_204_NO_CONTENT)
    else : 
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND)

#댓글 좋아요
def like_comment(comment_pk : int, db : Session) : 
    comment = db.query(Comment).filter(Comment.comment_pk == comment_pk).first()
    if comment : 
        comment.likes += 1
        db.commit()
        db.refresh(comment)
        return comment
    else : 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)

#대댓글 쓰기 
#comment_info : content, likes
def create_cocoment(ep_pk : int, comment_pk : int, user_pk : int, cocoment_info : novel_schema.CoComentBase, db : Session) : 
    cocoment = CoComment(
        user_pk = user_pk,
        comment_pk = comment_pk,
        content = cocoment_info.content,
        likes = cocoment_info.likes
    )

#대댓글 좋아요 
def like_cocomment(cocomment_pk : int, db : Session) : 
    cocomment = db.query(CoComment).filter(CoComment.comment_pk == cocomment_pk).first()
    if cocomment : 
        cocomment.likes += 1
        db.commit()
        db.refresh()
        return cocomment
    else : 
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST)
    
#대댓글 수정 
def update_cocomment(content : str, cocoment_pk : int, db : Session) : 
    cocomment = db.query(CoComment).filter(CoComment.cocomment_pk == cocoment_pk).first()
    if cocomment != None :
        cocomment.content = content
    else :
        raise HTTPException(status_code=status.HTTP_200_OK)
    db.commit()
    db.refresh()
    return cocomment

#대댓글 삭제
def delete_cocomment(cocomment_pk : int, db : Session) : 
    cocomment = db.query(CoComment).filter(CoComment.cocomment_pk == cocomment_pk)
    if cocomment : 
        db.delete()
        db.commit()
        return HTTPException(status_code=status.HTTP_204_NO_CONTENT)
    else : 
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND)

#시놉시스 불러오기
def get_synopsis() : 
    #필터 조건으로 쓸만한게 없음.
    pass

# 시놉시스 AI 생성...이건 어떻게 할지 좀 봐야 할듯. AI 쪽 문의 필요
def generate_synopsis() :
    pass

# 시놉시스 저장, 수정이랑 같은 기능을 가짐.
def save_synopsis(synopsis_info : novel_schema.SynopsisBase, db : Session) : 
    pass

# 등장인물 불러오기

def get_character() : 
    pass 


#등장인물 AI 생성
#등장인물 저장 
#표지 불러오기
#표지 생성하기
#표지 저장





