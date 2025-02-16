import styled from '@emotion/styled'

import { useCallback, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import FavoriteIcon from '@mui/icons-material/Favorite'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'

import coverPlaceholder from '/src/assets/placeholder/cover-image-placeholder.png'

const SearchBar = styled(TextField)({
  '& .MuiOutlinedInput-root': { borderRadius: '4px', backgroundColor: '#ffffff' },
})

const FilterSelect = styled(FormControl)({ minWidth: 120 })

const NovelCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '4px',
  transition: 'transform 0.2s ease-in-out',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  '&:hover': { 
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(0, 0, 0, 0.2)'
  },
})

const NovelList = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [genre, setGenre] = useState('all')

  // 소설 목록 데이터 (임시)
  const novels = useMemo(
    () => [
      {
        id: 1,
        title: '시간을 달리는 소녀',
        author: '김희진',
        coverImage: coverPlaceholder,
        views: 1234,
        likes: 567,
        genre: '판타지',
        description: '시간 여행을 통해 과거와 현재를 오가는 소녀의 이야기',
      },
      {
        id: 2,
        title: '달빛 조각사',
        author: '남궁인',
        coverImage: coverPlaceholder,
        views: 8765,
        likes: 432,
        genre: '판타지',
        description: '가상 현실 게임 속 대장장이의 성장 스토리',
      },
      {
        id: 3,
        title: '구해줘',
        author: '정유진',
        coverImage: coverPlaceholder,
        views: 5432,
        likes: 789,
        genre: '미스터리',
        description: '연쇄 실종 사건을 파헤치는 형사의 이야기',
      },
      {
        id: 4,
        title: '봄날의 약속',
        author: '이서연',
        coverImage: coverPlaceholder,
        views: 3456,
        likes: 234,
        genre: '로맨스',
        description: '10년 만에 재회한 첫사랑의 이야기',
      },
      {
        id: 5,
        title: '마법사의 탑',
        author: '김도훈',
        coverImage: coverPlaceholder,
        views: 6789,
        likes: 345,
        genre: '판타지',
        description: '최강의 마법사가 되기 위한 수련생의 여정',
      },
      {
        id: 6,
        title: '그림자 살인',
        author: '박진우',
        coverImage: coverPlaceholder,
        views: 4567,
        likes: 678,
        genre: '미스터리',
        description: '연쇄 살인마를 쫓는 프로파일러의 이야기',
      },
      {
        id: 7,
        title: '별들의 춤',
        author: '최하늘',
        coverImage: coverPlaceholder,
        views: 7890,
        likes: 456,
        genre: '로맨스',
        description: '무용수와 음악가의 운명적인 만남',
      },
      {
        id: 8,
        title: '용의 아이',
        author: '강민호',
        coverImage: coverPlaceholder,
        views: 2345,
        likes: 567,
        genre: '판타지',
        description: '용족의 피를 이어받은 소년의 모험',
      },
    ],
    []
  )

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value)
    // TODO: 검색 로직 구현
  }, [])

  const handleSortChange = useCallback((event) => {
    setSortBy(event.target.value)
    // TODO: 정렬 로직 구현
  }, [])

  const handleGenreChange = useCallback((event) => {
    setGenre(event.target.value)
    // TODO: 장르 필터링 로직 구현
  }, [])

  const handleNovelClick = useCallback(
    (novelId) => {
      // TODO: 소설 상세 페이지로 이동
      navigate(`/novel/${novelId}`)
    },
    [navigate]
  )

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* 검색 및 필터 섹션 */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <SearchBar
          fullWidth
          placeholder="소설 제목, 작가명으로 검색"
          value={searchQuery}
          onChange={handleSearchChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <FilterSelect>
          <InputLabel>정렬</InputLabel>
          <Select value={sortBy} onChange={handleSortChange} label="정렬">
            <MenuItem value="latest">최신순</MenuItem>
            <MenuItem value="popular">인기순</MenuItem>
            <MenuItem value="views">조회순</MenuItem>
          </Select>
        </FilterSelect>
        <FilterSelect>
          <InputLabel>장르</InputLabel>
          <Select value={genre} onChange={handleGenreChange} label="장르">
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="fantasy">판타지</MenuItem>
            <MenuItem value="romance">로맨스</MenuItem>
            <MenuItem value="mystery">미스터리</MenuItem>
          </Select>
        </FilterSelect>
      </Stack>

      {/* 소설 목록 그리드 */}
      <Grid container spacing={3}>
        {novels.map((novel) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={novel.id}>
            <NovelCard>
              <CardActionArea onClick={() => handleNovelClick(novel.id)}>
                <CardMedia
                  component="img"
                  sx={{ aspectRatio: '3/4', objectFit: 'cover' }}
                  image={novel.coverImage}
                  alt={novel.title}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {novel.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                    {novel.author}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {novel.description}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <VisibilityIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {novel.views.toLocaleString()}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FavoriteIcon fontSize="small" color="error" />
                      <Typography variant="body2" color="text.secondary">
                        {novel.likes.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </NovelCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default NovelList
