import { Box, Button, TextField, Typography, InputLabel } from '@mui/material'
import { styled } from '@mui/material/styles'

const FindIdContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 'calc(100vh - 64px)',
  padding: '0 2rem',
  marginTop: '-64px',
  paddingTop: '64px',
})

const FindIdBox = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
})

const StyledButton = styled(Button)({
  backgroundColor: '#FFA726',
  color: 'white',
  '&:hover': {
    backgroundColor: '#FB8C00',
  },
})

const FindId = () => {
  return (
    <FindIdContainer>
      <FindIdBox>
        {/* 헤더 섹션 */}
        <Typography variant="h4" align="center" color="#FFA726" gutterBottom>
          아이디 찾기
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          가입 시 입력한 이름과 연락처를 입력해주세요.
        </Typography>

        {/* 아이디 찾기 폼 섹션 */}
        <InputLabel htmlFor="name" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold'}}>이름</InputLabel>
        <TextField
          id="name"
          name="name"
          fullWidth
          placeholder="이름을 입력해주세요"
          variant="outlined"
        />
        
        <InputLabel htmlFor="phone" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold'}}>연락처</InputLabel>
        <Box sx={{ display: 'flex', gap: 1}}>
          <TextField
            id="phone"
            name="phone"
            fullWidth
            placeholder="연락처를 입력해주세요"
            variant="outlined"
          />
          <Button
            variant="contained"
            sx={{
              minWidth: '112px',
              backgroundColor: '#FFA726',
              color: 'white',
              '&:hover': {
                backgroundColor: '#FB8C00',
              },
            }}
          >
            인증번호 전송
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            id="verificationCode"
            name="verificationCode"
            fullWidth
            placeholder="인증번호를 입력해주세요"
            variant="outlined"
          />
          <Button
            variant="contained"
            sx={{
              minWidth: '112px',
              backgroundColor: '#FFA726',
              color: 'white',
              '&:hover': {
                backgroundColor: '#FB8C00',
              },
            }}
          >
            인증 확인
          </Button>
        </Box>

        <StyledButton variant="contained" fullWidth>
          아이디 찾기
        </StyledButton>
      </FindIdBox>
    </FindIdContainer>
  )
}

export default FindId 