
from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from passlib.context import CryptContext


from . import user_crud, user_schema
from utils import auth_utils
from database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = APIRouter(
    prefix='/api/v1/user',
)

@app.get('/', description="전체 사용자 조회", response_model=list[user_schema.User])
def get_users(db:Session=Depends(get_db)):
    users = user_crud.get_users(db)
    return users


@app.get('/{user_id}', description="개별 사용자 조회", response_model=user_schema.User)
def get_user(user_id:int, db:Session=Depends(get_db)):
    user = user_crud.get_user(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not Found")
    return user


@app.put('/{user_id}', description='사용자 정보 수정', response_model=user_schema.User)
def update_user(user_id:int, updated_user:user_schema.UpdateUserForm, db:Session=Depends(get_db)):
    user = user_crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not Found")

    # 전화번호 변경 시 인증 여부 확인
    if updated_user.phone and updated_user.phone != user.phone:
        auth_utils.check_verified(updated_user.phone)

    # 사용자 정보 수정
    updated_user = user_crud.update_user(db, user, updated_user)
    return updated_user


@app.delete('/{user_id}', description='사용자 계정 삭제')
def delete_user(
    user_id: int,
    credentials: user_schema.DeleteUserForm,  # 이메일과 비밀번호 포함
    db: Session = Depends(get_db)
):
    # 사용자 조회
    user = user_crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not Found")

    # 이메일 검증
    if user.email != credentials.email:
        raise HTTPException(status_code=401, detail="Invalid email")

    # 비밀번호 검증
    if not pwd_context.verify(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    # 사용자 삭제
    user_crud.delete_user(db, user)
    return {"message": "User deleted successfully"}
