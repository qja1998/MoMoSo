import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Button, Typography, IconButton, Grid, TextField } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';
import RecordRTC from 'recordrtc';

const DebateRoom = ({ publisher, subscribers, roomName, userName, onLeave }) => {
 const [isAudioEnabled, setIsAudioEnabled] = useState(false);
 const [isVideoEnabled, setIsVideoEnabled] = useState(false);
 const [messages, setMessages] = useState([]);  // 채팅 메시지 저장
 const [chatInput, setChatInput] = useState(''); // 채팅 입력값
 const localStreamRef = useRef(null);
 const recorderRef = useRef(null);
 const chatBoxRef = useRef(null);
 const [activeSpeeakers, setActiveSpeakers] = useState(new Set());

 // session이 생성된 후 signal 이벤트 리스너 등록
 useEffect(() => {
   if (publisher?.session) {
     publisher.session.on('signal:chat', (event) => {
       const data = JSON.parse(event.data);
       setMessages(prev => [...prev, {
         type: 'chat',
         user: data.user,
         text: data.message,
         timestamp: new Date().toLocaleTimeString()
       }]);
     });

     publisher.session.on('signal:stt', (event) => {
       const data = JSON.parse(event.data);
       setMessages(prev => [...prev, {
         type: 'stt',
         user: data.user,
         text: data.text,
         timestamp: new Date().toLocaleTimeString()
       }]);
     });
   }

   return () => {
     if (publisher?.session) {
       publisher.session.off('signal:chat');
       publisher.session.off('signal:stt');
     }
   };
 }, [publisher]);

 // 새 메시지가 추가될 때마다 스크롤을 아래로 이동
 useEffect(() => {
   if (chatBoxRef.current) {
     const chatContainer = chatBoxRef.current;
     chatContainer.scrollTop = chatContainer.scrollHeight;
   }
 }, [messages]);

 const startAudioRecording = () => {
   if (publisher) {
     const audioTrack = publisher.stream.getMediaStream().getAudioTracks()[0];

     if (audioTrack) {
       const audioStream = new MediaStream([audioTrack]);
       
       recorderRef.current = new RecordRTC(audioStream, {
         type: 'audio',
         mimeType: 'audio/wav',
         recorderType: RecordRTC.StereoAudioRecorder,
         timeSlice: 3000,
         desiredSampRate: 16000,
         numberOfAudioChannels: 1,
         ondataavailable: async (blob) => {
           await sendAudioData(blob);
         }
       });

       recorderRef.current.startRecording();
     }
   }
 };

  // 활성 발화자 감지
  useEffect(() => {
    let audioContext;
    let sources = new Map();
    let analysers = new Map();

    const setupAudioAnalysis = (stream, userId) => {
      if (!audioContext) {
        audioContext = new AudioContext();
      }

      if (!sources.has(userId)) {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        sources.set(userId, source);
        analysers.set(userId, analyser);
      }
    };

    const checkAudioLevel = (analyser) => {
      const dataArray = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatTimeDomainData(dataArray);
      const rms = Math.sqrt(
        dataArray.reduce((sum, value) => sum + value * value, 0) / dataArray.length
      );
      return rms;
    };

    const checkAudioActivity = setInterval(() => {
      const activeSpeakersNow = new Set();
      
      // 본인의 음성 활동 체크
      if (publisher && isAudioEnabled) {
        const stream = publisher.stream.getMediaStream();
        if (stream.getAudioTracks().length > 0) {
          setupAudioAnalysis(stream, userName);
          const analyser = analysers.get(userName);
          if (analyser) {
            const rms = checkAudioLevel(analyser);
            console.log(`내 음성 레벨: ${rms}`); // 디버깅용
            if (rms > 0.01) {
              activeSpeakersNow.add(userName);
            }
          }
        }
      }

      // 다른 참가자들의 음성 활동 체크
      subscribers.forEach(sub => {
        const userData = JSON.parse(sub.stream.connection.data);
        if (sub.stream.audioActive) {
          const stream = sub.stream.getMediaStream();
          if (stream.getAudioTracks().length > 0) {
            setupAudioAnalysis(stream, userData.clientData);
            const analyser = analysers.get(userData.clientData);
            if (analyser) {
              const rms = checkAudioLevel(analyser);
              console.log(`${userData.clientData}의 음성 레벨: ${rms}`); // 디버깅용
              if (rms > 0.01) {
                activeSpeakersNow.add(userData.clientData);
              }
            }
          }
        }
      });

      setActiveSpeakers(activeSpeakersNow);
    }, 100);

    return () => {
      clearInterval(checkAudioActivity);
      // 모든 연결 정리
      sources.forEach(source => source.disconnect());
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [publisher, subscribers, isAudioEnabled, userName]);

 // 채팅 메시지 전송
 const sendChatMessage = async (e) => {
   e.preventDefault();
   if (!chatInput.trim()) return;

   try {
     await publisher.session.signal({
       data: JSON.stringify({
         message: chatInput,
         user: userName
       }),
       type: 'chat'
     });
     setChatInput('');
   } catch (error) {
     console.error('채팅 전송 에러:', error);
   }
 };

 const sendAudioData = async (blob) => {
   const formData = new FormData();
   formData.append('audio', blob, `audio_${Date.now()}.wav`);
   formData.append('roomName', roomName);
   formData.append('userName', userName);

    /* 서버 Ip로 변경할것 추후 .env로 빼야함함 */
    const SERVER_IP = window.location.hostname === 'localhost' ? 'localhost' : import.meta.env.VITE_BACKEND_IP;
    const SERVER_PORT = import.meta.env.VITE_BACKEND_PORT;
    const PROTOCOL = import.meta.env.VITE_BACKEND_PROTOCOL;

   try {
     const response = await axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/audio`, formData, {
       headers: { 'Content-Type': 'multipart/form-data' }
     });

     if (response.data.text) {
       // STT 결과를 signal로 전송
       await publisher.session.signal({
         data: JSON.stringify({
           text: response.data.text,
           user: userName
         }),
         type: 'stt'
       });
     }
     console.log(`✅ WAV 청크 업로드 완료! (Size: ${blob.size} bytes)`);
     console.log(`📝 STT 결과:`, response.data.text);
   } catch (error) {
     console.error('❌ 오디오 전송 에러:', error);
   }
 };

 const stopAudioRecording = () => {
   if (recorderRef.current) {
     recorderRef.current.stopRecording(async () => {
       let blob = recorderRef.current.getBlob();
       if (blob && blob.size > 0) {
         await sendAudioData(blob);
       }
     });
   }
 };

 const toggleAudio = () => {
   if (publisher) {
     const newAudioState = !isAudioEnabled;
     publisher.publishAudio(newAudioState);
     setIsAudioEnabled(newAudioState);

     if (newAudioState) {
       startAudioRecording();
     } else {
       stopAudioRecording();
     }
   }
 };

 const toggleVideo = () => {
   if (publisher) {
     publisher.publishVideo(!isVideoEnabled);
     setIsVideoEnabled(!isVideoEnabled);
   }
 };

 useEffect(() => {
   if (publisher) {
     localStreamRef.current = publisher.stream.getMediaStream();
   }

   return () => {
     if (recorderRef.current) {
       recorderRef.current.stopRecording();
     }
   };
 }, [publisher]);

 return (
  <Box sx={{ 
    display: 'flex', 
    height: '100vh', 
    overflow: 'hidden' 
  }}>
    {/* 참가자 리스트 - 왼쪽 사이드바 */}
    <Box sx={{ 
      width: '250px', 
      p: 2, 
      border: '1px solid #ccc', 
      borderRadius: 2,
      backgroundColor: '#f5f5f5',
      overflowY: 'auto'
    }}>
      <Typography variant="h6" gutterBottom>
        참여자 목록
      </Typography>
      {/* 현재 사용자 */}
      <Box sx={{ 
        p: 1, 
        mb: 1,
        backgroundColor: 'white',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: activeSpeeakers.has(userName) ? 'green' : 'transparent',
          mr: 1 
        }} />
        <Typography>
          {userName} (나)
        </Typography>
        {isAudioEnabled ? 
          <Mic color="primary" fontSize="small" /> : 
          <MicOff color="error" fontSize="small" />
        }
      </Box>
      
      {/* 다른 참가자들 */}
      {subscribers.map((sub, i) => {
        const subUserName = JSON.parse(sub.stream.connection.data).clientData;
        return (
          <Box key={i} sx={{ 
            p: 1,
            mb: 1,
            backgroundColor: 'white',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: activeSpeeakers.has(subUserName) ? 'green' : 'transparent',
              mr: 1 
            }} />
            <Typography>
              {subUserName}
            </Typography>
            {sub.stream.audioActive ? 
              <Mic color="primary" fontSize="small" /> : 
              <MicOff color="error" fontSize="small" />
            }
          </Box>
        );
      })}
    </Box>

    {/* 중앙 비디오 영역 */}
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      p: 2 
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h5">토론방: {roomName}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton 
            onClick={toggleAudio} 
            color={isAudioEnabled ? 'primary' : 'default'}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </IconButton>
          <IconButton 
            onClick={toggleVideo} 
            color={isVideoEnabled ? 'primary' : 'default'}
          >
            {isVideoEnabled ? <Videocam /> : <VideocamOff />}
          </IconButton>
          <Button 
            variant="contained" 
            color="error" 
            onClick={onLeave}
          >
            나가기
          </Button>
        </Box>
      </Box>

      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          justifyContent: 'center',
          flex: 1,
          overflowY: 'auto'
        }}
      >
        {/* Publisher video */}
        <Box 
          sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(50% - 16px)' },
            border: '1px solid #ccc', 
            borderRadius: 2, 
            overflow: 'hidden',
            position: 'relative' 
          }}
        >
          <Box sx={{ 
            p: 1, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: activeSpeeakers.has(userName) ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
          }}>
            <Typography variant="subtitle1">
              {userName} (나)
            </Typography>
            {isAudioEnabled && <Mic color="primary" fontSize="small" />}
          </Box>
          {publisher && <VideoPlayer streamManager={publisher} isPublisher={true} />}
        </Box>

        {/* Subscribers videos */}
        {subscribers.map((sub, i) => {
          const subUserName = JSON.parse(sub.stream.connection.data).clientData;
          return (
            <Box 
              key={i}
              sx={{ 
                width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(50% - 16px)' },
                border: '1px solid #ccc', 
                borderRadius: 2, 
                overflow: 'hidden' 
              }}
            >
              <Box sx={{ 
                p: 1, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: activeSpeeakers.has(subUserName) ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
              }}>
                <Typography variant="subtitle1">
                  {subUserName}
                </Typography>
                {sub.stream.audioActive && <Mic color="primary" fontSize="small" />}
              </Box>
              <VideoPlayer streamManager={sub} isPublisher={false} />
            </Box>
          );
        })}
      </Box>
    </Box>

    {/* 채팅 영역 */}
    <Box 
      sx={{ 
        width: '300px', 
        p: 2, 
        border: '1px solid #ccc', 
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 메시지 표시 영역 */}
      <Box 
        ref={chatBoxRef}
        sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          mb: 2,
          p: 1
        }}
      >
        {messages.map((msg, index) => (
          <Box 
            key={index} 
            sx={{ 
              mb: 1,
              p: 1,
              backgroundColor: msg.type === 'stt' ? '#e3f2fd' : '#fff',
              borderRadius: 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {msg.timestamp} - {msg.user}
              {msg.type === 'stt' && ' (음성 인식)'}
            </Typography>
            <Typography variant="body1">
              {msg.text}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* 채팅 입력 영역 */}
      <Box 
        component="form" 
        onSubmit={sendChatMessage}
        sx={{ 
          display: 'flex', 
          gap: 1 
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <Button 
          type="submit" 
          variant="contained"
          disabled={!chatInput.trim()}
        >
          전송
        </Button>
      </Box>
    </Box>
  </Box>
);
};

export default DebateRoom;