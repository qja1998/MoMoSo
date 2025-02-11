import styled from '@emotion/styled'

import { useNavigate } from 'react-router-dom'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Paper, Stack, Typography } from '@mui/material'

const OptionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  height: '300px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    backgroundColor: theme.palette.grey[100],
  },
}))

const IconWrapper = styled(Box)(({ theme }) => ({
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    fontSize: '40px',
    color: 'white',
  },
}))

const NovelEditor = () => {
  const navigate = useNavigate()

  const handleNewNovel = () => {
    navigate('/novel/edit/background')
  }

  const handleExistingNovel = () => {
    navigate('/novel/viewer/list')
  }

  return (
    <Stack spacing={4} sx={{ width: '100%', p: 4, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography
        variant="h1"
        sx={{ fontSize: '2.5rem', fontWeight: 900, textAlign: 'center', mb: 6 }}
      >
        소설 작성을 시작해볼까요?
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* 신규 소설 생성 카드 */}
        <OptionCard onClick={handleNewNovel}>
          <IconWrapper>
            <AddCircleOutlineIcon />
          </IconWrapper>
          <Typography
            variant="h2"
            sx={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center' }}
          >
            새로운 소설 시작하기
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', px: 4 }}>
            새로운 이야기를 시작해보세요. AI가 당신의 상상력을 현실로 만들어드립니다.
          </Typography>
        </OptionCard>

        {/* 기존 소설 수정 카드 */}
        <OptionCard onClick={handleExistingNovel}>
          <IconWrapper>
            <EditIcon />
          </IconWrapper>
          <Typography
            variant="h2"
            sx={{ fontSize: '1.8rem', fontWeight: 700, textAlign: 'center' }}
          >
            작성 중인 소설 이어쓰기
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', px: 4 }}>
            진행 중인 작품을 이어서 작성하세요. 당신의 이야기를 기다리고 있습니다.
          </Typography>
        </OptionCard>
      </Box>
    </Stack>
  )
}

export default NovelEditor
