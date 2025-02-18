import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from '@emotion/styled'
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
    border: '1px solid rgba(0, 0, 0, 0.2)',
  },
})

const NovelList = () => {
  const navigate = useNavigate()
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [genre, setGenre] = useState('all')

  useEffect(() => {
    const fetchNovels = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}/api/v1/novels`)
        if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.')
        const data = await response.json()
        setNovels(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNovels()
  }, [])

  const handleSearchChange = useCallback((event) => {
    setSearchQuery(event.target.value)
  }, [])

  const handleSortChange = useCallback((event) => {
    setSortBy(event.target.value)
  }, [])

  const handleGenreChange = useCallback((event) => {
    setGenre(event.target.value)
  }, [])

  const handleNovelClick = useCallback(
    (novelPk) => {  // novelId -> novelPk 로 변경
      navigate(`/novel/${novelPk}`);  // `/novel/viewer/${novelId}` 에서 변경, novelId -> novelPk 로 변경
    },
    [navigate]
  );

  if (loading) return <Typography sx={{ textAlign: 'center', mt: 4 }}>로딩 중...</Typography>
  if (error) return <Typography sx={{ textAlign: 'center', mt: 4, color: 'red' }}>{error}</Typography>

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
              <CardActionArea onClick={() => handleNovelClick(novel.novel_pk)}>  {/* novel.id -> novel.novel_pk 로 변경 */}
                <CardMedia
                  component="img"
                  sx={{ aspectRatio: '3/4', objectFit: 'cover' }}
                  image={novel.coverImage || coverPlaceholder}
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