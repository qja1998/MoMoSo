import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import SendIcon from '@mui/icons-material/Send'
import AddIcon from '@mui/icons-material/Add'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import MoreVertIcon from '@mui/icons-material/MoreVert'

export default function DiscussionRoom() {
  const navigate = useNavigate()
  const [discussionInfo, setDiscussionInfo] = useState({
    discussion_pk: 10,
    session_id: '118b392d-680c-441c-9cdf-8fdac1e0a3e1',
    novel: {
      novel_pk: 1,
      title: '시간을 달리는 소녀',
    },
    episode: null,
    topic: '리나는 첨지를 왜 만났을까',
    start_time: '2025-02-14T06:32:10',
    end_time: null,
    participants: [
      {
        user_pk: 1,
        name: '김철수',
        nickname: '법의체집관',
      },
      {
        user_pk: 2,
        name: '이영희',
        nickname: '검은달의연금술사',
      },
      {
        user_pk: 3,
        name: '최영호',
        nickname: '천둥의시인',
      },
      {
        user_pk: 4,
        name: '홍길동',
        nickname: '직막의도서관',
      },
      {
        user_pk: 5,
        name: '박영수',
        nickname: '파도타는종타가면',
      },
    ],
  })
  const [isMicOn, setIsMicOn] = useState(true)
  const [volume, setVolume] = useState(50)
  const [speakingUsers, setSpeakingUsers] = useState([]) // VAD로 현재 말하고 있는 사용자들의 ID 배열
  const [isVolumeHovered, setIsVolumeHovered] = useState(false)

  // 채팅 관련 상태 추가
  const [messages, setMessages] = useState([
    {
      content: '안녕하세요! 토론에 오신 것을 환영합니다.',
      timestamp: '2025-02-14T06:32:30.000Z',
      sender: {
        user_pk: 2,
        nickname: '검은달의연금술사',
      },
    },
    {
      content: '첨지와 리나의 만남이 우연이었을까요?',
      timestamp: '2025-02-14T06:33:15.000Z',
      sender: {
        user_pk: 3,
        nickname: '천둥의시인',
      },
    },
    {
      content: '저는 운명적인 만남이었다고 생각합니다.',
      timestamp: '2025-02-14T06:34:00.000Z',
      sender: {
        user_pk: 1,
        nickname: '법의체집관',
      },
    },
    {
      content: '시간 여행이라는 설정을 고려하면, 모든 만남이 우연이면서도 필연이었을 것 같아요. 과거에서 미래로, 미래에서 과거로 이어지는 시간의 흐름 속에서 그들의 만남은 이미 정해져 있었을 수도 있죠.',
      timestamp: '2025-02-14T06:34:45.000Z',
      sender: {
        user_pk: 4,
        nickname: '직막의도서관',
      },
    },
    {
      content: '동의합니다. 시간 여행이라는 소재가 이야기에 깊이를 더해주는 것 같네요.',
      timestamp: '2025-02-14T06:35:30.000Z',
      sender: {
        user_pk: 5,
        nickname: '파도타는종타가면',
      },
    },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // AI 어시스턴트 관련 상태 추가
  const [factChecks, setFactChecks] = useState([])
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false)

  const handleBack = () => {
    navigate('/discussions', {
      replace: true,
    })
  }

  const handleMicToggle = () => {
    setIsMicOn(!isMicOn)
    // TODO: OpenVidu 마이크 제어 로직 구현
  }

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue)
    // TODO: OpenVidu 볼륨 제어 로직 구현
  }

  // 채팅 관련 핸들러 함수 추가
  const handleMessageChange = (event) => {
    setNewMessage(event.target.value)
  }

  const handleMessageSubmit = async (event) => {
    event.preventDefault()
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      // TODO: 메시지 전송 API 호출 구현
      const messageData = {
        content: newMessage,
        timestamp: new Date().toISOString(),
        sender: {
          user_pk: 1, // TODO: 실제 사용자 ID로 교체
          nickname: '나',
        },
      }
      
      setMessages((prev) => [...prev, messageData])
      setNewMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
      // TODO: 에러 처리 구현
    } finally {
      setIsLoading(false)
    }
  }

  // 팩트 체크 핸들러
  const handleFactCheck = async (message) => {
    try {
      // TODO: 팩트 체크 API 호출
      const response = {
        timestamp: new Date().toISOString(),
        message: message.content,
        result: '31화에서 리나의 사랑 이야기에 대한 관심이 명시적으로 언급됩니다. 페이지 245, "리나는 늘 실패한 사랑 이야기에 관심이 많았다"라는 구절이 있습니다.',
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
                {discussionInfo.novel.title}{' '}
                {discussionInfo.episode && `- ${discussionInfo.episode}화`} 토론방
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
              참여자 ({discussionInfo.participants.length})
            </Typography>
          </Stack>

          {/* 참여자 목록 */}
          <Stack sx={{ flex: 1, overflow: 'auto', height: 'calc(100% - 100px)' }}>
            {discussionInfo.participants.map((participant) => (
              <Stack
                key={participant.user_pk}
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
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => navigate('/discussions', { replace: true })}
            >
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
                  maxWidth: '70%',
                  alignSelf: message.sender.user_pk === 1 ? 'flex-end' : 'flex-start',
                  position: 'relative',
                }}
              >
                {message.sender.user_pk !== 1 && (
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
                  {message.sender.user_pk !== 1 && (
                    <Typography variant="caption" color="text.secondary">
                      {message.sender.nickname}
                    </Typography>
                  )}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="flex-end"
                    sx={{
                      flexDirection: message.sender.user_pk === 1 ? 'row-reverse' : 'row',
                    }}
                  >
                    <Stack
                      sx={{
                        bgcolor: message.sender.user_pk === 1 ? '#E3F2FD' : '#F5F5F5',
                        p: 1.5,
                        borderRadius: 2,
                        maxWidth: '100%',
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Stack>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => handleFactCheck(message)}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    [message.sender.user_pk === 1 ? 'left' : 'right']: -28,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      opacity: 1,
                    },
                  }}
                >
                  <FactCheckIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          {/* 메시지 입력 영역 */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              p: 2,
              borderTop: '1px solid #EEEEEE',
              bgcolor: '#FFFFFF',
            }}
          >
            <Stack
              component="form"
              direction="row"
              spacing={1}
              sx={{
                flex: 1,
                bgcolor: '#F5F5F5',
                borderRadius: 2,
                p: 1,
              }}
              onSubmit={handleMessageSubmit}
            >
              <input
                type="text"
                placeholder="메시지를 입력하세요"
                value={newMessage}
                onChange={handleMessageChange}
                disabled={isLoading}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '0.875rem',
                }}
              />
              <IconButton type="submit" size="small" disabled={isLoading || !newMessage.trim()}>
                <SendIcon />
              </IconButton>
            </Stack>
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
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
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
                    "{check.message}"
                  </Typography>
                  <Typography variant="body2">{check.result}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  )
}
