import styled from '@emotion/styled'
import dayjs from 'dayjs'

import { useCallback, useMemo, useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
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

const NovelInfo = styled(Paper)({
  padding: '24px',
  display: 'flex',
  gap: '24px',
  marginBottom: '24px',
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
})

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 700,
  },
}))

const DiscussionBadge = styled(Box)(({ status }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '14px',
  fontWeight: 'bold',
  backgroundColor: status === '2화 토론' ? '#E3F2FD' : '#E8F5E9',
  color: status === '2화 토론' ? '#1976D2' : '#2E7D32',
  marginBottom: '8px',
}))

const NovelEpisodeList = () => {
  // episodes 상태를 useMemo로 최적화
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
    type: 'default',
    dateTime: null,
    topic: '',
    maxParticipants: 5,
  }

  const [discussions, setDiscussions] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [discussionForm, setDiscussionForm] = useState(initialDiscussionForm)

  // 모달 핸들러 함수들
  const handleOpenModal = useCallback(() => setOpenModal(true), [])
  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
    setDiscussionForm(initialDiscussionForm)
  }, [])

  const handleCreateDiscussion = useCallback(() => {
    if (!discussionForm.dateTime || !discussionForm.topic || !discussionForm.maxParticipants) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    const newDiscussion = {
      id: discussions.length + 1,
      ...discussionForm,
      createdAt: new Date().toISOString(),
      participants: [],
    }

    setDiscussions((prev) => [...prev, newDiscussion])
    handleCloseModal()
  }, [discussionForm, discussions.length])

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <NovelInfo>
        {/* 표지 섹션 */}
        <Box
          component="img"
          src={coverPlaceholder}
          alt="소설 표지"
          sx={{
            width: 200,
            height: 267,
            objectFit: 'cover',
            borderRadius: 1,
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
              서울의 한적한 골목길, 한 젊은 소녀가 운석은 오래된 골동품점에서 운석을 발견한다.
              1920년대 여인의 손때 묻은 기록과 그를 시간의 흐름 속으로 이끌고, 그는 그 곳에서 보편적
              동료 시점에서 만난 주인공 그때에 단순 이야기를 들려준다.
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

          {/* 토론 목록 */}
          <Stack spacing={2}>
            {discussions.map((discussion) => (
              <Paper
                key={discussion.id}
                elevation={1}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                <DiscussionBadge status={discussion.type === 'episode' ? '2화 토론' : '전체 토론'}>
                  {discussion.type === 'episode' ? '2화 토론' : '전체 토론'}
                </DiscussionBadge>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {discussion.topic}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {dayjs(discussion.dateTime).format('YYYY.MM.DD HH:mm')}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    참여 인원 {discussion.participants.length}/{discussion.maxParticipants}명
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>

        {/* 토론방 생성 모달 */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>토론방 생성</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>토론 유형</InputLabel>
                <Select
                  value={discussionForm.type}
                  label="토론 유형"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  onChange={(e) => setDiscussionForm({ ...discussionForm, type: e.target.value })}
                >
                  <MenuItem value="default">
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
                  <MenuItem value="episode">
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

              <FormControl fullWidth>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    value={discussionForm.dateTime}
                    onChange={(newValue) =>
                      setDiscussionForm({ ...discussionForm, dateTime: newValue })
                    }
                    minDateTime={dayjs()}
                    format="YYYY/MM/DD HH:mm"
                    ampm={false}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                      textField: {
                        fullWidth: true,
                        required: true,
                        label: '토론 일시',
                        variant: 'outlined',
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
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onChange={(e) => setDiscussionForm({ ...discussionForm, topic: e.target.value })}
              />

              <FormControl fullWidth>
                <TextField
                  value={discussionForm.maxParticipants}
                  label="최대 참여 인원"
                  type="number"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  onChange={(e) =>
                    setDiscussionForm({ ...discussionForm, maxParticipants: e.target.value })
                  }
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
      </NovelInfo>

      {/* 에피소드 목록 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>화수</StyledTableCell>
              <StyledTableCell>제목</StyledTableCell>
              <StyledTableCell align="right">조회수</StyledTableCell>
              <StyledTableCell align="right">좋아요</StyledTableCell>
              <StyledTableCell align="right">게시일</StyledTableCell>
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
    </Box>
  )
}

export default NovelEpisodeList
