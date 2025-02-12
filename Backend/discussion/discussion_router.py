from fastapi import Depends, HTTPException, APIRouter, status
from sqlalchemy.orm import Session
from typing import List

from . import discussion_crud, discussion_schema
from database import get_db

from models import User
from utils.auth_utils import get_current_user

app = APIRouter(
    prefix='/api/v1/discussion',
)

@app.get('/', description="토론 방 전체 조회", response_model=List[discussion_schema.Discussion])
def get_all_discussions(db: Session = Depends(get_db)):
    """
    모든 토론 방 목록 조회.
    """
    return discussion_crud.get_discussions(db)

@app.get("/{discussion_pk}", response_model=discussion_schema.Discussion)
def get_discussion(discussion_pk: int, db: Session = Depends(get_db)):
    """
    특정 토론 방 조회
    """
    return discussion_crud.get_discussion(db, discussion_pk)


@app.get("enter-room/{discussion_pk}")
def enter_discussion_room(discussion_pk: int, user_pk:int, db: Session = Depends(get_db)):
    """
    특정 토론 방 접속 : user가 해당 토론 방에 예약된 participant인지 확인 후, 예약된 방의 session_id 던져주는 로직
    """
    return discussion_crud.get_discussion_sessionid(db, discussion_pk, user_pk)


@app.post("/", response_model=discussion_schema.GetNewDiscussion, status_code=status.HTTP_201_CREATED)
def create_discussion(
    discussion: discussion_schema.NewDiscussionForm,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    새로운 토론 방 생성 (로그인한 사용자만 가능)
    """
    new_discussion = discussion_crud.create_discussion(db, discussion, current_user)

    return new_discussion


@app.post("/{discussion_pk}/participants/{user_pk}", response_model=discussion_schema.Discussion, description="토론방 유저 추가")
def add_participant(discussion_pk: int, user_pk: int, db: Session = Depends(get_db)):
    """
    토론 방에 유저 추가.
    """
    return discussion_crud.add_participant(db, discussion_pk, user_pk)


@app.delete("/{discussion_pk}/participants/{user_pk}", response_model=discussion_schema.Discussion, description="토론방 유저 삭제")
def remove_participant(discussion_pk: int, user_pk: int, db: Session = Depends(get_db)):
    """
    토론 방에서 유저 삭제.
    """
    return discussion_crud.remove_participant(db, discussion_pk, user_pk)


@app.put("/{discussion_pk}", response_model=discussion_schema.Discussion)
def update_discussion(discussion_pk: int, discussion_update: discussion_schema.NewDiscussionForm, db: Session = Depends(get_db)):
    """
    토론 방 정보 수정.
    """
    updated_discussion = discussion_crud.update_discussion(db, discussion_pk, discussion_update)
    return updated_discussion

@app.delete("/{discussion_pk}", status_code=status.HTTP_200_OK)
def delete_discussion(discussion_pk: int, db: Session = Depends(get_db)):
    """
    토론 방 삭제.
    """
    discussion_crud.delete_discussion(db, discussion_pk)
    return {"message":"토론 방 삭제 완료"}

@app.post('/note', description="토론 요약본 저장")
def create_discussion_summary(db:Session=Depends(get_db)):
    """
    AI 쪽에서 정보 받아와서 저장 필요
    """
    pass



# =============================WebRTC 어셈블==================================
from fastapi import UploadFile, File, Form, HTTPException
from pathlib import Path
import uvicorn
import datetime
import aiofiles
import os
import json
import uuid
import speech_recognition as sr
from pydantic import BaseModel
from typing import List


UPLOAD_DIR = Path("audio_uploads")

class MeetingMinutesData(BaseModel):
    room_name: str
    host_name: str
    start_time: str
    end_time: str
    duration: float
    participants: List[str]
    messages: List[dict]


async def process_audio_to_text(file_path):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(str(file_path)) as source:
            # 주변 노이즈 처리
            # recognizer.adjust_for_ambient_noise(source, duration=1)
            # recognizer.adjust_for_ambient_noise(source)
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language='ko-KR')
            return text
    except sr.UnknownValueError:
        print(f"음성을 인식할 수 없습니다: {file_path}")
        return ""
    except sr.RequestError as e:
        print(f"Google 음성 인식 서비스 오류: {e}")
        return "음성 인식 서비스 오류"
    except Exception as e:
        print(f"음성 처리 중 오류 발생: {e}")
        return "음성 처리 오류"


@app.post("/api/audio", description="STT wav. 파일 생성")
async def receive_audio(
    audio: UploadFile = File(...),
    roomName: str = Form(...),
    userName: str = Form(...)
):
    try:
        # 방 폴더 생성
        room_dir = UPLOAD_DIR / roomName
        room_dir.mkdir(parents=True, exist_ok=True)

        # 사용자 폴더 생성
        user_dir = room_dir / userName
        user_dir.mkdir(exist_ok=True)

        # transcriptions 폴더 생성
        transcription_dir = user_dir / "transcriptions"
        transcription_dir.mkdir(exist_ok=True)

        # 오디오 파일 저장
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        audio_filename = f"audio_{timestamp}.wav"
        audio_path = user_dir / audio_filename

        # 파일 저장
        async with aiofiles.open(audio_path, "wb") as out_file:
            content = await audio.read()
            await out_file.write(content)

        # STT 변환
        text = await process_audio_to_text(audio_path)

        # 변환된 텍스트 저장
        if text:
            text_filename = f"audio_{timestamp}.txt"
            text_path = transcription_dir / text_filename
            async with aiofiles.open(text_path, "w", encoding="utf-8") as f:
                await f.write(text)

        return {
            "message": "Audio processed successfully",
            "room": roomName,
            "user": userName,
            "filename": audio_filename,
            "text": text,
            "timestamp": timestamp
        }
    
    except Exception as e:
        print(f"Error processing audio: {e}")
        return {"error": str(e)}


@app.post("/api/meeting-minutes", description="STT 내용용 저장")
async def create_meeting_minutes(
    room_name: str = Form(...),
    host_name: str = Form(...),
    start_time: str = Form(...),
    end_time: str = Form(...),
    duration: float = Form(...),
    participants: str = Form(...),
    messages: str = Form(...)
):
    try:
        # JSON 문자열을 파이썬 객체로 변환
        participants_list = json.loads(participants)
        messages_list = json.loads(messages)

        # 회의록 데이터 저장 로직
        meeting_data = {
            "id": str(uuid.uuid4()),
            "room_name": room_name,
            "host_name": host_name,
            "start_time": start_time,
            "end_time": end_time,
            "duration": duration,
            "participants": participants_list,
            "messages": messages_list
        }

        # 회의록 디렉토리 생성
        os.makedirs('meeting_minutes', exist_ok=True)
        
        # 파일명 생성
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        # filename = f"meeting_{timestamp}_{meeting_data['id'][:8]}.json"
        filename = f"meeting_{timestamp}_{meeting_data['room_name']}.json"
        filepath = os.path.join('meeting_minutes', filename)
        
        # JSON 파일로 저장
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(meeting_data, f, ensure_ascii=False, indent=4)
        
        return {
            "message": "회의록이 성공적으로 저장되었습니다.",
            "meeting_id": meeting_data['id'],
            "filename": filename
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=True,
        ssl_keyfile="cert.key",
        ssl_certfile="cert.crt"
    )
