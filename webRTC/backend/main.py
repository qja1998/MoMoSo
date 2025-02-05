from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pathlib import Path
import datetime
import aiofiles
import os
import speech_recognition as sr

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("audio_uploads")

async def process_audio_to_text(file_path):
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(str(file_path)) as source:
            # 주변 노이즈 처리
            recognizer.adjust_for_ambient_noise(source, duration=1)
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