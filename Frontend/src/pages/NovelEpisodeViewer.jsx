import styled from '@emotion/styled'

import { useCallback, useEffect, useState } from 'react'

import { useLocation, useNavigate, useParams } from 'react-router-dom'

// 아이콘
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SettingsIcon from '@mui/icons-material/Settings'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
// 디자인 컴포넌트
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

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
  position: 'sticky',
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

const NavigationButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  backgroundColor: '#FFA000',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#FF8F00',
  },
})

const EpisodeSelector = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
})

const ViewerSettings = styled(Box)({
  padding: '16px',
  minWidth: '240px',
})

const NovelEpisodeViewer = () => {
  const { episodeId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [episodeData, setEpisodeData] = useState(null)
  const [episodeList, setEpisodeList] = useState([]) // 에피소드 목록 상태 추가
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [rating, setRating] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [episodeAnchorEl, setEpisodeAnchorEl] = useState(null)
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Nanum Gothic')
  const [bgColor, setBgColor] = useState('#ffffff')

  const open = Boolean(anchorEl)
  const episodeOpen = Boolean(episodeAnchorEl)

  useEffect(() => {
    // NovelEpisodeList에서 전달된 episode 데이터와 episodeList를 가져옴
    if (location.state && location.state.episode && location.state.episodeList) {
      // NovelEpisodeList 에서 이미 episode 데이터와 episodeList를 받은 이력이 있는 경우
      setEpisodeData(location.state.episode)
      setEpisodeList(location.state.episodeList)
      setLoading(false)
    } else {
      // 데이터가 없는 경우 -> novel list로 redirect
      setError('에피소드 데이터를 불러오는 데 실패했습니다.')
      setLoading(false)
      navigate('/novel/:novelId') // novelId 는 실제 novelId 로 대체
    }
  }, [location.state, episodeId, navigate])

  const parseContent = useCallback(
    (text) => {
      return text?.split('\n\n').map((paragraph, index) => (
        <Typography
          component="p"
          key={index}
          paragraph
          sx={{
            fontSize: `${fontSize}px`,
            fontFamily: fontFamily,
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
    [fontSize, fontFamily]
  )

  const handleBookmark = useCallback(() => {
    setIsBookmarked((prev) => !prev)
  }, [])

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev)
  }, [])

  const handleSettingsClick = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleSettingsClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleEpisodeClick = useCallback((event) => {
    setEpisodeAnchorEl(event.currentTarget)
  }, [])

  const handleEpisodeClose = useCallback(() => {
    setEpisodeAnchorEl(null)
  }, [])

  const handleFontSizeChange = useCallback((newSize) => {
    setFontSize(newSize)
    handleSettingsClose()
  }, [])

  const handleFontFamilyChange = useCallback((newFont) => {
    setFontFamily(newFont)
    handleSettingsClose()
  }, [])

  const handleBgColorChange = useCallback((newColor) => {
    setBgColor(newColor)
    handleSettingsClose()
  }, [])

  const handlePreviousEpisode = useCallback(() => {
    console.log('이전 화로 이동')
  }, [])

  const handleNextEpisode = useCallback(() => {
    console.log('다음 화로 이동')
  }, [])

  // ep_pk에 해당하는 episode 데이터만 필터링
  const filteredEpisodes = episodeList.filter((episode) => episode.ep_pk === parseInt(episodeId))

  // filteredEpisodes 배열에 데이터가 있는지 확인
  if (loading) {
    return <Typography>Loading...</Typography>
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>
  }

  // 데이터가 없을 경우 처리
  if (!episodeData) {
    return <Typography color="error">해당 에피소드 데이터를 찾을 수 없습니다.</Typography>
  }

  return (
    <ViewerContainer>
      <ViewerHeader>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <EpisodeSelector onClick={handleEpisodeClick}>
              <Typography variant="h6" fontWeight={700}>
                {episodeData?.ep_title || '제목 없음'}
              </Typography>
              <ArrowDropDownIcon />
            </EpisodeSelector>
            <Stack direction="row" spacing={1}>
              <Rating
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                icon={<StarIcon fontSize="small" />}
                emptyIcon={<StarBorderIcon fontSize="small" />}
              />
              <IconButton onClick={handleBookmark}>
                {isBookmarked ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton onClick={handleLike}>
                {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
              <IconButton onClick={handleSettingsClick}>
                <SettingsIcon />
              </IconButton>
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            마지막 업데이트: {episodeData?.updated_date || '날짜 없음'}
          </Typography>
        </Stack>
      </ViewerHeader>

      <ViewerContent sx={{ backgroundColor: bgColor }}>
        {parseContent(episodeData?.ep_content || '내용 없음')}
      </ViewerContent>

      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
        <NavigationButton startIcon={<NavigateBeforeIcon />} onClick={handlePreviousEpisode}>
          이전 화
        </NavigationButton>
        <NavigationButton endIcon={<NavigateNextIcon />} onClick={handleNextEpisode}>
          다음 화
        </NavigationButton>
      </Stack>
      <Popover
        open={episodeOpen}
        anchorEl={episodeAnchorEl}
        onClose={handleEpisodeClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ width: 300, maxHeight: 400, overflow: 'auto', p: 2 }}>
          <Stack spacing={1}>
            {episodeList.map((episode, index) => (
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

      <Menu anchorEl={anchorEl} open={open} onClose={handleSettingsClose}>
        <ViewerSettings>
          <Typography variant="subtitle2" gutterBottom>
            글꼴 설정
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {['Nanum Gothic', 'Malgun Gothic', 'Dotum'].map((font) => (
              <Button
                key={font}
                variant={fontFamily === font ? 'contained' : 'outlined'}
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
                variant={fontSize === size ? 'contained' : 'outlined'}
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
                  border: bgColor === color ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  borderRadius: 1,
                  cursor: 'pointer',
                }}
                onClick={() => handleBgColorChange(color)}
              />
            ))}
          </Stack>
        </ViewerSettings>
      </Menu>
    </ViewerContainer>
  )
}

export default NovelEpisodeViewer
