import { useState } from 'react'

import DeleteIcon from '@mui/icons-material/Delete'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'
import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material'
import PrimaryButton from '../components/common/buttons/PrimaryButton'

const NovelBackgroundGeneration = () => {
  const [selectedGenre, setSelectedGenre] = useState('')
  const [title, setTitle] = useState('')
  const [worldView, setWorldView] = useState('')
  const [background, setBackground] = useState('')

  const genres = [
    '판타지',
    '로맨스',
    '무협',
    '역사',
    '드라마',
    'SF',
    '일상',
    '창작',
    '전쟁',
    '개그',
    '일상물',
    '미스터리',
    '추리',
    '스릴러',
    '호러',
  ]

  const handleGenerate = () => {
    // TODO: AI 생성 로직 구현
    console.log({
      genre: selectedGenre,
      title,
      worldView,
      background,
    })
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 950 }}>
          작품의 배경에 대한 정보를 입력해주세요.
        </Typography>
        <Stack direction="row" spacing={1}>
          <PrimaryButton
            startIcon={<SaveIcon />}
            backgroundColor="#111111"
            hoverBackgroundColor="#404040"
          >
            저장
          </PrimaryButton>
          <PrimaryButton
            startIcon={<DeleteIcon />}
            backgroundColor="#D32F2F"
            hoverBackgroundColor="#A82525"
          >
            삭제
          </PrimaryButton>
        </Stack>
      </Box>
      <Divider sx={{ mb: 4 }} />

      {/* 장르 선택 버튼들 */}
      <Typography variant="h3" sx={{ mb: 1, fontSize: '1.5rem', fontWeight: 700 }}>
        장르 태그
      </Typography>
      <Stack spacing={1}>
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              minWidth: 'min-content',
              flexWrap: 'nowrap',
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#FFA000',
                borderRadius: '4px',
              },
            }}
          >
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? 'contained' : 'outlined'}
                onClick={() => setSelectedGenre(genre)}
                sx={{
                  color: selectedGenre === genre ? 'white' : 'grey.700',
                  fontWeight: 600,
                  backgroundColor: selectedGenre === genre ? '#FFA000' : 'transparent',
                  whiteSpace: 'nowrap',
                  borderRadius: '20px',
                  minWidth: 'auto',
                  width: 'fit-content',
                  py: 1,
                  px: 2,
                  flex: '0 0 auto',
                  '&:hover': {
                    backgroundColor: selectedGenre === genre ? '#FFA000' : 'rgba(255, 160, 0, 0.1)',
                  },
                  borderColor: selectedGenre === genre ? '#FFA000' : 'grey.300',
                }}
              >
                {genre}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* 제목 입력 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            제목
          </Typography>
          <PrimaryButton
            startIcon={<OfflineBoltIcon />}
            onClick={handleGenerate}
          >
            AI 생성
          </PrimaryButton>
        </Box>
        <TextField
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력해주세요. AI 생성 후 수정도 가능합니다."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'white',
            },
          }}
        />

        {/* 희망하는 세계관 입력 */}
        <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          세계관
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={worldView}
          onChange={(e) => setWorldView(e.target.value)}
          placeholder="세계관을 입력해주세요. AI 생성 후 수정도 가능합니다."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'white',
            },
          }}
        />

        {/* 기본 동기/배경 입력 */}
        <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
          기본 줄거리
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder="기본 줄거리를 입력해주세요. AI 생성 후 수정도 가능합니다."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'white',
            },
          }}
        />

        {/* 버튼 그룹 */}
        <Box display="flex" justifyContent="center">
          <Stack direction="row" spacing={2}></Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default NovelBackgroundGeneration
