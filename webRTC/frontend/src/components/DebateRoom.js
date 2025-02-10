import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Box, Button, Typography, IconButton, Grid, TextField, Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle } from '@mui/material';
import { Mic, MicOff, Videocam, VideocamOff,Logout,Save } from '@mui/icons-material';
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
      threshold: 0.15,     // 음성 감지 임계값
      maxSilentTime: 2000, // 최대 침묵 시간 (ms)
      minRecordingTime: 1000 // 최소 녹음 시간 (ms)
    };

    this.setupAnalyser();
  }

  setupAnalyser() {
    console.warn = function() {};
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
    
    // console.log('음성 레벨:', normalizedVolume);

    return normalizedVolume > this.options.threshold;
  }

  startRecording(onDataAvailable) {
    // 이전 RecordRTC 인스턴스 정리
    if (this.recorder) {
      try {
        this.recorder.stopRecording(()=>{
          this.recorder.reset();
        });
        // this.recorder.destroy();
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
      disableLogs: true,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1
    });

    this.recorder.startRecording();

    let isRecording = false;
    let silentTime = 0;
    let recordingTime = 0;
    const CHECK_INTERVAL = 200; //반복 주기 ms단위 ex)0.1초 간격으로 음성정보를 확인

    const checkVoiceActivity = setInterval(() => {
      const isActive = this.isVoiceActive();

      if (isActive) {
        if (!isRecording) {
          console.log('음성 감지 - 녹음 시작');
          // this.recorder.startRecording();
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
            this.recorder.stopRecording(async() => {
              const blob = this.recorder.getBlob();
              
              if (blob && blob.size > 0) {

                await onDataAvailable(blob);

              }
              this.recorder.reset();
            });
            this.recorder.startRecording();
            isRecording = false;
            silentTime = 0;
            recordingTime = 0;
          }
        } else {
          // isActive가 false == 작은 소리 && 현재 녹음중이 아니였다면
          this.recorder.stopRecording(() => {
            this.recorder.reset();
          });
          this.recorder.startRecording();
        }
      }
    }, CHECK_INTERVAL);

    // 녹음 중지 함수 반환
    return () => {
      clearInterval(checkVoiceActivity);
      if (this.recorder) {
        try {
          this.recorder.stopRecording(()=>{
            const blob = this.recorder.getBlob();
              
              if (blob && blob.size > 0) {
                
                onDataAvailable(blob);
              }
            this.recorder.reset();
          });
          // this.recorder.destroy();
          // this.recorder = null;
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
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [meetingStartTime] = useState(new Date());
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const localStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [activeSpeeakers, setActiveSpeakers] = useState(new Set());
  const vadRef = useRef(null);
  const stopVADRef = useRef(null);

  // 디바운스 유틸리티 함수
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // OpenVidu 시그널 이벤트 처리
  useEffect(() => {
    if (publisher?.session) {
      const handleChatSignal = (event) => {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, {
          type: 'chat',
          user: data.user,
          text: data.message,
          timestamp: new Date().toLocaleTimeString()
        }]);
      };

      const handleSTTSignal = (event) => {
        const data = JSON.parse(event.data);
        setMessages(prev => [...prev, {
          type: 'stt',
          user: data.user,
          text: data.text,
          timestamp: new Date().toLocaleTimeString()
        }]);
      };

      publisher.session.on('signal:chat', handleChatSignal);
      publisher.session.on('signal:stt', handleSTTSignal);

      return () => {
        publisher.session.off('signal:chat', handleChatSignal);
        publisher.session.off('signal:stt', handleSTTSignal);
      };
    }
  }, [publisher]);

  // 채팅 스크롤 
  useEffect(() => {
    if (chatBoxRef.current) {
      const chatContainer = chatBoxRef.current;
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  // 음성 활동 감지 (게시자)
  useEffect(() => {
    if (publisher && publisher.stream && isAudioEnabled) {
      const audioStream = publisher.stream.getMediaStream();
      const vad = new VoiceActivityDetector(audioStream);
      
      const checkVoiceActivity = setInterval(() => {
        const isActive = vad.isVoiceActive();
        setActiveSpeakers(prev => {
          const newSpeakers = new Set(prev);
          isActive ? newSpeakers.add(userName) : newSpeakers.delete(userName);
          return newSpeakers;
        });
      }, 200);

      return () => clearInterval(checkVoiceActivity);
    }
  }, [publisher, isAudioEnabled, userName]);

  // 음성 활동 감지 (구독자)
  useEffect(() => {
    const voiceActivityChecks = subscribers.filter(sub => sub.stream.audioActive).map((sub) => {
      const subUserName = JSON.parse(sub.stream.connection.data).clientData;
      const audioStream = sub.stream.getMediaStream();
      const vad = new VoiceActivityDetector(audioStream);
      
      const checkVoiceActivity = setInterval(() => {
        const isActive = vad.isVoiceActive();
        setActiveSpeakers(prev => {
          const newSpeakers = new Set(prev);
          isActive ? newSpeakers.add(subUserName) : newSpeakers.delete(subUserName);
          return newSpeakers;
        });
      }, 200);

      return () => clearInterval(checkVoiceActivity);
    });

    return () => voiceActivityChecks.forEach(cleanup => cleanup());
  }, [subscribers]);

  // 회의록 생성 함수
  const createMeetingMinutes = useCallback(async () => {
    console.log('회의록 저장 시도');
    
    // 메시지가 없으면 기본 메시지 추가
    const messagesToSave = messages.length > 0 ? messages : [
      { 
        type: 'system', 
        text: '회의 중 메시지 없음', 
        timestamp: new Date().toLocaleTimeString() 
      }
    ];
  
    const formData = new FormData();
    formData.append('room_name', roomName);
    formData.append('host_name', userName);
    formData.append('start_time', meetingStartTime.toISOString());
    formData.append('end_time', new Date().toISOString());
    formData.append('duration', ((new Date() - meetingStartTime) / 1000 / 60).toFixed(2));
    
    formData.append('participants', JSON.stringify([
      userName, 
      ...subscribers.map(sub => JSON.parse(sub.stream.connection.data).clientData)
    ]));
    
    formData.append('messages', JSON.stringify(messagesToSave));
  
    try {
      const SERVER_IP = window.location.hostname === 'localhost' ? 'localhost' : import.meta.env.VITE_BACKEND_IP;
      const SERVER_PORT = import.meta.env.VITE_BACKEND_PORT;
      const PROTOCOL = import.meta.env.VITE_BACKEND_PROTOCOL;
  
      const response = await axios.post(`${PROTOCOL}://${SERVER_IP}:${SERVER_PORT}/api/meeting-minutes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('회의록 저장 성공:', response.data);
      return response.data;
    } catch (error) {
      console.error('회의록 저장 실패:', error);
      throw error;
    }
  }, [roomName, userName, subscribers, messages, meetingStartTime]);

  // 디바운스된 회의록 생성 함수
  const debouncedCreateMeetingMinutes = useCallback(
    debounce(createMeetingMinutes, 300),
    [createMeetingMinutes]
  );

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

  // 음성 데이터 전송
  const sendAudioData = async (blob) => {
    const audioContext = new AudioContext();
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
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
        httpsAgent: {
          rejectUnauthorized: false
        }
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

  // 오디오 토글
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

  // 비디오 토글
  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    if (publisher) {
      publisher.publishVideo(newVideoState);
    }
  };

  // 나가기 처리
  const handleLeave = useCallback(() => {
    console.log("나가기 누름!!!!");
    
    const saveAndLeave = async () => {
      try {
        // VAD 녹음 중지
        if (vadRef.current) {
          vadRef.current(); 
          vadRef.current = null;
        }
  
        // 오디오 트랙 중지
        if (publisher?.stream) {
          const mediaStream = publisher.stream.getMediaStream();
          if (mediaStream) {
            const audioTracks = mediaStream.getAudioTracks();
            audioTracks.forEach(track => track.stop());
          }
        }
  
        // 회의록 저장
        await createMeetingMinutes();
  
        // 세션 연결 해제를 최후에 수행
        if (publisher?.session) {
          return new Promise((resolve, reject) => {
            // 타임아웃 설정
            const timeout = setTimeout(() => {
              console.log('세션 연결 해제 타임아웃');
              resolve(); // 강제로 해결
            }, 2000);
  
            publisher.session.disconnect({
              onSuccess: () => {
                clearTimeout(timeout);
                resolve();
              },
              onFailure: (error) => {
                clearTimeout(timeout);
                console.error('세션 연결 해제 실패:', error);
                resolve(); // 실패해도 계속 진행
              }
            });
          });
        }
      } catch (error) {
        console.error('나가기 중 오류:', error);
      } finally {
        // 항상 onLeave 호출
        onLeave();
      }
    };
  
    // 비동기 함수 즉시 호출
    saveAndLeave();
  }, [vadRef, publisher, createMeetingMinutes, onLeave]);

 return (
  <Box sx={{ 
    display: 'flex', 
    height: '100vh', 
    overflow: 'hidden',
    backgroundColor: '#f0f2f5' 
  }}>
    {/* 참가자 리스트 - 왼쪽 사이드바 */}
    <Box sx={{ 
      width: '250px', 
      p: 2, 
      borderRight: '1px solid #e0e0e0', 
      backgroundColor: 'white',
      overflowY: 'auto',
      boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
    }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        참여자 목록
      </Typography>
      
      {/* 현재 사용자 */}
      <Box sx={{ 
        p: 1, 
        mb: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        border: '1px solid #e0e0e0'
      }}>
        <Box sx={{ 
          width: 10, 
          height: 10, 
          borderRadius: '50%', 
          backgroundColor: activeSpeeakers.has(userName) ? 'green' : 'gray',
          mr: 1 
        }} />
        <Typography sx={{ flex: 1 }}>
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
            backgroundColor: '#f9f9f9',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid #e0e0e0'
          }}>
            <Box sx={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              backgroundColor: activeSpeeakers.has(subUserName) ? 'green' : 'gray',
              mr: 1 
            }} />
            <Typography sx={{ flex: 1 }}>
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
      p: 2,
      backgroundColor: '#f0f2f5'
    }}>
      {/* 헤더 영역 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        pb: 1,
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          토론방: {roomName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton 
            onClick={toggleAudio} 
            color={isAudioEnabled ? 'primary' : 'default'}
            sx={{ 
              border: '1px solid', 
              borderColor: isAudioEnabled ? 'primary.main' : 'grey.300' 
            }}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </IconButton>
          <IconButton 
            onClick={toggleVideo} 
            color={isVideoEnabled ? 'primary' : 'default'}
            sx={{ 
              border: '1px solid', 
              borderColor: isVideoEnabled ? 'primary.main' : 'grey.300' 
            }}
          >
            {isVideoEnabled ? <Videocam /> : <VideocamOff />}
          </IconButton>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLeave}
            startIcon={<Logout />}
          >
            나가기
          </Button>
        </Box>
      </Box>

      {/* 비디오 그리드 */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 2, 
          justifyContent: 'center',
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'white',
          borderRadius: 2,
          p: 2
        }}
      >
        {/* Publisher video */}
        <Box 
          sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(50% - 16px)' },
            border: '1px solid #e0e0e0', 
            borderRadius: 2, 
            overflow: 'hidden',
            position: 'relative',
            boxShadow: activeSpeeakers.has(userName) ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none'
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
                border: '1px solid #e0e0e0', 
                borderRadius: 2, 
                overflow: 'hidden',
                boxShadow: activeSpeeakers.has(subUserName) ? '0 0 10px rgba(76, 175, 80, 0.5)' : 'none'
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
        borderLeft: '1px solid #e0e0e0', 
        backgroundColor: 'white',
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
          p: 1,
          backgroundColor: '#f9f9f9',
          borderRadius: 2
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
          variant="outlined"
        />
        <Button 
          type="submit" 
          variant="contained"
          disabled={!chatInput.trim()}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          전송
        </Button>
      </Box>

      {/* 회의록 저장 버튼 */}
      <Button 
        variant="outlined" 
        color="primary" 
        startIcon={<Save />}
        onClick={() => setOpenSaveDialog(true)}
        sx={{ mt: 2 }}
      >
        회의록 저장
      </Button>

      {/* 회의록 저장 확인 다이얼로그 */}
      <Dialog
        open={openSaveDialog}
        onClose={() => setOpenSaveDialog(false)}
      >
        <DialogTitle>회의록 저장</DialogTitle>
        <DialogContent>
          <DialogContentText>
            현재까지의 메시지를 회의록으로 저장하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)} color="secondary">
            취소
          </Button>
          <Button 
            onClick={() => {
              createMeetingMinutes();
              setOpenSaveDialog(false);
            }} 
            color="primary" 
            autoFocus
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Box>
);
};

export default DebateRoom;