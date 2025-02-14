import styled from '@emotion/styled'
import { useCallback, useState } from 'react'

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
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
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

  // 텍스트 파싱 함수
  const parseContent = useCallback((text) => {
    return text.split('\n\n').map((paragraph, index) => (
      <Typography 
        component="p" 
        key={index} 
        paragraph 
        sx={{ 
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
        }}
      >
        {paragraph.split('\n').map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            <br />
          </span>
        ))}
      </Typography>
    ))
  }, [fontSize, fontFamily])

  // 핸들러 함수들
  const handleBookmark = useCallback(() => {
    // TODO: 북마크 기능 구현
    setIsBookmarked((prev) => !prev)
  }, [])

  const handleLike = useCallback(() => {
    // TODO: 좋아요 기능 구현
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
    // TODO: 이전 화 이동 기능 구현
    console.log('이전 화로 이동')
  }, [])

  const handleNextEpisode = useCallback(() => {
    // TODO: 다음 화 이동 기능 구현
    console.log('다음 화로 이동')
  }, [])

  const sampleText = `## 괴식식당\n\n**프롤로그**\n\n미식령 변두리, 척박한 돌산 자락에 덩그러니 놓인 '괴식식당'. 낡은 나무 간판은 군데군데 칠이 벗겨져 있었고, 삐뚤빼뚤한 글씨로 '손님, 뭘 먹어도 책임 안 짐'이라고 적혀 있었다. 그 아래, 녹슨 풍경이 바람에 흔들릴 때마다 묘한 소리를 냈다. 식당 안은 어두컴컴했다.`

  return (
    <ViewerContainer>
      <ViewerHeader>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <EpisodeSelector onClick={handleEpisodeClick}>
              <Typography variant="h6" fontWeight={700}>
                1화. 첫 만남
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
            마지막 업데이트: 2024.03.14
          </Typography>
        </Stack>
      </ViewerHeader>

      <ViewerContent sx={{ backgroundColor: bgColor }}>
        {parseContent(sampleText)}
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
            {Array.from({ length: 10 }, (_, i) => (
              <Typography key={i} sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                {i + 1}화. 에피소드 {i + 1}
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
