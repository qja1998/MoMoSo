const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 세션별 참가자 관리
const rooms = new Map();
const roomHosts = new Map(); // 방별 호스트 정보 저장

io.on('connection', (socket) => {
  console.log('사용자가 연결됨:', socket.id);

  // 세션 참가
  socket.on('join-room', (roomId, username) => {
    socket.join(roomId);
    
    // 방이 없으면 새로 생성하고 호스트로 지정
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
      roomHosts.set(roomId, socket.id); // 호스트 ID 저장
    }

    const isHost = roomHosts.get(roomId) === socket.id;
    rooms.get(roomId).add({ id: socket.id, username, isHost });

    // 같은 방의 다른 참가자들에게 새 참가자 알림
    socket.to(roomId).emit('user-joined', { userId: socket.id, username, isHost });

    // 새 참가자에게 기존 참가자 목록 전송
    const participants = Array.from(rooms.get(roomId));
    socket.emit('room-users', participants);
  });

  // WebRTC 시그널링
  socket.on('signal', ({ userToSignal, callerId, signal }) => {
    io.to(userToSignal).emit('receiving-signal', { signal, from: callerId });
  });

  // 연결 해제 처리
  socket.on('disconnect', () => {
    rooms.forEach((participants, roomId) => {
      participants.forEach(participant => {
        if (participant.id === socket.id) {
          participants.delete(participant);
          io.to(roomId).emit('user-left', socket.id);

          // 호스트가 나가면 방 삭제
          if (roomHosts.get(roomId) === socket.id) {
            rooms.delete(roomId);
            roomHosts.delete(roomId);
            io.to(roomId).emit('host-left');
          }
        }
      });
      if (participants.size === 0) {
        rooms.delete(roomId);
        roomHosts.delete(roomId);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 