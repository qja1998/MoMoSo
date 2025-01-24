import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Camera, CameraOff, LogOut, Send } from 'lucide-react';

import 'webrtc-adapter';
import RecordRTC from 'recordrtc';

const WebRTCChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mediaRecorderRef, setMediaRecorderRef] = useState(null);

  const wsRef = useRef(null);
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) {
      initializeWebSocket();
      startMedia();
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (peerRef.current) peerRef.current.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef) {
        mediaRecorderRef.stop();
      }
    };
  }, [isLoggedIn]);

  const initializeWebSocket = () => {
    try {
      const SERVER_IP = window.location.hostname === 'localhost' ? 'localhost' : 'SET_IP';
      const wsUrl = `wss://${SERVER_IP}:8000/ws/${encodeURIComponent(roomName)}`;
      
      console.log('WebSocket 연결 시도:', wsUrl);

      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket 연결됨');
        setIsConnected(true);
        sendWebSocketMessage({
          type: 'system',
          message: `${username}님이 ${roomName} 방에 입장하셨습니다.`
        });
      };

      wsRef.current.onmessage = handleWebSocketMessage;

      wsRef.current.onclose = (event) => {
        console.log('WebSocket 연결 끊김, 코드:', event.code);
        setIsConnected(false);
        setTimeout(initializeWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket 에러:', error);
      };

    } catch (error) {
      console.error('WebSocket 초기화 에러:', error);
    }
  };

  const handleWebSocketMessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('받은 메시지:', data);
      
      switch (data.type) {
        case 'chat':
          setMessages(prev => [...prev, { 
            text: data.message,
            sender: data.username,
            isSelf: data.username === username
          }]);
          break;
          
        case 'system':
          setMessages(prev => [...prev, {
            text: data.message,
            isSystem: true
          }]);
          break;
          
        case 'offer':
          if (peerRef.current) {
            console.log('Offer 받음');
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);
            sendWebSocketMessage({
              type: 'answer',
              answer: answer
            });
          }
          break;
          
        case 'answer':
          if (peerRef.current) {
            console.log('Answer 받음');
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
          break;
          
        case 'ice-candidate':
          if (peerRef.current) {
            try {
              await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (e) {
              console.warn('ICE candidate 추가 실패:', e);
            }
          }
          break;
      }
    } catch (error) {
      console.error('메시지 처리 에러:', error);
    }
  };

  const sendWebSocketMessage = (message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('메시지 전송 에러:', error);
      }
    } else {
      console.warn('WebSocket이 연결되지 않았습니다.');
    }
  };

  // 새로운 함수들 추가
  const toggleMicrophone = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicActive(!isMicActive);
        
        if (!isMicActive) {
          const recorder = new RecordRTC(new MediaStream([audioTrack]), {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: RecordRTC.StereoAudioRecorder,
            timeSlice: 5000, // 전송하는 음성의 길이 단위: ms
            ondataavailable: async (blob) => {
              const formData = new FormData();
              formData.append('audio', blob, `audio_${Date.now()}.wav`);
              
              const SERVER_IP = window.location.hostname === 'localhost' ? 'localhost' : 'SET_IP';
              
              try {
                await fetch(`https://${SERVER_IP}:8000/audio-stream/${roomName}`, {
                  method: 'POST',
                  body: formData
                });
              } catch (error) {
                console.error('오디오 전송 에러:', error);
              }
            }
          });
          
          recorder.startRecording();
          setMediaRecorderRef(recorder);
        } else {
          if (mediaRecorderRef) {
            mediaRecorderRef.stopRecording();
            setMediaRecorderRef(null);
          }
        }
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoActive(!isVideoActive);
      }
    }
  };

  // 기존의 startMedia 함수도 수정
  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      // 트랙을 즉시 비활성화
      stream.getVideoTracks()[0].enabled = false;
      stream.getAudioTracks()[0].enabled = false;
      
      setIsMicActive(false); 
      setIsVideoActive(false);
   
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play();
      }
      
      await setupPeerConnection(stream);
      
    } catch (error) {
      console.error('미디어 스트림 에러:', error);
      if (error.name === 'NotAllowedError') {
        alert('카메라/마이크 접근이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      } else if (error.name === 'NotFoundError') {
        alert('카메라/마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.');
      } else {
        alert('카메라/마이크 접근 중 오류가 발생했습니다: ' + error.message);
      }
      setIsMicActive(false);
      setIsVideoActive(false);
    }
   };

  const setupPeerConnection = async (stream) => {
    try {
      if (peerRef.current) {
        peerRef.current.close();
      }

      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const pc = new RTCPeerConnection(configuration);
      peerRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          console.log('ICE candidate 생성됨:', event.candidate);
          sendWebSocketMessage({
            type: 'ice-candidate',
            candidate: event.candidate
          });
        }
      };

      pc.ontrack = (event) => {
        console.log('원격 트랙 받음:', event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      sendWebSocketMessage({
        type: 'offer',
        offer: offer
      });

    } catch (error) {
      console.error('PeerConnection 설정 에러:', error);
    }
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`${track.kind} 트랙 중지됨`);
      });
      localStreamRef.current = null;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      setIsMicActive(false);
      setIsVideoActive(false);

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    }
  };

  const toggleMedia = () => {
    if (isVideoActive) {
      stopMedia();
    } else {
      startMedia();
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && isConnected) {
      sendWebSocketMessage({
        type: 'chat',
        message: inputMessage,
        username: username
      });
      
      setMessages(prev => [...prev, { 
        text: inputMessage,
        sender: username,
        isSelf: true
      }]);
      
      setInputMessage('');
    }
  };
  const LoginForm = () => {
    const [tempUsername, setTempUsername] = useState('');
    const [tempRoomName, setTempRoomName] = useState('');
    const usernameInputRef = useRef(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (tempUsername.trim() && tempRoomName.trim()) {
        setUsername(tempUsername);
        setRoomName(tempRoomName);
        setIsLoggedIn(true);
      }
    };

    useEffect(() => {
      usernameInputRef.current?.focus();
    }, []);

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold text-center mb-6">WebRTC 채팅 입장</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                사용자 이름
              </label>
              <input
                ref={usernameInputRef}
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="사용자 이름을 입력하세요"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                방 이름
              </label>
              <input
                type="text"
                value={tempRoomName}
                onChange={(e) => setTempRoomName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="방 이름을 입력하세요"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors mt-6"
          >
            입장하기
          </button>
        </form>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      {/* 헤더 영역 */}
      <div className="flex justify-between items-center mb-4 p-3 bg-gray-100 rounded-t-lg">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">채팅방: {roomName}</h1>
          <span className="text-sm text-gray-600">({username})</span>
        </div>
        <div className="flex gap-2">
          {/* 마이크 버튼 */}
          <button
            onClick={toggleMicrophone}
            className={`p-2 rounded-full ${
              isMicActive ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
            } text-white transition-colors`}
            title={isMicActive ? '마이크 끄기' : '마이크 켜기'}
          >
            {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          {/* 비디오 버튼 */}
          <button
            onClick={toggleCamera}
            className={`p-2 rounded-full ${
              isVideoActive ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
            } text-white transition-colors`}
            title={isVideoActive ? '카메라 끄기' : '카메라 켜기'}
          >
            {isVideoActive ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </button>
          {/* 로비로 돌아가기 버튼 */}
          <button
            onClick={() => {
              // 모든 연결 해제
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
              }
              if (peerRef.current) {
                peerRef.current.close();
              }
              if (wsRef.current) {
                wsRef.current.close();
              }
              // 상태 초기화
              setIsLoggedIn(false);
              setIsMicActive(false);
              setIsVideoActive(false);
              setMessages([]);
            }}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="로비로 돌아가기"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 gap-4">
        {/* 비디오 영역 */}
        <div className="w-2/3 bg-gray-900 rounded-lg overflow-hidden">
          <div className="relative w-full h-full">
            {/* 원격 비디오 */}
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              controls={false}
            />
            {/* 로컬 비디오 (PIP) */}
            <div className="absolute bottom-4 right-4 w-48 rounded-lg overflow-hidden border-2 border-white">
              <video
                ref={localVideoRef}
                className="w-full object-cover"
                autoPlay
                playsInline
                muted
                controls={false}
              />
            </div>
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="w-1/3 flex flex-col bg-gray-50 rounded-lg">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.isSelf ? 'text-right' : 'text-left'} ${
                  msg.isSystem ? 'text-center' : ''
                }`}
              >
                {!msg.isSystem && !msg.isSelf && (
                  <span className="text-xs text-gray-500 ml-2">{msg.sender}</span>
                )}
                <span
                  className={`inline-block px-4 py-2 rounded-lg ${
                    msg.isSystem
                      ? 'bg-gray-200 text-gray-600 text-sm'
                      : msg.isSelf
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected}
                className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 연결 상태 표시 */}
      {!isConnected && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-1">
          서버와의 연결이 끊어졌습니다. 재연결 시도 중...
        </div>
      )}
    </div>
  );
};

export default WebRTCChat;