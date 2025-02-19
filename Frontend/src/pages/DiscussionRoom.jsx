import axios from 'axios'
import { OpenVidu as OpenViduBrowser } from 'openvidu-browser'
import { OpenVidu as OpenViduNode } from 'openvidu-node-client'
import RecordRTC from 'recordrtc'

import { useEffect, useRef, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SendIcon from '@mui/icons-material/Send'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

// 경로 상수
const BACKEND_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}`
const OPENVIDU_SERVER_URL = `${import.meta.env.VITE_OPENVIDU_PROTOCOL}://${import.meta.env.VITE_OPENVIDU_IP}:${import.meta.env.VITE_OPENVIDU_PORT}`
const OPENVIDU_SERVER_SECRET = import.meta.env.VITE_OPENVIDU_SERVER_SECRET

// debounce 유틸리티 함수 추가
const debounce = (func, wait) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// VAD 클래스 추가
const VoiceActivityDetector = class {
  constructor(stream, options = {}) {
    this.audioContext = new AudioContext()
    this.microphone = this.audioContext.createMediaStreamSource(stream)
    this.analyser = this.audioContext.createAnalyser()

    this.recorder = null
    this.isProcessing = false
    this.lastProcessedTime = 0
    this.options = {
      threshold: 0.13,
      maxSilentTime: 2400,
      minRecordingTime: 1000,
      processingDebounce: 1000
    }

    this.setupAnalyser()
  }

  setupAnalyser() {
    console.warn = function() {}
    this.analyser.minDecibels = -45
    this.analyser.maxDecibels = -10
    this.analyser.fftSize = 2048

    this.microphone.connect(this.analyser)
    this.dataArray = new Float32Array(this.analyser.frequencyBinCount)
  }

  isVoiceActive() {
    this.analyser.getFloatTimeDomainData(this.dataArray)
    
    const rms = Math.sqrt(
      this.dataArray.reduce((sum, value) => sum + value * value, 0) / this.dataArray.length
    )

    const normalizedVolume = Math.abs(rms)
    return normalizedVolume > this.options.threshold
  }

  canProcess() {
    const now = Date.now()
    if (now - this.lastProcessedTime < this.options.processingDebounce) {
      return false
    }
    return true
  }

  async handleRecordingStopped(onDataAvailable) {
    if (this.isProcessing || !this.canProcess()) return
    
    this.isProcessing = true
    this.lastProcessedTime = Date.now()

    try {
      await new Promise((resolve) => {
        if (!this.recorder) {
          resolve()
          return
        }

        this.recorder.stopRecording(async () => {
          try {
            const blob = this.recorder.getBlob()
            
            if (blob && blob.size > 0) {
              try {
                await onDataAvailable(blob)
              } catch (error) {
                console.error('오디오 데이터 전송 실패:', error)
              }
            }

            if (this.recorder) {
              this.recorder.reset()
              this.recorder.startRecording()
            }
            resolve()
          } catch (error) {
            console.error('Blob 처리 중 오류:', error)
            resolve()
          }
        })
      })
    } finally {
      this.isProcessing = false
    }
  }

  startRecording(onDataAvailable) {
    if (this.recorder) {
      try {
        this.recorder.stopRecording(() => {
          if (this.recorder) {
            this.recorder.reset()
          }
        })
      } catch (error) {
        console.error('기존 레코더 정리 중 오류:', error)
      }
    }

    const audioStream = this.microphone.mediaStream
    
    this.recorder = new RecordRTC(audioStream, {
      type: 'audio',
      mimeType: 'audio/wav',
      recorderType: RecordRTC.StereoAudioRecorder,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1
    })

    this.recorder.startRecording()

    let isRecording = false
    let silentTime = 0
    let recordingTime = 0
    const CHECK_INTERVAL = 200

    const checkVoiceActivity = setInterval(async () => {
      if (this.isProcessing) return
      
      const isActive = this.isVoiceActive()

      if (isActive) {
        if (!isRecording) {
          isRecording = true
          silentTime = 0
          recordingTime = 0
        } else {
          silentTime = 0
          recordingTime += CHECK_INTERVAL
        }
      } else {
        if (isRecording) {
          silentTime += CHECK_INTERVAL
          recordingTime += CHECK_INTERVAL

          if (recordingTime >= this.options.minRecordingTime && 
              silentTime >= this.options.maxSilentTime) {
            await this.handleRecordingStopped(onDataAvailable)
            isRecording = false
            silentTime = 0
            recordingTime = 0
          }
        }
      }
    }, CHECK_INTERVAL)

    return async () => {
      clearInterval(checkVoiceActivity)
      if (this.recorder) {
        await this.handleRecordingStopped(onDataAvailable)
        if (this.recorder) {
          this.recorder.destroy()
          this.recorder = null
        }
      }
    }
  }
}

export default function DiscussionRoom() {
  const navigate = useNavigate()
  const { discussionId } = useParams()

  const isComponentMountedRef = useRef(true)
  const [discussionInfo, setDiscussionInfo] = useState(null)
  const [isMicOn, setIsMicOn] = useState(true)
  const [volume, setVolume] = useState(50)
  const [speakingUsers, setSpeakingUsers] = useState([]) // VAD로 현재 말하고 있는 사용자들의 ID 배열
  const [isVolumeHovered, setIsVolumeHovered] = useState(false)

  const loginInfo = useRef(null)

  // OpenVidu 관련 상태 추가
  const [serverSession, setServerSession] = useState(null) // OpenVidu 세션 객체
  const [clientSession, setClientSession] = useState(null) // OpenVidu 세션 객체
  const [connection, setConnection] = useState(null) // OpenVidu 연결 객체
  const [publisher, setPublisher] = useState(null) // 로컬 스트림(자신의 비디오/오디오)
  const [participants, setParticipants] = useState([]) // 나를 포함한 참가자들의 스트림 객체 배열
  const [subscribers, setSubscribers] = useState([]) // 나를 포함한 참가자들의 구독자 객체 배열

  // participants 변경 감지를 위한 useEffect
  useEffect(() => {
    console.log('[Participants 변경]', participants)
  }, [participants])

  // 채팅 관련 상태 추가
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')

  // AI 어시스턴트 관련 상태 추가
  const [factChecks, setFactChecks] = useState([])
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false)

  const vadRef = useRef(null)

  // 오디오 데이터 전송
  const sendAudioData = async (blob) => {
    const formData = new FormData()
    formData.append('audio', blob, `audio_${Date.now()}.wav`)
    formData.append('roomName', discussionInfo?.session_id)
    formData.append('userName', loginInfo.current?.nickname)

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/discussion/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      })

      if (response.data.text) {
        console.log(response.data.text)
        await clientSession.signal({
          data: JSON.stringify({
            text: response.data.text,
            user: loginInfo.current?.nickname
          }),
          type: 'stt'
        })
      }
    } catch (error) {
      console.error('오디오 전송 에러:', error)
    }
  }

  // 마이크 토글 핸들러 수정
  const handleMicToggle = () => {
    const newMicState = !isMicOn;
    setIsMicOn(newMicState);
    
    if (publisher) {
      publisher.publishAudio(newMicState);
      if (newMicState) {
        // 기존 VAD 정리
        if (vadRef.current) {
          vadRef.current();
          vadRef.current = null;
        }
  
        // 스트림이 활성 상태인지 확인
        const audioStream = publisher.stream.getMediaStream();
        const audioTracks = audioStream.getAudioTracks();
        console.log('audiotrack 확인용',audioStream)
        if (audioTracks.length > 0 && audioTracks[0].readyState === 'live') {
          try {
            const vad = new VoiceActivityDetector(audioStream);
            const stopRecording = vad.startRecording(async (blob) => {
              await sendAudioData(blob);
            });
            
            vadRef.current = stopRecording;
          } catch (error) {
            console.error('VAD 설정 중 오류:', error);
          }
        } else {
          console.warn('오디오 트랙이 활성화되지 않았습니다.');
        }
      } else {
        // 마이크를 끌 때는 VAD도 정리
        if (vadRef.current) {
          vadRef.current();
          vadRef.current = null;
        }
      }
    }
  };

  // 음성 활동 감지 (게시자)
  useEffect(() => {
    if (publisher && publisher.stream && isMicOn) {
      const audioStream = publisher.stream.getMediaStream()
      const vad = new VoiceActivityDetector(audioStream)
      
      const checkVoiceActivity = setInterval(() => {
        const isActive = vad.isVoiceActive()
        setSpeakingUsers(prev => {
          const newSpeakers = new Set(prev)
          if (isActive) {
            newSpeakers.add(loginInfo.current?.user_pk)
          } else {
            newSpeakers.delete(loginInfo.current?.user_pk)
          }
          return Array.from(newSpeakers)
        })
      }, 200)

      return () => clearInterval(checkVoiceActivity)
    }
  }, [publisher, isMicOn])

  // 음성 활동 감지 (구독자)
useEffect(() => {
  const voiceActivityChecks = subscribers
    .filter(sub => sub.stream.audioActive && sub.stream.getMediaStream())
    .map((sub) => {
      try {
        const connectionData = JSON.parse(sub.stream.connection.data);
        const mediaStream = sub.stream.getMediaStream();
        
        // mediaStream이 유효한지 확인
        if (!mediaStream || !mediaStream.getAudioTracks().length) {
          console.warn('Invalid media stream for subscriber:', connectionData);
          return null;
        }

        const vad = new VoiceActivityDetector(mediaStream);
        
        const checkVoiceActivity = setInterval(() => {
          const isActive = vad.isVoiceActive();
          setSpeakingUsers(prev => {
            const newSpeakers = new Set(prev);
            if (isActive) {
              newSpeakers.add(connectionData.user_pk);
            } else {
              newSpeakers.delete(connectionData.user_pk);
            }
            return Array.from(newSpeakers);
          });
        }, 200);

        return () => {
          clearInterval(checkVoiceActivity);
          // AudioContext 정리
          if (vad.audioContext) {
            vad.audioContext.close();
          }
        };
      } catch (error) {
        console.error('Failed to initialize VAD for subscriber:', error);
        return null;
      }
    })
    .filter(Boolean); // null 값 제거

  return () => {
    voiceActivityChecks.forEach(cleanup => cleanup && cleanup());
  };
}, [subscribers]);

  // 토론방 초기화 로직
  useEffect(() => {
    let openViduNode = null
    let openViduBrowser = null
    let serverSideSession = null
    let clientSideSession = null
    let connection = null
    let publisher = null

    const initializeDiscussionRoom = async () => {
      try {
        // TODO: 로그인 상태가 아닌 경우 로그인 페이지로 리다이렉트

        // 1. OpenVidu 객체 초기화
        try {
          openViduNode = new OpenViduNode(OPENVIDU_SERVER_URL, OPENVIDU_SERVER_SECRET)
          openViduNode.enableProdMode()
          console.log('[Step 1-1] OpenViduNode 객체 초기화 성공', openViduNode)
        } catch (error) {
          console.error('[Step 1-1] OpenViduNode 객체 초기화 실패:', error)
          throw error
        }

        try {
          openViduBrowser = new OpenViduBrowser()
          openViduBrowser.enableProdMode()
          console.log('[Step 1-2] OpenViduBrowser 객체 초기화 성공', openViduBrowser)
        } catch (error) {
          console.error('[Step 1-2] OpenViduBrowser 객체 초기화 실패:', error)
          throw error
        }

        // 2. 토론방 정보 불러오기
        const { data: discussionData } = await axios.get(`${BACKEND_URL}/api/v1/discussion/${discussionId}`, {
          withCredentials: true,
        })

        setDiscussionInfo(discussionData)
        console.log('[Step 2] 토론방 정보 불러오기 성공', discussionData)

        // 3. 세션 가져오기 또는 생성
        const sessionId = discussionData.session_id
        try {
          // 3-1. 세션 생성 (이미 존재하면 해당 세션 반환)
          serverSideSession = await openViduNode.createSession({
            customSessionId: sessionId,
            mediaMode: 'ROUTED',
            recordingMode: 'MANUAL',
            defaultRecordingProperties: {
              hasAudio: true,
              hasVideo: false,
            },
          })

          setServerSession(serverSideSession)
          console.log('[Step 3] Server-Side Session 설정 성공', serverSideSession)
        } catch (error) {
          console.error('[Step 3] Server-Side Session 설정 실패:', error)
          throw error
        }

        // 4. 연결(connection) 관리 및 생성
        try {
          // 4-1. 세션의 현재 상태 업데이트
          await serverSideSession.fetch()

          // 4-2. 현재 사용자의 기존 연결 찾기
          const userConnections = serverSideSession.activeConnections.filter((conn) => {
            try {
              const data = JSON.parse(conn.serverData)
              return data.user_pk === loginInfo.current.user_pk
            } catch {
              return false
            }
          })

          // 4-3. 기존 연결 모두 정리
          if (userConnections.length > 0) {
            console.log(`기존 연결 ${userConnections.length}개 정리 시작`)
            for (const conn of userConnections) {
              // 내 정보가 아닌 경우 건너뛰기
              if (
                conn.serverData !==
                JSON.stringify({
                  user_pk: loginInfo.current.user_pk,
                  nickname: loginInfo.current.nickname,
                })
              ) {
                continue
              }
              try {
                await serverSideSession.forceDisconnect(conn)
                console.log('기존 연결 정리 성공:', conn.connectionId)
              } catch (error) {
                console.warn('기존 연결 정리 중 오류:', error)
              }
            }
          }

          // 4-4. 새로운 연결 생성
          connection = await serverSideSession.createConnection({
            role: 'PUBLISHER',
            data: JSON.stringify({
              user_pk: loginInfo.current.user_pk,
              nickname: loginInfo.current.nickname,
            }),
          })
          console.log('[Step 4] 새 연결 생성 성공:', connection.connectionId)

          setConnection(connection)
        } catch (error) {
          console.error('[Step 4] 연결 관리 실패:', error)
          throw error
        }

        // 5. 로컬 스트림 초기화
        try {
          publisher = await openViduBrowser.initPublisherAsync(undefined, {
            audioSource: true, // 기본 마이크 사용
            videoSource: false, // 비디오 미사용
            publishAudio: true, // 오디오 사용
            publishVideo: false, // 비디오 미사용
            insertMode: 'APPEND', 
            mediaOptions: {
              audio: {
                echoCancellation: true, // 에코 제거
                noiseSuppression: true, // 잡음 제거
                autoGainControl: true, // 자동 볼륨 조절
                sampleRate: 44100, // 샘플 레이트 추가
              },
            },
          })
          console.log('[Step 5] 로컬 스트림 초기화 성공', publisher)
          setPublisher(publisher)
        } catch (error) {
          console.error('[Step 5] 로컬 스트림 초기화 실패:', error)
        }

        // 6. 접속을 위한 Client-Side Session 생성
        try {
          clientSideSession = await openViduBrowser.initSession()
          setClientSession(clientSideSession) // clientSideSession을 상태에 저장
          console.log('[Step 6] 접속을 위한 Client-Side Session 생성 성공', clientSideSession)
        } catch (error) {
          console.error('[Step 6] 접속을 위한 Client-Side Session 생성 실패:', error)
        }

        // 7. 세션 이벤트 핸들러 설정
        // 7-1. 이벤트 핸들러 정의
        const eventHandlers = {
          // 스트림이 생성될 때 (누군가 스트림 발행을 시작할 때)
          streamCreated: (event) => {
            const subscriberOptions = {
              insertMode: 'APPEND',
              subscribeToAudio: true,
              subscribeToVideo: false
            };
        
            const subscriber = clientSideSession.subscribe(event.stream,undefined,subscriberOptions);
            // 이미 존재하는 참가자인지 확인
            // const connectionId = event.stream.connection.connectionId
            const connectionData = JSON.parse(event.stream.connection.data)
            
            // setParticipants(prev => {
            //   // 이미 존재하면 업데이트하지 않음
            //   if (prev.some(p => p.connectionId === connectionId)) return prev;
              
            //   return [...prev, {
            //     connectionId,
            //     streamManager: subscriber,
            //     ...connectionData,
            //   }]
            // })
        
            // VAD 이벤트 핸들러 설정
            subscriber.on('publisherStartSpeaking', () => {
              setSpeakingUsers((prev) => [...prev, connectionData.user_pk])
            })
            subscriber.on('publisherStopSpeaking', () => {
              setSpeakingUsers((prev) => prev.filter((id) => id !== connectionData.user_pk))
            })

            // subscribers 배열에 추가
            setSubscribers((prev) => [...prev, subscriber])
          },
          // 기존 스트림이 제거될 때 발생 (누군가 스트림 발행을 중단할 때)
          streamDestroyed: (event) => {
            try {
              const connectionData = JSON.parse(event.stream.connection.data)

              // subscribers 배열에서 해당 subscriber 찾기
              setSubscribers((prev) => {
                const targetSubscriber = prev.find(
                  (sub) => sub.stream.connection.connectionId === event.stream.connection.connectionId
                )

                if (targetSubscriber) {
                  // VAD 이벤트 리스너 제거
                  targetSubscriber.off('publisherStartSpeaking')
                  targetSubscriber.off('publisherStopSpeaking')
                }

                // subscribers 배열에서 제거
                return prev.filter((sub) => sub.stream.connection.connectionId !== event.stream.connection.connectionId)
              })

              // speakingUsers 배열에서도 제거
              setSpeakingUsers((prev) => prev.filter((id) => id !== connectionData.user_pk))
            } catch (error) {
              console.warn('스트림 제거 중 이벤트 리스너 정리 실패:', error)
            }
          },
          // 새로운 사용자가 세션에 연결될 때 발생. 이벤트에서 새로운 Connection 객체의 세부 정보를 얻을 수 있음.
          connectionCreated: (event) => {
            // if (event.connection.connectionId === connection.connectionId) return
            
            const connectionId = event.connection.connectionId
            const connectionData = JSON.parse(event.connection.data)
            
            setParticipants(prev => {
              // 이미 존재하면 업데이트하지 않음
              if (prev.some(p => p.connectionId === connectionId)) return prev;
              
              return [...prev, {
                connectionId,
                ...connectionData,
              }]
            })
          },
        
          // 사용자가 세션을 나갈 때
          connectionDestroyed: (event) => {
            const connectionId = event.connection.connectionId
            setParticipants(prev => {
              const participant = prev.find(p => p.connectionId === connectionId)
              if (participant?.streamManager) {
                participant.streamManager.stream?.removeAllVideos()
                participant.streamManager.stream?.dispose()
              }
              return prev.filter(p => p.connectionId !== connectionId)
            })
          }
        }
        // 7-2.이벤트 핸들러 등록
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          clientSideSession.on(event, handler)
        })
        console.log('[Step 7] 이벤트 핸들러 등록 성공')

        // 8. 세션 연결
        await clientSideSession.connect(connection.token)
        console.log('[Step 8] 세션 연결 성공')
        // 스트림 발행 전 상태 확인
        const audioTracks = publisher.stream?.getMediaStream()?.getAudioTracks() || [];
        console.log('Pre-publish audio tracks:', audioTracks);

        // 9. 세션에 스트림 발행
        await clientSideSession.publish(publisher)
        console.log('[Step 9] 세션에 스트림 발행 성공')
        
        // 10. 전체 데이터 확인
        console.log('[Step 10] 전체 데이터 확인', {
          clientSideSession,
          serverSideSession,
          connection,
          publisher,
          participants,
        })
      } catch (error) {
        console.error('[] 토론방 초기화 실패', error)
        if (error.response?.status === 404) {
          // Handle 404
          console.error('Discussion room not found')
        }
        // Handle other errors appropriately
      }
    }

    const initializeLoginInfo = async () => {
      const maxRetries = 3
      const retryDelay = 2000 // 2초
      let retryCount = 0

      const attemptInitialize = async () => {
        try {
          const { data: loginData } = await axios.get(`${BACKEND_URL}/api/v1/users/logged-in`, {
            withCredentials: true,
          })
          loginInfo.current = loginData
          console.log('로그인 정보 초기화 성공')
        } catch (error) {
          console.error('로그인 정보 초기화 실패:', error)

          if (retryCount < maxRetries) {
            retryCount++
            console.log(`재시도 중... (${retryCount}/${maxRetries})`)
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
            return attemptInitialize()
          } else {
            console.error('최대 재시도 횟수 초과')
            // 로그인 페이지로 리다이렉트
            navigate('/auth/login', { replace: true })
          }
        }
      }

      await attemptInitialize()
    }

    initializeLoginInfo()
    initializeDiscussionRoom()
    // Cleanup 함수
    return () => {
      isComponentMountedRef.current = false

      const cleanup = async () => {
        try {
          if (publisher) {
            // 오디오 트랙 정리
            if (publisher.stream?.getMediaStream()) {
              const tracks = publisher.stream.getMediaStream().getTracks();
              tracks.forEach(track => track.stop());
            }
            
            // Publisher 이벤트 리스너 제거
            publisher.off('*');
            console.log(clientSideSession)
            // 세션에서 Publisher 제거
            if (clientSideSession) {
              await clientSideSession.unpublish(publisher);
            }
          }
      
          console.log(clientSideSession)
          // 세션 연결 해제
          if (clientSideSession) {
            clientSideSession.off('*');
            await clientSideSession.disconnect();
          }
      
          // 상태 초기화
          setClientSession(null);
          setConnection(null);
          setPublisher(null);
          setParticipants([]);
          setSpeakingUsers([]);
      
          // VAD 정리
          if (vadRef.current) {
            vadRef.current()
            vadRef.current = null
          }
        } catch (error) {
          console.error('나가기 처리 중 오류 발생:', error);
        }
      };

      cleanup()
    }
  }, [discussionId])

  const handleBack = () => {
    navigate(-1, {
      // replace: true,
    })
  }

  // 볼륨 조절에 debounce 적용
  const debouncedVolumeChange = debounce((newValue) => {
    participants.forEach((participant) => {
      if (participant.streamManager) {
        participant.streamManager.setAudioVolume(newValue)
      }
    })
  }, 100)

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue)
    debouncedVolumeChange(newValue)
  }

  // 채팅 메시지 전송
  const sendChatMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await clientSession.signal({
        data: JSON.stringify({
          message: newMessage,
          user_pk: loginInfo.current.user_pk,
          nickname: loginInfo.current.nickname,
        }),
        type: 'chat',
      })
      setNewMessage('')
    } catch (error) {
      console.error('채팅 전송 에러:', error)
    }
  }

  // OpenVidu 시그널 이벤트 처리
  useEffect(() => {
    if (clientSession) {
      const handleChatSignal = (event) => {
        const data = JSON.parse(event.data)
        setMessages((prev) => [
          ...prev,
          {
            content: data.message,
            timestamp: new Date().toISOString(),
            sender: {
              user_pk: data.user_pk,
              nickname: data.nickname,
            },
          },
        ])
      }

      clientSession.on('signal:chat', handleChatSignal)

      return () => {
        clientSession.off('signal:chat', handleChatSignal)
      }
    }
  }, [clientSession])

  // 메시지 입력 핸들러
  const handleMessageChange = (event) => {
    setNewMessage(event.target.value)
  }

  const handleMessageSubmit = async (event) => {
    event.preventDefault()
    if (!newMessage.trim()) return

    try {
      await sendChatMessage(event)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // 팩트 체크 핸들러
  const handleFactCheck = async (message) => {
    try {
      // TODO: 팩트 체크 API 호출
      const response = {
        timestamp: new Date().toISOString(),
        message: message.content,
        result:
          '31화에서 리나의 사랑 이야기에 대한 관심이 명시적으로 언급됩니다. 페이지 245, "리나는 늘 실패한 사랑 이야기에 관심이 많았다"라는 구절이 있습니다.',
      }
      setFactChecks((prev) => [...prev, response])
    } catch (error) {
      console.error('Failed to check fact:', error)
    }
  }

  // 토론 주제 추천 핸들러
  const handleTopicRecommendation = async () => {
    setIsGeneratingTopic(true)
    try {
      // TODO: 토론 주제 추천 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to generate topic:', error)
    } finally {
      setIsGeneratingTopic(false)
    }
  }

  return (
    <Grid
      container
      sx={{
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {!discussionInfo ? (
        <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ width: '100%', height: '100%' }}>
          <Typography>토론방 정보를 불러오는 중...</Typography>
        </Stack>
      ) : (
        <>
          {/* 상단 헤더 */}
          <Grid
            size={12}
            sx={{
              height: 'fit-content',
              borderBottom: '1px solid #EEEEEE',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <IconButton onClick={handleBack}>
                  <ArrowBackIcon />
                </IconButton>
                <Stack>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                    {discussionInfo.novel.title} {discussionInfo.episode && `- ${discussionInfo.episode}화`} 토론방
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {discussionInfo.topic}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="column" alignItems="flex-end" spacing={0.5}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  시작 시간:{' '}
                  {new Date(discussionInfo.start_time).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  현재 참여자: {discussionInfo.participants.length}명
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* 컨텐츠 영역 컨테이너 */}
          <Grid
            container
            size={12}
            sx={{
              height: 'calc(100vh - 72px)',
              overflow: 'hidden',
            }}
          >
            {/* 좌측 사이드바 */}
            <Grid
              size={3}
              sx={{
                height: '100%',
                borderRight: '1px solid #EEEEEE',
                bgcolor: '#FAFAFA',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 참여자 목록 헤더 */}
              <Stack sx={{ p: 2, borderBottom: '1px solid #EEEEEE' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  토론 참여자 ({discussionInfo.participants.length})
                </Typography>
              </Stack>

              {/* 참여자 목록 */}
              <Stack sx={{ flex: 1, overflow: 'auto', height: 'calc(100% - 100px)' }}>
                {participants.map((participant) => (
                  <Stack
                    key={participant.connectionId}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: '#F5F5F5',
                      },
                    }}
                  >
                    <FiberManualRecordIcon
                      sx={{
                        fontSize: 12,
                        color: speakingUsers.includes(participant.user_pk) ? '#4CAF50' : '#9E9E9E',
                      }}
                    />
                    <Typography>{participant.nickname}</Typography>
                  </Stack>
                ))}
              </Stack>

              {/* 하단 컨트롤 */}
              <Stack
                sx={{
                  p: 2,
                  borderTop: '1px solid #EEEEEE',
                  bgcolor: '#FFFFFF',
                }}
                spacing={2}
              >
                {/* 볼륨 & 마이크 컨트롤 */}
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                  {/* 마이크 버튼 */}
                  <IconButton onClick={handleMicToggle}>
                    {isMicOn ? <MicIcon /> : <MicOffIcon color="error" />}
                  </IconButton>

                  {/* 볼륨 컨트롤 */}
                  <IconButton
                    onClick={() => setVolume(volume === 0 ? 50 : 0)}
                    onMouseEnter={() => setIsVolumeHovered(true)}
                    onMouseLeave={() => setIsVolumeHovered(false)}
                  >
                    {volume === 0 ? <VolumeOffIcon color="error" /> : <VolumeUpIcon />}

                    {/* 호버 시 나타나는 볼륨 슬라이더 */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '52px',
                        left: '8px',
                        height: '120px',
                        opacity: isVolumeHovered ? 1 : 0,
                        visibility: isVolumeHovered ? 'visible' : 'hidden',
                        transition: 'opacity 0.2s, visibility 0.2s',
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 1,
                        zIndex: 1,
                      }}
                      onMouseEnter={() => setIsVolumeHovered(true)}
                      onMouseLeave={() => setIsVolumeHovered(false)}
                    >
                      <Slider
                        value={volume}
                        onChange={handleVolumeChange}
                        onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지
                        aria-label="Volume"
                        orientation="vertical"
                        size="small"
                        sx={{
                          '& .MuiSlider-root': {
                            padding: '32px 12px',
                          },
                          '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                          },
                          height: '100%',
                          mt: 0.5,
                          mb: 0.5,
                        }}
                      />
                    </Box>
                  </IconButton>
                </Stack>

                {/* 구분선 */}
                <Stack
                  sx={{
                    width: '100%',
                    height: '1px',
                    bgcolor: '#EEEEEE',
                  }}
                />

                {/* 나가기 버튼 */}
                <Button variant="contained" color="error" fullWidth onClick={() => navigate(-1)}>
                  토론방 나가기
                </Button>
              </Stack>
            </Grid>

            {/* 메인 컨텐츠 영역 */}
            <Grid
              size={6}
              sx={{
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 채팅 메시지 영역 */}
              <Stack
                sx={{
                  flex: 1,
                  overflow: 'auto',
                  p: 2,
                  gap: 2,
                }}
              >
                {messages.map((message) => (
                  <Stack
                    key={message.timestamp}
                    direction="row"
                    spacing={1}
                    alignItems="flex-start"
                    sx={{
                      alignSelf: message.sender.user_pk === loginInfo.current?.user_pk ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {message.sender.user_pk !== loginInfo.current?.user_pk && (
                      <Typography
                        variant="caption"
                        sx={{
                          bgcolor: '#F5F5F5',
                          p: 1,
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {message.sender.nickname[0]}
                      </Typography>
                    )}
                    <Stack spacing={0.5}>
                      {message.sender.user_pk !== loginInfo.current?.user_pk && (
                        <Typography variant="caption" color="text.secondary">
                          {message.sender.nickname}
                        </Typography>
                      )}
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="flex-end"
                        sx={{
                          flexDirection: message.sender.user_pk === loginInfo.current?.user_pk ? 'row-reverse' : 'row',
                        }}
                      >
                        <Stack
                          sx={{
                            bgcolor: message.sender.user_pk === loginInfo.current?.user_pk ? '#E3F2FD' : '#F5F5F5',
                            p: 1.5,
                            borderRadius: 2,
                            width: '70%',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              wordBreak: 'break-word',
                              lineHeight: 1.8,
                              gap: 0.5,
                            }}
                          >
                            {message.content}{' '}
                            <Tooltip title="Fact Check" arrow placement="right">
                              <IconButton
                                size="small"
                                onClick={() => handleFactCheck(message)}
                                sx={{
                                  pb: 0.875,
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1rem',
                                  },
                                }}
                              >
                                <FactCheckOutlinedIcon />
                              </IconButton>
                            </Tooltip>
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0}
                          alignItems="center"
                          sx={{
                            whiteSpace: 'nowrap',
                            flexDirection:
                              message.sender.user_pk === loginInfo.current?.user_pk ? 'row-reverse' : 'row',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              {/* 메시지 입력 영역 */}
              <Stack
                component="form"
                direction="row"
                spacing={1}
                sx={{
                  p: 2,
                  borderTop: '1px solid #EEEEEE',
                  bgcolor: '#FFFFFF',
                }}
                onSubmit={handleMessageSubmit}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={newMessage}
                  onChange={handleMessageChange}
                  placeholder="메시지를 입력하세요"
                  variant="outlined"
                  disabled={!clientSession}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#F5F5F5',
                    },
                  }}
                />
                <IconButton type="submit" disabled={!clientSession || !newMessage.trim()} color="primary">
                  <SendIcon />
                </IconButton>
              </Stack>
            </Grid>

            {/* AI 어시스턴트 사이드바 */}
            <Grid
              size={3}
              sx={{
                height: '100%',
                borderLeft: '1px solid #EEEEEE',
                bgcolor: '#FAFAFA',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* AI 어시스턴트 헤더 */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2, borderBottom: '1px solid #EEEEEE' }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    AI 어시스턴트
                  </Typography>
                </Stack>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Stack>

              {/* 토론 주제 추천 */}
              <Stack sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    토론 주제 추천
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleTopicRecommendation}
                    disabled={isGeneratingTopic}
                    sx={{ bgcolor: '#FFA726', '&:hover': { bgcolor: '#FB8C00' } }}
                  >
                    주제
                  </Button>
                </Stack>
                <Stack
                  sx={{
                    p: 2,
                    bgcolor: '#EEEEEE',
                    borderRadius: 1,
                    minHeight: 80,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    카리나가 사용하는 타임 폴더의 기원과 목적에 대한 추측과 아이디어에 대해 토론해보세요.
                  </Typography>
                </Stack>
              </Stack>

              {/* 팩트 체크 */}
              <Stack sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
                  FACT CHECK
                </Typography>
                <Stack spacing={2}>
                  {factChecks.map((check) => (
                    <Stack
                      key={check.timestamp}
                      sx={{
                        p: 2,
                        bgcolor: '#E8F5E9',
                        borderRadius: 1,
                      }}
                      spacing={1}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {new Date(check.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        &ldquo;{check.message}&rdquo;
                      </Typography>
                      <Typography variant="body2">{check.result}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  )
}
