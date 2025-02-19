import styled from '@emotion/styled'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

import { useCallback, useEffect, useState, useMemo, createContext, useContext, } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useNovel } from '../contexts/NovelContext'

// 아이콘
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// 디자인 컴포넌트
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
// 댓글 관련 아이콘
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ImageIcon from '@mui/icons-material/Image'
import SendIcon from '@mui/icons-material/Send'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import { useAuth } from '../hooks/useAuth'
import { createTheme, ThemeProvider } from '@mui/material/styles'

const ViewerContainer = styled(Box)(() => ({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '24px',
  position: 'relative',
}));

const ViewerHeader = styled(Paper)(() => ({
  padding: '16px 24px',
  marginBottom: '24px',
  borderRadius: '8px',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  top: 0,
  zIndex: 100,
}));

const ViewerContent = styled(Paper)(({ bgcolor }) => ({
  padding: '32px',
  marginBottom: '24px',
  borderRadius: '8px',
  backgroundColor: bgcolor,
  color: bgcolor === '#000000' ? '#ffffff' : '#000000',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  lineHeight: '1.8',
  fontSize: '1.1rem',
  '& p': {
    marginBottom: '1.5em',
    color: bgcolor === '#000000' ? '#ffffff' : '#000000',
  },
}));

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



const NovelEpisodeViewer = ({ children }) => {
  const BACKEND_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}`

  const { novelId, episodeId } = useParams()
  const navigate = useNavigate()
  const { user, isLoggedIn, showLoginModal } = useAuth()
  // 댓글 수정 상태 추가
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

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
  const handleSubmitComment = useCallback(async () => {
    if (!commentInput.trim()) return

    // 로그인 체크
    if (!isLoggedIn) {
      showLoginModal('/auth/login')
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/novel/${novelId}/episode/${episodeId}/comment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentInput,
        }),
      })

      if (!response.ok) {
        throw new Error('댓글 작성에 실패했습니다.')
      }

      const newComment = await response.json()
      setCommentInput('')
      await fetchNovelData(parseInt(novelId))

    } catch (error) {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성에 실패했습니다.')
    }
  }, [commentInput, novelId, episodeId, isLoggedIn, showLoginModal, fetchNovelData])


  // 댓글 좋아요 핸들러
  const handleLike = useCallback(async (commentPk) => {
    if (!isLoggedIn) {
      showLoginModal('/auth/login');
      return;
    }
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/novel/comment/${commentPk}/like`, {
        method: 'PUT',
        credentials: 'include',  // 쿠키에 있는 access_token을 서버로 전송
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          showLoginModal('/auth/login');
          return;
        }
        throw new Error('좋아요 처리에 실패했습니다.');
      }
  
      // 좋아요 후 소설 데이터 새로고침
      await fetchNovelData(parseInt(novelId));
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
      alert('좋아요 처리에 실패했습니다.');
    }
  }, [isLoggedIn, showLoginModal, fetchNovelData, novelId]);
  

  // 댓글 수정 핸들러
const handleEditComment = useCallback((comment) => {
  setEditingCommentId(comment.comment_pk);
  setEditContent(comment.content);
}, []);

// 댓글 수정 저장
const handleSaveEdit = useCallback(async (commentPk) => {
  if (!editContent.trim()) return;

  try {
    // URL에 content를 query parameter로 추가
    const response = await fetch(
      `${BACKEND_URL}/api/v1/novel/${novelId}/episode/${episodeId}/comment/${commentPk}?content=${encodeURIComponent(editContent)}`, 
      {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        showLoginModal('/auth/login');
        return;
      }
      throw new Error('댓글 수정에 실패했습니다.');
    }

    setEditingCommentId(null);
    setEditContent('');
    await fetchNovelData(parseInt(novelId));
  } catch (error) {
    console.error('댓글 수정 실패:', error);
    alert('댓글 수정에 실패했습니다.');
  }
}, [editContent, novelId, episodeId, showLoginModal, fetchNovelData]);

// 댓글 삭제 핸들러
const handleDeleteComment = useCallback(async (commentPk) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/novel/${novelId}/episode/${episodeId}/comment/${commentPk}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        showLoginModal('/auth/login');
        return;
      }
      throw new Error('댓글 삭제에 실패했습니다.');
    }

    await fetchNovelData(parseInt(novelId));
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    alert('댓글 삭제에 실패했습니다.');
  }
}, [novelId, episodeId, showLoginModal, fetchNovelData]);

  if (!currentEpisode) {
    return <Typography>Loading...</Typography>
  }

  return (
    <ViewerContainer >
      <ViewerHeader >
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

      <ViewerContent bgcolor={viewerSettings.bgColor}>
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

      {/* Comments Section */}
      <Paper sx={{
        mt: 3,
        p: 3,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
      }}>
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

        {/* Comment Input Area */}
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
            placeholder={isLoggedIn ? "댓글을 작성해주세요." : "댓글을 작성하려면 로그인이 필요합니다."}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={1}>
            </Stack>
            <Button
              variant="contained"
              onClick={handleSubmitComment}
              startIcon={<SendIcon />}
              disabled={!commentInput.trim()}
              sx={{
                bgcolor: '#FFA000',
                '&:hover': { bgcolor: '#FF8F00' },
              }}
            >
              등록하기
            </Button>
          </Box>
        </Paper>

        {/* Comments List */}
        <Stack spacing={2}>
          {comments?.map((comment) => (
            <Paper
              key={comment.comment_pk}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                position: 'relative',
                }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={700}>
                  {comment.user?.nickname || '알 수 없는 사용자'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dayjs(comment.created_date).format('YYYY-MM-DD HH:mm')}
                </Typography>
              </Stack>
                {user && user.user_pk === comment.user_pk && (
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment.comment_pk)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditComment(comment)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Box>
              {editingCommentId === comment.comment_pk ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button 
                      size="small" 
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent('');
                      }}
                    >
                      취소
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleSaveEdit(comment.comment_pk)}
                    >
                      저장
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Typography>{comment.content}</Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  startIcon={
                    comment.liked_users?.includes(user?.user_pk) ? 
                    <ThumbUpIcon color="primary" /> : 
                    <ThumbUpIcon />
                  }
                  size="small"
                  onClick={() => handleLike(comment.comment_pk)}
                  disabled={!isLoggedIn}
                  sx={{ 
                    color: comment.liked_users?.includes(user?.user_pk) ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {comment.likes}
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