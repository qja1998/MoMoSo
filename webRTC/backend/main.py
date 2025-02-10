from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pathlib import Path
import datetime
import aiofiles
import os
import json
import uuid
import speech_recognition as sr
from pydantic import BaseModel
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/api/audio")
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


@app.post("/api/meeting-minutes")
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
        filename = f"meeting_{timestamp}_{meeting_data['id'][:8]}.json"
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

@app.get("/api/meeting-minutes")
async def list_meeting_minutes():
    try:
        meeting_minutes_dir = Path("meeting_minutes")
        
        if not meeting_minutes_dir.exists():
            return []
        
        # 파일 목록 가져오기 (최신순 정렬)
        files = sorted(
            [f for f in os.listdir(meeting_minutes_dir) if f.endswith('.json')], 
            key=lambda x: os.path.getctime(meeting_minutes_dir / x), 
            reverse=True
        )
        
        # 각 파일의 기본 정보 추출
        meeting_list = []
        for file_name in files:
            with open(meeting_minutes_dir / file_name, 'r', encoding='utf-8') as f:
                meeting_data = json.load(f)
                meeting_list.append({
                    "id": meeting_data.get("id"),
                    "room_name": meeting_data.get("room_name"),
                    "host_name": meeting_data.get("host_name"),
                    "start_time": meeting_data.get("start_time"),
                    "duration": meeting_data.get("duration")
                })
        
        return meeting_list
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/meeting-minutes/{meeting_id}")
async def get_meeting_minutes(meeting_id: str):
    try:
        meeting_minutes_dir = Path("meeting_minutes")
        
        # 해당 ID를 포함하는 파일 찾기
        matching_files = [f for f in os.listdir(meeting_minutes_dir) if meeting_id in f]
        
        if not matching_files:
            raise HTTPException(status_code=404, detail="회의록을 찾을 수 없습니다.")
        
        # 가장 최근 파일 선택
        file_name = max(matching_files, key=lambda x: os.path.getctime(meeting_minutes_dir / x))
        
        with open(meeting_minutes_dir / file_name, 'r', encoding='utf-8') as f:
            meeting_data = json.load(f)
        
        return meeting_data
    
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