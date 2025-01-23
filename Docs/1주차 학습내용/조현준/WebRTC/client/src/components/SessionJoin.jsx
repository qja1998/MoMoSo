import { useState } from 'react';

const SessionJoin = ({ onJoin }) => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const generateRandomRoomId = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    setRoomId(randomId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (roomId.trim() && username.trim()) {
      onJoin(roomId, username);
    }
  };

  return (
    <div className="session-join">
      <h2>화상 회의 참가</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            세션 ID:
            <div className="room-id-container">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="세션 ID를 입력하세요"
                required
              />
              <button type="button" onClick={generateRandomRoomId}>
                랜덤 생성
              </button>
            </div>
          </label>
        </div>
        <div>
          <label>
            사용자 이름:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="이름을 입력하세요"
              required
            />
          </label>
        </div>
        <button type="submit">참가하기</button>
      </form>
    </div>
  );
};

export default SessionJoin; 