from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from database import get_db
from fastapi import APIRouter,Depends,HTTPException,status,Response,Request
from fastapi.security import OAuth2PasswordRequestForm
from user import user_schema,user_crud
import jwt

## 아래는 로그인 토큰 설정정
import os
from dotenv import load_dotenv
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_ECPIRE_MINUTES = float(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))



app = APIRouter(
    prefix="/user"
)

@app.post(path="/signup")
async def signup(new_user: user_schema.NewUserForm, db:Session = Depends(get_db)):
    # 회원 존재 여부 확인
    user = user_crud.get_user(new_user.email, db)

    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail = "User already exists")
    user_crud.create_user(new_user,db)
    return HTTPException(status_code=status.HTTP_200_OK, detail='Signup successful')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta  # Use timezone-aware UTC
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)  # Default expiry
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



@app.post(path="/login")
async def login(response:Response, login_form:OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 회원 존재 여부 확인
    user = user_crud.get_user(login_form.username,db)

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid user or password')
    
    # 로그인
    res = user_crud.verify_password(login_form.password,user.hashed_pw)

    # 토큰 생성
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_ECPIRE_MINUTES)
    access_token = create_access_token(data={"sub":user.user_name},expires_delta=access_token_expires)

    # 쿠키에 저장
    response.set_cookie(key="access_token",value=access_token,expires=access_token_expires,httponly=True)

    if not res:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Invalid user or password")
    
    # return HTTPException(status_code=status.HTTP_200_OK,detail="Login successful")
    return user_schema.Token(access_token=access_token,token_type="bearer")

@app.get(path="/logout")
async def logout(response:Response,request:Request):
    access_token = request.cookies.get("access_token")

    # 쿠키 삭제
    response.delete_cookie(key="access_token")

    return HTTPException(status_code=status.HTTP_200_OK,detail="Logout successful")