import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Box, Button, Typography, IconButton, Grid, TextField } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';
import RecordRTC from 'recordrtc';

// VAD 클래스 추가
const VoiceActivityDetector = class {
  constructor(stream, options = {}) {
    this.audioContext = new AudioContext();
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.recorder = null;

    this.options = {
      threshold: 0.1,     // 음성 감지 임계값
      maxSilentTime: 1500, // 최대 침묵 시간 (ms)
      minRecordingTime: 500 // 최소 녹음 시간 (ms)
    };

    this.setupAnalyser();
  }

  setupAnalyser() {
    this.analyser.minDecibels = -45;
    this.analyser.maxDecibels = -10;
    this.analyser.fftSize = 2048;

    this.microphone.connect(this.analyser);
    this.dataArray = new Float32Array(this.analyser.frequencyBinCount);
  }

  isVoiceActive() {
    this.analyser.getFloatTimeDomainData(this.dataArray);
    
    const rms = Math.sqrt(
      this.dataArray.reduce((sum, value) => sum + value * value, 0) / this.dataArray.length
    );

    const normalizedVolume = Math.abs(rms);
    
    console.log('음성 레벨:', normalizedVolume);

    return normalizedVolume > this.options.threshold;
  }

  startRecording(onDataAvailable) {
    // 이전 RecordRTC 인스턴스 정리
    if (this.recorder) {
      try {
        this.recorder.stopRecording();
        this.recorder.destroy();
      } catch (error) {
        console.error('기존 레코더 정리 중 오류:', error);
      }
    }

    const audioStream = this.microphone.mediaStream;
    
    // 새로운 RecordRTC 인스턴스 생성
    this.recorder = new RecordRTC(audioStream, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: RecordRTC.StereoAudioRecorder,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1
    });

    let isRecording = false;
    let silentTime = 0;
    let recordingTime = 0;
    const CHECK_INTERVAL = 100;

    const checkVoiceActivity = setInterval(() => {
      const isActive = this.isVoiceActive();

      console.log('VAD 상태:', {
        isActive,                  // 현재 음성 활성 상태
        silentTime,                // 현재 누적 침묵 시간
        recordingTime,             // 현재 녹음 시간
        maxSilentTime: this.options.maxSilentTime,  // 최대 허용 침묵 시간
        minRecordingTime: this.options.minRecordingTime  // 최소 녹음 시간
      });

      if (isActive) {
        if (!isRecording) {
          console.log('음성 감지 - 녹음 시작');
          this.recorder.startRecording();
          isRecording = true;
          silentTime = 0;
          recordingTime = 0;
        } else {
          silentTime = 0;
          recordingTime += CHECK_INTERVAL;
        }
      } else {
        if (isRecording) {
          silentTime += CHECK_INTERVAL;
          recordingTime += CHECK_INTERVAL;

          if (recordingTime >= this.options.minRecordingTime && 
              silentTime >= this.options.maxSilentTime) {
            console.log('침묵 감지 - 녹음 중지');
            this.recorder.stopRecording(() => {
              const blob = this.recorder.getBlob();
              
              if (blob && blob.size > 0) {
                console.log('녹음된 블롭:', {
                  size: blob.size,
                  type: blob.type
                });
                
                onDataAvailable(blob);
                
                // 레코더 완전 초기화
                this.recorder.destroy();
                this.recorder = new RecordRTC(audioStream, {
                  type: 'audio',
                  mimeType: 'audio/wav',
                  recorderType: RecordRTC.StereoAudioRecorder,
                  desiredSampRate: 16000,
                  numberOfAudioChannels: 1
                });
              }
            });

            isRecording = false;
            silentTime = 0;
            recordingTime = 0;
          }
        }
      }
    }, CHECK_INTERVAL);

    // 녹음 중지 함수 반환
    return () => {
      clearInterval(checkVoiceActivity);
      if (this.recorder) {
        try {
          this.recorder.stopRecording();
          this.recorder.destroy();
          this.recorder = null;
        } catch (error) {
          console.error('레코더 중지 중 오류:', error);
        }
      }
    };
  }
};

const DebateRoom = ({ publisher, subscribers, roomName, userName, onLeave }) => {
 const [isAudioEnabled, setIsAudioEnabled] = useState(false);
 const [isVideoEnabled, setIsVideoEnabled] = useState(false);
 const [messages, setMessages] = useState([]);  // 채팅 메시지 저장
 const [chatInput, setChatInput] = useState(''); // 채팅 입력값
 const localStreamRef = useRef(null);
 const recorderRef = useRef(null);
 const chatBoxRef = useRef(null);
 const [activeSpeeakers, setActiveSpeakers] = useState(new Set());
 const vadRef = useRef(null);
 const stopVADRef = useRef(null);

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

 useEffect(() => {
   if (chatBoxRef.current) {
     const chatContainer = chatBoxRef.current;
     chatContainer.scrollTop = chatContainer.scrollHeight;
   }
 }, [messages]);

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
  // 오디오 데이터 처리
  console.log('Blob 정보:', { type: blob.type, size: blob.size });

  const audioContext = new AudioContext();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    console.log('오디오 길이:', audioBuffer.duration, '초');
  } catch (decodeError) {
    console.error('오디오 디코딩 에러:', decodeError);
  }

  const formData = new FormData();
  formData.append('audio', blob, `audio_${Date.now()}.wav`);
  formData.append('roomName', roomName);
  formData.append('userName', userName);

  const SERVER_IP = window.location.hostname === 'localhost' ? 'localhost' : import.meta.env.VITE_BACKEND_IP;
  const SERVER_PORT = import.meta.env.VITE_BACKEND_PORT;
  const PROTOCOL = import.meta.env.VITE_BACKEND_PROTOCOL;

  try {
    const response = await axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/audio`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (response.data.text) {
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
    console.error('❌ 오디오 전송 에러:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
  }
};

const toggleAudio = () => {
  if (publisher) {
    const newAudioState = !isAudioEnabled;
    publisher.publishAudio(newAudioState);
    setIsAudioEnabled(newAudioState);

    if (newAudioState) {
      const audioStream = publisher.stream.getMediaStream();
      const vad = new VoiceActivityDetector(audioStream);
      
      const stopRecording = vad.startRecording(async (blob) => {
        await sendAudioData(blob);
      });

      if (vadRef.current) {
        vadRef.current();
      }
      vadRef.current = stopRecording;
    } else {
      if (vadRef.current) {
        vadRef.current();
        vadRef.current = null;
      }
    }
  }
};

 const toggleVideo = () => {
   const newVideoState = !isVideoEnabled;
   setIsVideoEnabled(newVideoState);
   if (publisher) {
     publisher.publishVideo(newVideoState);
   }
 };

 const handleLeave = () => {
   if (vadRef.current) {
     vadRef.current();
   }
   if (publisher && publisher.session) {
     publisher.session.disconnect();
   }
   onLeave();
 };
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