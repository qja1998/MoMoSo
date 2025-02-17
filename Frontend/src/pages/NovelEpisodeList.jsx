import axios from 'axios'
import dayjs from 'dayjs'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

// 아이콘
import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ImageIcon from '@mui/icons-material/Image'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import SendIcon from '@mui/icons-material/Send'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import VisibilityIcon from '@mui/icons-material/Visibility'
// 디자인 컴포넌트
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import coverPlaceholder from '/src/assets/placeholder/cover-image-placeholder.png'

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}:${import.meta.env.VITE_BACKEND_PORT}`

const NovelEpisodeList = () => {
  const navigate = useNavigate()
  // TODO: 소설 에피소드 목록 조회 API 호출
  const episodes = useMemo(
    () => [
      {
        id: 1,
        title: '첫 만남',
        views: 221,
        likes: 31,
        isLiked: false,
        publishDate: '2024-01-01',
      },
      {
        id: 2,
        title: '시간의 흐름',
        views: 222,
        likes: 45,
        isLiked: true,
        publishDate: '2024-01-08',
      },
      {
        id: 3,
        title: '시간의 교차점',
        views: 500,
        likes: 67,
        isLiked: false,
        publishDate: '2024-01-15',
      },
      {
        id: 4,
        title: '변화의 시작',
        views: 271,
        likes: 89,
        isLiked: true,
        publishDate: '2024-01-22',
      },
      {
        id: 5,
        title: '시간의 무게',
        views: 1023,
        likes: 123,
        isLiked: false,
        publishDate: '2024-01-29',
      },
    ],
    []
  )

  // 총 조회수/좋아요 계산을 useMemo로 최적화
  const { totalViews, totalLikes } = useMemo(
    () => ({
      totalViews: episodes.reduce((sum, ep) => sum + ep.views, 0),
      totalLikes: episodes.reduce((sum, ep) => sum + ep.likes, 0),
    }),
    [episodes]
  )

  // 토론방 생성 폼 초기값
  const initialDiscussionForm = {
    novel_pk: 1, // TODO: 소설 ID는 실제 URL에서 추출
    topic: '', // 토론 주제
    category: false, // 전체 작품 토론의 경우 false, 회차별 토론의 경우 true
    ep_pk: null, // 회차별 토론의 경우 회차 ID, 전체 작품 토론의 경우 null
    start_time: null, // 토론 시작 시간
    max_participants: 6, // 최대 참여 인원
  }

  const [discussions, setDiscussions] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [discussionForm, setDiscussionForm] = useState(initialDiscussionForm)
  const [formErrors, setFormErrors] = useState({
    dateTime: false,
    topic: false,
    maxParticipants: false,
    episode: false,
  })

  // 토론 목록 가져오기
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/discussion/`)
        setDiscussions(response.data)
        console.log(response.data)
      } catch (error) {
        console.error('토론 목록을 가져오는데 실패했습니다:', error)
      }
    }
    fetchDiscussions()
  }, [])

  // 모달 핸들러 함수들
  const handleOpenModal = useCallback(() => setOpenModal(true), [])
  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
    setDiscussionForm(initialDiscussionForm)
    setFormErrors({
      dateTime: false,
      topic: false,
      maxParticipants: false,
      episode: false,
    })
  }, [])

  const handleCreateDiscussion = useCallback(async () => {
    const errors = {
      dateTime: !discussionForm.start_time,
      topic: !discussionForm.topic.trim(),
      maxParticipants: !discussionForm.max_participants,
      episode: discussionForm.category && !discussionForm.ep_pk,
    }

    setFormErrors(errors)

    if (Object.values(errors).some((error) => error)) {
      return
    }

    // 서버에 전송할 데이터 형식으로 변환
    const requestData = {
      novel_pk: discussionForm.novel_pk,
      topic: discussionForm.topic,
      category: discussionForm.category,
      ep_pk: discussionForm.ep_pk,
      start_time: discussionForm.start_time,
      max_participants: parseInt(discussionForm.max_participants),
    }

    // 서버에 토론 생성 요청
    await axios
      .post(`${BACKEND_URL}/api/v1/discussion/`, requestData)
      .then((response) => {
        console.log(response)
        // 성공적으로 생성된 경우 로컬 상태 업데이트
        const newDiscussion = {
          id: discussions.length + 1,
          ...discussionForm,
          createdAt: new Date().toISOString(),
          participants: [],
        }
        setDiscussions((prev) => [...prev, newDiscussion])
        handleCloseModal()
      })
      .catch((error) => {
        switch (error.response.status) {
          case 401:
            console.error('로그인이 필요합니다:', error)
            // TODO: 에러 처리
            break
          case 404:
            console.error('Failed to create discussion:', error)
            // TODO: 에러 처리
            break
          default:
            console.error('Failed to create discussion:', error)
            // TODO: 에러 처리
            break
        }
      })
  }, [discussionForm, discussions.length])

  // 토론방 입장 핸들러
  const handleEnterDiscussion = useCallback(
    (discussion) => {
      navigate(`/discussion/${discussion.discussion_pk}`, {
        state: {
          discussion: {
            topic: discussion.topic,
            startTime: discussion.start_time,
            participants: discussion.participants,
            novelTitle: discussion.novel.title,
            episode: discussion.episode,
            sessionId: discussion.session_id,
          },
        },
      })
    },
    [navigate]
  )

  const [comments, setComments] = useState([
    // TODO: 댓글 데이터 추가
    {
      id: 1,
      author: '밍(dkgk****)',
      date: '2024-10-06 13:55',
      content: '너무 재미있습니다! 볼까말까 고민 중이시라면 보세요!',
      likes: 19,
      dislikes: 2,
      isBest: true,
    },
    {
      id: 2,
      author: 'nv_(nv_w****)',
      date: '18시간 전',
      content: 'ㅎㅎ',
      likes: 0,
      dislikes: 0,
      isBest: false,
    },
  ])

  // 댓글 좋아요/싫어요 핸들러
  const handleLike = useCallback((commentId) => {
    // TODO: 좋아요 기능 구현
    console.log('Like comment:', commentId)
  }, [])

  const handleDislike = useCallback((commentId) => {
    // TODO: 싫어요 기능 구현
    console.log('Dislike comment:', commentId)
  }, [])

  const [commentInput, setCommentInput] = useState('')

  // 댓글 작성 핸들러
  const handleSubmitComment = useCallback(() => {
    if (!commentInput.trim()) return

    setComments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        author: '사용자',
        date: new Date().toLocaleString(),
        content: commentInput,
        likes: 0,
        dislikes: 0,
        isBest: false,
      },
    ])
    setCommentInput('')
  }, [commentInput])

  // 댓글 삭제 핸들러
  const handleDeleteComment = useCallback((commentId) => {
    // TODO: 댓글 삭제 기능 구현
    console.log('Delete comment:', commentId)
  }, [])

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Paper
        sx={{
          p: '24px',
          display: 'flex',
          gap: '24px',
          elevation: 0,
          mb: '24px',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
        }}
      >
        {/* 표지 섹션 */}
        <Box
          component="img"
          src={coverPlaceholder}
          alt="소설 표지"
          sx={{
            width: 200,
            height: 267,
            objectFit: 'cover',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            flex: 2,
          }}
        />

        {/* 소설 정보 섹션 */}
        <Stack direction="column" sx={{ flex: 4, justifyContent: 'space-between' }}>
          <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 950 }}>
            시간을 달리는 소녀
          </Typography>
          <Stack direction="column" spacing={1}>
            <Typography variant="body1" color="text.secondary">
              김희진 작가
            </Typography>
            <Typography variant="body1">
              서울의 한적한 골목길, 한 젊은 소녀가 운석은 오래된 골동품점에서 운석을 발견한다. 1920년대 여인의 손때 묻은
              기록과 그를 시간의 흐름 속으로 이끌고, 그는 그 곳에서 보편적 동료 시점에서 만난 주인공 그때에 단순
              이야기를 들려준다.
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <VisibilityIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {totalViews.toLocaleString()}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <FavoriteIcon color="error" />
                <Typography variant="body2" color="text.secondary">
                  {totalLikes.toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        {/* 토론방 섹션 */}
        <Stack sx={{ flex: 4, p: 2, gap: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              토론방
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              sx={{
                bgcolor: '#FFA000',
                '&:hover': { bgcolor: '#FF8F00' },
              }}
            >
              토론 생성
            </Button>
          </Stack>

          {/* 토론 목록 */}
          <Stack
            spacing={1}
            sx={{
              height: '180px',
              overflowY: 'auto',
              scrollSnapType: 'y mandatory',
              pr: '4px',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                },
              },
            }}
          >
            {discussions.map((discussion) => (
              <Paper
                onClick={() => handleEnterDiscussion(discussion)}
                key={discussion.discussion_pk}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  scrollSnapAlign: 'start',
                  border: '1px solid #E0E0E0',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px hsla(0, 0%, 0%, 0.1)',
                    bgcolor: 'hsla(0, 0%, 0%, 0.02)',
                    borderColor: '#1976D2',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      mb: 1,
                      maxWidth: '73%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {discussion.topic}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: discussion.category ? '#E3F2FD' : '#E8F5E9',
                      color: discussion.category ? '#1976D2' : '#2E7D32',
                      mb: 1,
                    }}
                  >
                    {discussion.category ? `${discussion.episode}화 토론` : '전체 토론'}
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  참여 인원 {discussion.participants.length}명<br />
                  {dayjs(discussion.start_time).format('YYYY.MM.DD HH:mm')}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Stack>

        {/* 토론방 생성 모달 */}
        <Dialog
          open={openModal}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              handleCloseModal()
            }
          }}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle sx={{ fontWeight: 700 }}>토론방 생성</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>토론 유형</InputLabel>
                <Select
                  value={discussionForm.category}
                  label="토론 유형"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  onChange={(e) => {
                    setDiscussionForm({
                      ...discussionForm,
                      category: e.target.value,
                      ep_pk: null, // 회차 선택 초기화
                    })
                    setFormErrors((prev) => ({
                      ...prev,
                      episode: false,
                    }))
                  }}
                >
                  <MenuItem value={false}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MenuBookIcon />
                      <Box>
                        <Typography>전체 작품 토론</Typography>
                        <Typography variant="caption" color="text.secondary">
                          작품 전체에 대해 토론
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                  <MenuItem value={true}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MenuBookIcon />
                      <Box>
                        <Typography>회차별 토론</Typography>
                        <Typography variant="caption" color="text.secondary">
                          특정 회차에 대해 토론
                        </Typography>
                      </Box>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>

              {discussionForm.category && (
                <FormControl fullWidth error={formErrors.episode}>
                  <InputLabel>토론할 회차</InputLabel>
                  <Select
                    value={discussionForm.ep_pk || ''}
                    label="토론할 회차"
                    required
                    onChange={(e) => {
                      setDiscussionForm({
                        ...discussionForm,
                        ep_pk: e.target.value,
                      })
                      setFormErrors((prev) => ({
                        ...prev,
                        episode: false,
                      }))
                    }}
                  >
                    {episodes.map((episode) => (
                      <MenuItem key={episode.id} value={episode.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography>{episode.id}화</Typography>
                          <Typography color="text.secondary">{episode.title}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.episode && <FormHelperText error>토론할 회차를 선택해주세요</FormHelperText>}
                </FormControl>
              )}

              <FormControl fullWidth error={formErrors.dateTime}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    value={discussionForm.start_time}
                    onChange={(newValue) => {
                      setDiscussionForm({ ...discussionForm, start_time: newValue })
                      setFormErrors((prev) => ({
                        ...prev,
                        dateTime: false,
                      }))
                    }}
                    minDateTime={dayjs()}
                    format="YYYY/MM/DD HH:mm"
                    ampm={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        label: '토론 일시',
                        variant: 'outlined',
                        error: formErrors.dateTime,
                        helperText: formErrors.dateTime ? '토론 일시를 선택해주세요' : '',
                      },
                    }}
                  />
                </LocalizationProvider>
              </FormControl>

              <TextField
                fullWidth
                variant="outlined"
                label="토론 주제"
                placeholder="토론 주제를 입력하세요."
                value={discussionForm.topic}
                error={formErrors.topic}
                helperText={formErrors.topic ? '토론 주제를 입력해주세요' : ''}
                onChange={(e) => {
                  setDiscussionForm({ ...discussionForm, topic: e.target.value })
                  setFormErrors((prev) => ({
                    ...prev,
                    topic: false,
                  }))
                }}
              />

              <FormControl fullWidth error={formErrors.maxParticipants}>
                <TextField
                  value={discussionForm.max_participants}
                  label="최대 참여 인원"
                  type="number"
                  error={formErrors.maxParticipants}
                  helperText={formErrors.maxParticipants ? '최대 참여 인원을 입력해주세요' : ''}
                  onChange={(e) => {
                    setDiscussionForm({
                      ...discussionForm,
                      max_participants: parseInt(e.target.value),
                    })
                    setFormErrors((prev) => ({
                      ...prev,
                      maxParticipants: false,
                    }))
                  }}
                />
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseModal} variant="outlined">
              취소
            </Button>
            <Button
              onClick={handleCreateDiscussion}
              variant="contained"
              sx={{
                backgroundColor: '#FFA000',
                '&:hover': {
                  backgroundColor: '#FF8F00',
                },
              }}
            >
              생성하기
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>

      {/* 에피소드 목록 */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          mb: 3,
          border: '1px solid #e0e0e0',
          '& .MuiTableCell-head': {
            backgroundColor: (theme) => theme.palette.grey[100],
            fontWeight: 700,
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>화수</TableCell>
              <TableCell>제목</TableCell>
              <TableCell align="right">조회수</TableCell>
              <TableCell align="right">좋아요</TableCell>
              <TableCell align="right">게시일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {episodes.map((episode) => (
              <TableRow
                key={episode.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'grey.50',
                    cursor: 'pointer',
                  },
                }}
              >
                <TableCell>{episode.id}</TableCell>
                <TableCell>{episode.title}</TableCell>
                <TableCell align="right">{episode.views.toLocaleString()}</TableCell>
                <TableCell align="right">{episode.likes.toLocaleString()}</TableCell>
                <TableCell align="right">{episode.publishDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 댓글 섹션 */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              작품리뷰
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
              26
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton size="small">
              <RefreshIcon />
            </IconButton>
            <IconButton size="small">
              <InfoOutlinedIcon />
            </IconButton>
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
            placeholder="댓글을 남기려면 로그인이 필요합니다."
            disabled
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
              disabled
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
          {comments.map((comment) => (
            <Paper
              key={comment.id}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={700}>{comment.author}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {comment.date}
                  </Typography>
                </Stack>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              {comment.isBest && (
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: '#E3F2FD',
                    color: '#1976D2',
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" fontWeight={700}>
                    BEST
                  </Typography>
                </Box>
              )}
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
              <IconButton
                size="small"
                onClick={() => handleDeleteComment(comment.id)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <MoreVertIcon />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}

export default NovelEpisodeList
