import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function DiscussionSummary() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState({
    discussion_pk: 10,
    novel: {
      novel_pk: 1,
      title: '시간을 달리는 소녀',
    },
    episode: null,
    topic: '리나는 첨지를 왜 만났을까',
    start_time: '2025-02-14T06:32:10',
    end_time: '2025-02-14T07:32:10',
    summary_text: '토론에서는 리나와 첨지의 만남이 우연인지 필연인지에 대한 깊이 있는 논의가 이루어졌습니다. 참가자들은 시간 여행이라는 설정 속에서 그들의 만남이 운명적이었다는 의견과, 시간의 흐름 속에서 모든 만남이 우연이면서도 필연이었을 것이라는 의견을 나누었습니다.',
    key_points: [
      '시간 여행이 만남에 미치는 영향',
      '운명과 우연의 관계',
      '리나의 성격과 선택의 의미',
    ],
    suggestions: [
      {
        title: '시간 여행자의 윤리',
        description: '시간을 여행하면서 발생할 수 있는 윤리적 딜레마와 책임에 대해 토론해보세요.',
      },
      {
        title: '과거와 현재의 연결고리',
        description: '작품에서 나타나는 과거와 현재의 연결점들이 가지는 상징적 의미를 분석해보세요.',
      },
    ],
  })

  const handleBack = () => {
    navigate(-1)
  }

  const handleGenerateSummary = async () => {
    setIsLoading(true)
    try {
      // TODO: API 호출하여 토론 내용 요약 생성
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Stack sx={{ height: '100vh', bgcolor: '#FAFAFA' }}>
      {/* 헤더 */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          p: 2,
          borderBottom: '1px solid #EEEEEE',
          bgcolor: '#FFFFFF',
        }}
      >
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Stack>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
            {summary.novel.title} {summary.episode && `- ${summary.episode}화`} 토론 요약
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {summary.topic}
          </Typography>
        </Stack>
      </Stack>

      {/* 컨텐츠 */}
      <Stack spacing={3} sx={{ p: 3, flex: 1, overflow: 'auto' }}>
        {/* 토론 정보 */}
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            토론 시간:{' '}
            {new Date(summary.start_time).toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            ~{' '}
            {new Date(summary.end_time).toLocaleString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </Stack>

        {/* 요약 */}
        <Stack
          spacing={2}
          sx={{
            p: 3,
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoStoriesIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              토론 요약
            </Typography>
          </Stack>
          {isLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" height={20} width="100%" />
              <Skeleton variant="text" height={20} width="90%" />
              <Skeleton variant="text" height={20} width="95%" />
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {summary.summary_text}
            </Typography>
          )}
          <Stack spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 500, mt: 2 }}>
              주요 논점
            </Typography>
            {isLoading ? (
              <Stack spacing={1}>
                <Skeleton variant="text" height={24} width="60%" />
                <Skeleton variant="text" height={24} width="70%" />
                <Skeleton variant="text" height={24} width="65%" />
              </Stack>
            ) : (
              <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                {summary.key_points.map((point, index) => (
                  <Typography component="li" key={index} variant="body2">
                    {point}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* 제안 */}
        <Stack
          spacing={2}
          sx={{
            p: 3,
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <LightbulbIcon sx={{ color: '#FFA726' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              다음 토론 주제 제안
            </Typography>
          </Stack>
          {isLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="rectangular" height={100} />
              <Skeleton variant="rectangular" height={100} />
            </Stack>
          ) : (
            <Stack spacing={2}>
              {summary.suggestions.map((suggestion, index) => (
                <Stack
                  key={index}
                  spacing={1}
                  sx={{
                    p: 2,
                    bgcolor: '#FFF3E0',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    {suggestion.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {suggestion.description}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
} 