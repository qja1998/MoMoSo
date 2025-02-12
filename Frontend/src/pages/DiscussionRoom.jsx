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

  return (
    <Grid container sx={{ height: '100vh' }}>
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
      <Grid container size={12} sx={{ height: 'calc(100vh - 72px)' }}>
        {' '}
        {/* 헤더 높이 제외 */}
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
          <Stack sx={{ flex: 1, overflow: 'auto' }}>
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
            {/* 볼륨 컨트롤 */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative' }}>
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
                    bottom: '52px', // 약간 더 위로
                    left: '8px', // 아이콘과 정렬
                    height: '120px', // 높이 증가
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
                    aria-label="Volume"
                    orientation="vertical"
                    size="small"
                    sx={{
                      '& .MuiSlider-root': {
                        padding: '8px 12px',
                      },
                      '& .MuiSlider-thumb': {
                        width: 12,
                        height: 12,
                      },
                      height: '100%',
                      mt: 0.5, // 상단 마진 추가
                      mb: 0.5, // 하단 마진 추가
                    }}
                  />
                </Box>
              </IconButton>
            </Stack>

            {/* 마이크 & 나가기 버튼 */}
            <Stack direction="row" spacing={1}>
              <IconButton onClick={handleMicToggle}>
                {isMicOn ? <MicIcon /> : <MicOffIcon color="error" />}
              </IconButton>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => navigate('/discussions', { replace: true })}
              >
                토론방 나가기
              </Button>
            </Stack>
          </Stack>
        </Grid>
        {/* 메인 컨텐츠 영역 */}
        <Grid
          size={9}
          sx={{
            height: '100%',
            overflow: 'auto',
          }}
        >
          <Stack sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
              토론 내용
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Grid>
  )
}
