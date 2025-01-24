from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Set
import logging
import json
import aiofiles
import os
import time

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["SET_IP", "SET_IP"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class Room:
    def __init__(self, name: str):
        self.name = name
        self.participants: Set[WebSocket] = set()

class ConnectionManager:
    def __init__(self):
        self.active_rooms: Dict[str, Room] = {}  # 방 이름 -> Room 객체 매핑
        self.connection_count = 0

    async def connect(self, websocket: WebSocket, room_name: str):
        try:
            await websocket.accept()
            
            # 방이 없으면 새로 생성
            if room_name not in self.active_rooms:
                self.active_rooms[room_name] = Room(room_name)
            
            room = self.active_rooms[room_name]
            room.participants.add(websocket)
            self.connection_count += 1
            
            logger.info(f"Client connected to room {room_name}. Participants in room: {len(room.participants)}")
            await self.broadcast_to_room(
                room_name,
                {
                    "type": "system",
                    "message": f"새로운 참가자가 입장했습니다. (현재 {len(room.participants)}명)"
                }
            )
            
        except Exception as e:
            logger.error(f"Error accepting connection: {e}")
            raise

    async def disconnect(self, websocket: WebSocket):
        # 모든 방을 확인하여 참가자 제거
        for room_name, room in list(self.active_rooms.items()):
            if websocket in room.participants:
                room.participants.remove(websocket)
                self.connection_count -= 1
                logger.info(f"Client disconnected from room {room_name}. Participants remaining: {len(room.participants)}")
                
                # 방에 아무도 없으면 방 삭제
                if not room.participants:
                    del self.active_rooms[room_name]
                    logger.info(f"Room {room_name} deleted - no participants remaining")
                else:
                    # 남은 참가자들에게 퇴장 메시지 전송
                    await self.broadcast_to_room(
                        room_name,
                        {
                            "type": "system",
                            "message": f"참가자가 퇴장했습니다. (현재 {len(room.participants)}명)"
                        }
                    )
                break

    async def broadcast_to_room(self, room_name: str, message: dict, sender: WebSocket = None):
        if room_name in self.active_rooms:
            room = self.active_rooms[room_name]
            for participant in room.participants:
                if participant != sender:
                    try:
                        await participant.send_json(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting message: {e}")
                        await self.disconnect(participant)

manager = ConnectionManager()

@app.get("/")
async def get_status():
    rooms_info = {name: len(room.participants) for name, room in manager.active_rooms.items()}
    return {
        "status": "running",
        "total_connections": manager.connection_count,
        "active_rooms": rooms_info
    }

@app.websocket("/ws/{room_name}")
async def websocket_endpoint(websocket: WebSocket, room_name: str):
    await manager.connect(websocket, room_name)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                logger.info(f"Received message in room {room_name}: {message}")
                
                # 메시지를 같은 방의 다른 참가자들에게 브로드캐스트
                await manager.broadcast_to_room(room_name, message, websocket)
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                await websocket.send_json(
                    {"type": "error", "message": "Invalid message format"}
                )
                
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in websocket connection: {e}")
        await manager.disconnect(websocket)

import subprocess
from fastapi import FastAPI, File, UploadFile
import os
import time

@app.post("/audio-stream/{room_name}")
async def receive_audio(room_name: str, audio: UploadFile = File(...)):
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        save_dir = os.path.join(base_dir, "audio_recordings", room_name)
        os.makedirs(save_dir, exist_ok=True)
        
        timestamp = int(time.time() * 1000)
        webm_file = os.path.join(save_dir, f"chunk_{timestamp}.wav")
        
        async with aiofiles.open(webm_file, 'wb') as out_file:
            content = await audio.read()
            await out_file.write(content)
        
        return {"status": "success", "file": webm_file}
        
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    
    # 환경 변수 설정
    port = int(os.getenv("PORT", 8000))
    
    # SSL 설정
    ssl_keyfile = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "webrtc-chat", "cert.key")
    ssl_certfile = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "webrtc-chat", "cert.crt")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=True,
        ssl_keyfile=ssl_keyfile,
        ssl_certfile=ssl_certfile
    )