import { styled } from '@mui/material/styles'
import { Box, TextField, Button, Typography } from '@mui/material'

const LoginContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 'calc(100vh - 64px)',
  padding: '0 2rem',
  marginTop: '-64px',
  paddingTop: '64px',
})

const LoginBox = styled(Box)({
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

const Login = () => {
  return (
    <LoginContainer>
      <LoginBox>
        <Typography variant="h4" align="center" color="#FFA726" gutterBottom>
          로그인
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          모두 모여 소설을 만드는 공간 모모소
          <br />
          함께 모여 소설을 창작해보세요!
        </Typography>
        <TextField
          fullWidth
          placeholder="이메일을 입력해주세요"
          variant="outlined"
        />
        <TextField
          fullWidth
          type="password"
          placeholder="비밀번호를 입력해주세요"
          variant="outlined"
        />
        <StyledButton variant="contained" fullWidth>
          모모소 로그인
        </StyledButton>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button>아이디 찾기</Button>
          <Button>비밀번호 찾기</Button>
        </Box>
      </LoginBox>
    </LoginContainer>
  )
}

export default Login
