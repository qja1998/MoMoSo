import React, { useState } from 'react';
import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
import JoinForm from './components/JoinForm';
import DebateRoom from './components/DebateRoom';

// axios 기본 설정
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false;

const App = () => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');

  // 환경변수에서 OpenVidu 설정 가져오기
  const OPENVIDU_SERVER_URL = `${import.meta.env.VITE_OPENVIDU_PROTOCOL}://${import.meta.env.VITE_OPENVIDU_IP}:${import.meta.env.VITE_OPENVIDU_PORT}`;
  const OPENVIDU_SERVER_SECRET = import.meta.env.VITE_OPENVIDU_SERVER_SECRET;

  const createSession = async (roomName) => {
    try {
      const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/openvidu/api/sessions`,
        { customSessionId: roomName },
        {
          headers: {
            'Authorization': `Basic ${btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`)}`,
            'Content-Type': 'application/json',
          },
          withCredentials: false
        }
      );
      
      return response.data?.id || roomName;
    } catch (error) {
      if (error.response?.status === 409) {
        return roomName;
      }
      console.error('Session creation error details:', error);
      throw error;
    }
  };

  const createToken = async (sessionId) => {
    try {
      const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`,
        {},
        {
          headers: {
            'Authorization': `Basic ${btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`)}`,
            'Content-Type': 'application/json',
          },
          withCredentials: false
        }
      );
      return response.data.token;
    } catch (error) {
      console.error('Token creation error:', error);
      throw error;
    }
  };

  const getToken = async (roomName) => {
    const sessionId = await createSession(roomName);
    const token = await createToken(sessionId);
    return token;
  };

  const joinRoom = async (roomData) => {
    const { roomName, userName } = roomData;
    
    try {
      const OV = new OpenVidu();
      OV.enableProdMode();
  
      const session = OV.initSession();
      
      // WebSocket 연결 옵션 설정
      session.options = {
        sessionId: roomName,
        participantId: userName,
        metadata: {},
        reconnectionConfig: {
          maxAttempts: 5,        // 재연결 시도 횟수 증가
          attemptsTimeout: 5000, // 타임아웃 시간 증가
          minDelayBetweenRetries: 2000,  // 재시도 간 대기 시간
          exponentialBackoffRate: 1.5     // 지수 백오프 적용
        }
      };
  
      // 기존 참가자들의 스트림 처리
      session.on('streamCreated', (event) => {
        const subscriber = session.subscribe(event.stream, undefined);
        setSubscribers(prev => [...prev, subscriber]);
      });
  
      // 참가자가 나갈 때 처리
      session.on('streamDestroyed', (event) => {
        setSubscribers(prev => 
          prev.filter(sub => sub !== event.stream.streamManager)
        );
      });
  
      // 연결 끊김 처리
      session.on('sessionDisconnected', (event) => {
        if (event.reason === 'networkDisconnect') {
          console.warn('Network disconnected');
        }
      });
  
      // 세션 연결 시 기존 스트림들을 가져옴
      session.on('sessionConnected', () => {
        session.streamManagers.forEach(streamManager => {
          if (streamManager !== publisher) {
            const subscriber = session.subscribe(streamManager.stream, undefined);
            setSubscribers(prev => [...prev, subscriber]);
          }
        });
      });
  
      const token = await getToken(roomName);
      await session.connect(token, { clientData: userName });
  
      const publisher = await OV.initPublisherAsync(undefined, {
        audioSource: undefined,
        videoSource: undefined,
        publishAudio: false,  // 초기 마이크 Off
        publishVideo: false,  // 초기 비디오 Off
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: true,
        videoSimulcast: true,
        mediaOptions: {
          audio: {
            echoCancellation: true,  // 에코 취소
            noiseSuppression: true,  // 소음 억제
            autoGainControl: true    // 자동 게인 제어
          }
        }
      });
  
      try {
        await session.publish(publisher);
        setPublisher(publisher);
        setSession(session);
        setRoomName(roomName);
        setUserName(userName);
      } catch (error) {
        console.error('Error publishing stream:', error);
        session.disconnect();
        throw error;
      }
  
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  };

  const leaveRoom = () => {
    if (session) {
      session.disconnect();
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setRoomName('');
      setUserName('');
    }
  };

  return (
    <div className="App">
      {!session ? (
        <JoinForm onJoin={joinRoom} />
      ) : (
        <DebateRoom
          session={session}
          publisher={publisher}
          subscribers={subscribers}
          roomName={roomName}
          userName={userName}
          onLeave={leaveRoom}
        />
      )}
    </div>
  );
};

export default App;