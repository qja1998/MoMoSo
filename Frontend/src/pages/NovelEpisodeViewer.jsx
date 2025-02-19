import styled from '@emotion/styled'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

import { useCallback, useEffect, useState, useMemo } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import { useNovel } from '../contexts/NovelContext'

// 아이콘
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SettingsIcon from '@mui/icons-material/Settings'
// 디자인 컴포넌트
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
// 댓글 관련 아이콘 추가
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ImageIcon from '@mui/icons-material/Image'
import SendIcon from '@mui/icons-material/Send'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const ViewerContainer = styled(Box)({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '24px',
  position: 'relative',
})

const ViewerHeader = styled(Paper)({
  padding: '16px 24px',
  marginBottom: '24px',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  top: 0,
  zIndex: 100,
})

const ViewerContent = styled(Paper)({
  padding: '32px',
  marginBottom: '24px',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  lineHeight: '1.8',
  fontSize: '1.1rem',
  '& p': {
    marginBottom: '1.5em',
  },
})

const FloatingButton = styled(IconButton)({
  position: 'fixed',
  top: '50vh',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 160, 0, 0.8)',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: 'rgba(255, 143, 0, 0.9)',
  },
  padding: '12px',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
})

const NovelEpisodeViewer = () => {
  const { episodeId } = useParams()
  const navigate = useNavigate()
  const {
    novelData,
    currentEpisode,
    isBookmarked,
    isLiked,
    viewerSettings,
    comments,
    setCurrentEpisode,
    toggleBookmark,
    toggleLike,
    updateViewerSettings,
    fetchNovelData,
  } = useNovel()

  const [anchorEl, setAnchorEl] = useState(null)
  const [episodeAnchorEl, setEpisodeAnchorEl] = useState(null)
  const [commentInput, setCommentInput] = useState('')

  const open = Boolean(anchorEl)
  const episodeOpen = Boolean(episodeAnchorEl)

  useEffect(() => {
    const loadEpisodeData = async () => {
      try {
        // URL 형식: /novel/{novelId}/{episodeId}
        const urlParts = window.location.pathname.split('/')
        const novelId = parseInt(urlParts[2])
        const targetEpId = parseInt(urlParts[3])

        if (!novelData.episode.length) {
          const result = await fetchNovelData(novelId)
          
          if (result) {
            const episode = result.episode.find(ep => ep.ep_pk === targetEpId)
            
            if (episode) {
              setCurrentEpisode(episode)
            } else {
              navigate('/novel/' + novelId) // 에피소드 목록으로 리다이렉트
            }
          }
        } else {
          const episode = novelData.episode.find(ep => ep.ep_pk === targetEpId)
          if (episode) {
            setCurrentEpisode(episode)
          } else {
            navigate('/novel/' + novelId)
          }
        }
      } catch (error) {
        console.error('에피소드 데이터 로딩 실패')
        navigate('/novel/' + novelId)
      }
    }

    loadEpisodeData()
  }, [episodeId, fetchNovelData, setCurrentEpisode, navigate, novelData.episode])

  const parseContent = useCallback(
    (text) => {
      return text?.split('\n\n').map((paragraph, index) => (
        <Typography
          component="p"
          key={index}
          sx={{
            fontSize: `${viewerSettings.fontSize}px`,
            fontFamily: viewerSettings.fontFamily,
          }}
        >
          {paragraph?.split('\n').map((line, lineIndex) => (
            <span key={lineIndex}>
              {line}
              <br />
            </span>
          ))}
        </Typography>
      ))
    },
    [viewerSettings.fontSize, viewerSettings.fontFamily]
  )

  const handleFontSizeChange = useCallback((newSize) => {
    updateViewerSettings({ fontSize: newSize })
    setAnchorEl(null)
  }, [updateViewerSettings])

  const handleFontFamilyChange = useCallback((newFont) => {
    updateViewerSettings({ fontFamily: newFont })
    setAnchorEl(null)
  }, [updateViewerSettings])

  const handleBgColorChange = useCallback((newColor) => {
    updateViewerSettings({ bgColor: newColor })
    setAnchorEl(null)
  }, [updateViewerSettings])

  const handlePreviousEpisode = useCallback(() => {
    if (!currentEpisode || novelData.episode.length === 0) {
      return
    }
    
    const currentIndex = novelData.episode.findIndex(ep => ep.ep_pk === currentEpisode?.ep_pk)
    
    if (currentIndex > 0) {
      const prevEpisode = novelData.episode[currentIndex - 1]
      setCurrentEpisode(prevEpisode)
      navigate(`/novel/${prevEpisode.novel_pk}/${prevEpisode.ep_pk}`)
    }
  }, [currentEpisode, novelData.episode, navigate, setCurrentEpisode])

  const handleNextEpisode = useCallback(() => {
    if (!currentEpisode || novelData.episode.length === 0) {
      return
    }
    
    const currentIndex = novelData.episode.findIndex(ep => ep.ep_pk === currentEpisode?.ep_pk)
    
    if (currentIndex < novelData.episode.length - 1) {
      const nextEpisode = novelData.episode[currentIndex + 1]
      setCurrentEpisode(nextEpisode)
      navigate(`/novel/${nextEpisode.novel_pk}/${nextEpisode.ep_pk}`)
    }
  }, [currentEpisode, novelData.episode, navigate, setCurrentEpisode])

  const handleEpisodeSelect = useCallback((epPk) => {
    const selectedEpisode = novelData.episode.find(ep => ep.ep_pk === epPk)
    if (selectedEpisode) {
      setCurrentEpisode(selectedEpisode)
      navigate(`/novel/${selectedEpisode.novel_pk}/${selectedEpisode.ep_pk}`)
    }
    setEpisodeAnchorEl(null)
  }, [novelData.episode, navigate, setCurrentEpisode])

  // 현재 에피소드의 인덱스 계산
  const currentIndex = useMemo(() => {
    if (!currentEpisode || !novelData.episode.length) return -1
    return novelData.episode.findIndex(ep => ep.ep_pk === currentEpisode.ep_pk)
  }, [currentEpisode, novelData.episode])

  // 이전화/다음화 존재 여부 확인
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < novelData.episode.length - 1 && currentIndex !== -1

  // 댓글 작성 핸들러
  const handleSubmitComment = useCallback(() => {
    if (!commentInput.trim()) return

    // TODO: 
    // 1. API를 통해 댓글 작성 요청 전송
    // 2. 성공 시 댓글 목록 새로고침
    // 3. 실패 시 에러 처리
    setCommentInput('')
  }, [commentInput])

  // 댓글 좋아요 핸들러
  const handleLike = useCallback((commentId) => {
    // TODO:
    // 1. API를 통해 좋아요 요청 전송
    // 2. 성공 시 좋아요 상태 업데이트
    // 3. 실패 시 에러 처리
  }, [])

  // 댓글 싫어요 핸들러
  const handleDislike = useCallback((commentId) => {
    // TODO:
    // 1. API를 통해 싫어요 요청 전송
    // 2. 성공 시 싫어요 상태 업데이트
    // 3. 실패 시 에러 처리
  }, [])

  // 댓글 삭제 핸들러
  const handleDeleteComment = useCallback((commentId) => {
    // TODO:
    // 1. API를 통해 댓글 삭제 요청 전송
    // 2. 성공 시 댓글 목록에서 제거
    // 3. 실패 시 에러 처리
  }, [])

  if (!currentEpisode) {
    return <Typography>Loading...</Typography>
  }

  return (
    <ViewerContainer>
      <ViewerHeader>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              onClick={(event) => setEpisodeAnchorEl(event.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {currentEpisode.ep_title || '제목 없음'}
              </Typography>
              <ArrowDropDownIcon />
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton onClick={toggleBookmark}>
                {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton onClick={toggleLike}>
                {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
                <SettingsIcon />
              </IconButton>
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            마지막 업데이트: {currentEpisode.updated_date ? 
              dayjs(currentEpisode.updated_date)
                .locale('ko')
                .format('YYYY년 MM월 DD일 HH:mm') 
              : '날짜 없음'}
          </Typography>
        </Stack>
      </ViewerHeader>

      <ViewerContent sx={{ backgroundColor: viewerSettings.bgColor }}>
        {parseContent(currentEpisode.ep_content || '내용 없음')}
      </ViewerContent>

      {hasPrevious && (
        <FloatingButton
          onClick={handlePreviousEpisode}
          sx={{ left: '16px' }}
          aria-label="이전 화"
        >
          <ChevronLeftIcon fontSize="large" />
        </FloatingButton>
      )}

      {hasNext && (
        <FloatingButton
          onClick={handleNextEpisode}
          sx={{ right: '16px' }}
          aria-label="다음 화"
        >
          <ChevronRightIcon fontSize="large" />
        </FloatingButton>
      )}

      <Popover
        open={episodeOpen}
        anchorEl={episodeAnchorEl}
        onClose={() => setEpisodeAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ width: 300, maxHeight: 400, overflow: 'auto', p: 2 }}>
          <Stack spacing={1}>
            {novelData.episode.map((episode, index) => (
              <Typography
                key={episode.ep_pk}
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                onClick={() => handleEpisodeSelect(episode.ep_pk)}
              >
                {index + 1}. {episode.ep_title}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Popover>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <Box sx={{ padding: '16px', minWidth: '240px' }}>
          <Typography variant="subtitle2" gutterBottom>
            글꼴 설정
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {['Nanum Gothic', 'Malgun Gothic', 'Dotum'].map((font) => (
              <Button
                key={font}
                variant={viewerSettings.fontFamily === font ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleFontFamilyChange(font)}
              >
                {font}
              </Button>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            글자 크기
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {[14, 16, 18, 20].map((size) => (
              <Button
                key={size}
                variant={viewerSettings.fontSize === size ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleFontSizeChange(size)}
              >
                {size}
              </Button>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            배경색
          </Typography>
          <Stack direction="row" spacing={1}>
            {['#ffffff', '#f5f5dc', '#000000'].map((color) => (
              <Box
                key={color}
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: color,
                  border: viewerSettings.bgColor === color ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  cursor: 'pointer',
                }}
                onClick={() => handleBgColorChange(color)}
              />
            ))}
          </Stack>
        </Box>
      </Menu>

      {/* 댓글 섹션 */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              댓글
            </Typography>
            <Typography
              variant="body2"
              sx={{
                backgroundColor: 'grey.100',
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                color: 'text.secondary',
              }}
            >
              {comments?.length || 0}
            </Typography>
          </Stack>
        </Box>

        {/* 댓글 입력 영역 */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
          }}
        >
          <TextField
            fullWidth
            multiline
            rows={4}
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="댓글을 작성해주세요."
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1}>
              <IconButton>
                <InsertEmoticonIcon />
              </IconButton>
              <IconButton>
                <ImageIcon />
              </IconButton>
            </Stack>
            <Button
              variant="contained"
              onClick={handleSubmitComment}
              startIcon={<SendIcon />}
              sx={{
                bgcolor: '#FFA000',
                '&:hover': { bgcolor: '#FF8F00' },
              }}
            >
              등록하기
            </Button>
          </Box>
        </Paper>

        {/* 댓글 목록 */}
        <Stack spacing={2}>
          {comments?.map((comment) => (
            <Paper
              key={comment.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={700}>{comment.author}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {comment.date}
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography>{comment.content}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  startIcon={<ThumbUpIcon />}
                  size="small"
                  onClick={() => handleLike(comment.id)}
                  sx={{ color: 'text.secondary' }}
                >
                  {comment.likes}
                </Button>
                <Button
                  startIcon={<ThumbDownIcon />}
                  size="small"
                  onClick={() => handleDislike(comment.id)}
                  sx={{ color: 'text.secondary' }}
                >
                  {comment.dislikes}
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </ViewerContainer>
  )
}

export default NovelEpisodeViewer
