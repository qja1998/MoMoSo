import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SessionJoin from './SessionJoin';

const VideoConference = () => {
  // 상태 관리
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peers, setPeers] = useState({});
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState([]);

  // ref 설정
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const roomIdRef = useRef(null);

  // STUN/TURN 서버 설정
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // 실제 환경에서는 TURN 서버도 추가하는 것이 좋습니다
      /*
      {
        urls: 'turn:your-turn-server.com:3478',
        username: 'username',
        credential: 'credential'
      }
      */
    ]
  };

  // 로컬 스트림이 변경될 때마다 비디오 요소에 연결
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      console.log('로컬 비디오 요소에 스트림 설정 시도');
      console.log('로컬 스트림 상태:', {
        active: localStream.active,
        tracks: localStream.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted
        }))
      });
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // 원격 스트림 상태 모니터링
  useEffect(() => {
    console.log('원격 스트림 상태 변경:', {
      streamCount: Object.keys(remoteStreams).length,
      streams: Object.entries(remoteStreams).map(([peerId, stream]) => ({
        peerId,
        active: stream.active,
        tracks: stream.getTracks().map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted
        }))
      }))
    });
  }, [remoteStreams]);

  // 참가자 상태 모니터링
  useEffect(() => {
    console.log('참가자 목록 변경:', {
      participantCount: participants.length,
      participants: participants.map(p => ({
        id: p.id,
        username: p.username,
        isHost: p.isHost
      }))
    });
  }, [participants]);

  const handleJoinSession = (roomId, username) => {
    roomIdRef.current = roomId;
    socketRef.current = io('http://192.168.31.150:3001');
  
    const mediaConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: true
    };
    // 미디어 스트림 가져오기
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log('스트림 획득 성공:', stream.getTracks());
        setLocalStream(stream);

        // 방 참가
        socketRef.current.emit('join-room', roomId, username);

        // 기존 참가자 목록 수신
        socketRef.current.on('room-users', (users) => {
          console.log('기존 참가자 목록:', users);
          setParticipants(users);
          users.forEach(user => {
            if (user.id !== socketRef.current.id) {
              const peer = createPeer(user.id, socketRef.current.id, stream);
              peersRef.current[user.id] = peer;
              setPeers(prev => ({ ...prev, [user.id]: peer }));
            }
          });
        });

        // 새로운 참가자 처리
        socketRef.current.on('user-joined', ({ userId, username, isHost }) => {
          console.log('새 참가자 접속:', { userId, username, isHost });
          const peer = createPeer(userId, socketRef.current.id, stream);
          peersRef.current[userId] = peer;
          setPeers(prev => ({ ...prev, [userId]: peer }));
          setParticipants(prev => [...prev, { id: userId, username, isHost }]);
        });

        // 시그널링 처리 추가
        socketRef.current.on('receiving-signal', async ({ signal, from }) => {
          try {
            console.log('시그널 수신됨:', { from, signalType: JSON.parse(signal).type });
            const parsedSignal = JSON.parse(signal);
            
            if (!peersRef.current[from]) {
              // 새로운 피어 연결
              const peer = await addPeer(signal, from, stream);
              peersRef.current[from] = peer;
              setPeers(prev => ({ ...prev, [from]: peer }));
            } else {
              // 기존 피어 연결에 시그널 추가
              const peer = peersRef.current[from];
              if (parsedSignal.type === 'candidate' && peer.remoteDescription) {
                await peer.addIceCandidate(new RTCIceCandidate(parsedSignal.candidate));
              }
            }
          } catch (err) {
            console.error('시그널 처리 실패:', err);
          }
        });

        // 호스트 퇴장 처리
        socketRef.current.on('host-left', () => {
          alert('호스트가 방을 나갔습니다.');
          window.location.reload();
        });

        // 참가자 퇴장 처리
        socketRef.current.on('user-left', (userId) => {
          console.log('참가자 퇴장:', userId);
          if (peersRef.current[userId]) {
            peersRef.current[userId].close();
            const peersCopy = { ...peersRef.current };
            delete peersCopy[userId];
            peersRef.current = peersCopy;
            setPeers(peersCopy);
            
            // 원격 스트림 제거
            setRemoteStreams(prev => {
              const copy = { ...prev };
              delete copy[userId];
              return copy;
            });
          }
          setParticipants(prev => prev.filter(p => p.id !== userId));
        });

        setIsJoined(true);
      });
  };

  useEffect(() => {
    return () => {
      // 정리: 연결 해제 및 스트림 정지
      socketRef.current?.disconnect();
      localStream?.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(peer => peer.close());
    };
  }, []);

  // 새로운 피어 연결 생성
  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new RTCPeerConnection(iceServers);
    
    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });
  
    // 시그널링 상태 모니터링
    peer.onsignalingstatechange = () => {
      console.log('Signaling State Change:', peer.signalingState);
    };
  
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate 생성:', event.candidate);
        socketRef.current.emit('signal', {
          userToSignal,
          callerId,
          signal: JSON.stringify({ type: 'candidate', candidate: event.candidate })
        });
      }
    };
  
    peer.ontrack = (event) => {
      console.log('트랙 수신됨:', event.streams[0]);
      setRemoteStreams(streams => ({
        ...streams,
        [userToSignal]: event.streams[0]
      }));
    };
  
    // Offer 생성 및 전송
    const createOffer = async () => {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socketRef.current.emit('signal', {
          userToSignal,
          callerId,
          signal: JSON.stringify(offer)
        });
      } catch (err) {
        console.error('Offer 생성 실패:', err);
      }
    };
  
    createOffer();
    return peer;
  };

  // 기존 피어 연결에 추가
  const addPeer = async (incomingSignal, callerId, stream) => {
    console.log('addPeer 호출됨:', { callerId, signal: incomingSignal });
    const peer = new RTCPeerConnection(iceServers);
    
    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });
  
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate 생성 (응답):', event.candidate);
        socketRef.current.emit('signal', {
          userToSignal: callerId,
          callerId: socketRef.current.id,
          signal: JSON.stringify({ type: 'candidate', candidate: event.candidate })
        });
      }
    };
  
    peer.ontrack = (event) => {
      console.log('트랙 수신됨 (응답):', event.streams[0]);
      setRemoteStreams(streams => ({
        ...streams,
        [callerId]: event.streams[0]
      }));
    };
  
    try {
      const signal = JSON.parse(incomingSignal);
      console.log('시그널링 상태:', peer.signalingState);
      console.log('수신된 시그널:', signal);
  
      if (signal.type === 'offer') {
        // offer 처리
        await peer.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socketRef.current.emit('signal', {
          userToSignal: callerId,
          callerId: socketRef.current.id,
          signal: JSON.stringify(answer)
        });
      } else if (signal.type === 'candidate') {
        // ICE candidate 처리
        if (peer.remoteDescription) {
          await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    } catch (err) {
      console.error('피어 연결 실패:', err);
    }
  
    return peer;
  };

  if (!isJoined) {
    return <SessionJoin onJoin={handleJoinSession} />;
  }

  return (
    <div className="video-conference">
      <div className="videos-grid">
        {/* 로컬 비디오 */}
        <div className="video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', borderRadius: '8px' }}
            onLoadedMetadata={() => console.log('로컬 비디오 메타데이터 로드됨')}
            onPlay={() => console.log('로컬 비디오 재생 시작')}
            onError={(e) => console.error('로컬 비디오 에러:', e)}
          />
          <div className="video-label">
            {participants.find(p => p.id === socketRef.current?.id)?.isHost 
              ? '나 (호스트)' 
              : '나'}
          </div>
          {!localStream && <div className="video-status">카메라 연결 중...</div>}
        </div>

        {/* 원격 비디오들 */}
        {Object.entries(remoteStreams).map(([peerId, stream]) => {
          const participant = participants.find(p => p.id === peerId);
          return (
            <div key={peerId} className="video-container">
              <video
                autoPlay
                playsInline
                ref={(element) => {
                  if (element && stream) {
                    element.srcObject = stream;
                    element.play().catch(e => 
                      console.error(`비디오 재생 실패 (${peerId}):`, e)
                    );
                  }
                }}
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  transform: 'scaleX(-1)' // 미러링 효과 추가
                }}
              />
              <div className="video-label">
                {participant?.username || '참가자'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoConference; 