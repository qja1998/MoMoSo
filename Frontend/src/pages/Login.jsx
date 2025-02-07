import { styled } from '@mui/material/styles'
import { Box, TextField, Button, Typography, Divider } from '@mui/material'

import graphicLogo from '/src/assets/logo/graphic-logo.svg'

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

const SocialLoginButton = styled(Button)({
  width: '48px',
  height: '48px',
  minWidth: '48px',
  borderRadius: '50%',
  padding: 0,
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
  },
})

const Login = () => {
  const handleSocialLogin = (provider) => {
    // TODO: 소셜 로그인 구현
    console.log(`${provider} 로그인 시도`)
  }

  return (
    <LoginContainer>
      <LoginBox>
        {/* 헤더 섹션 */}
        <Typography variant="h4" align="center" color="#FFA726" gutterBottom>
          로그인
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          모두 모여 소설을 만드는 공간 모모소
          <br />
          함께 모여 소설을 창작해보세요!
        </Typography>

        {/* 로그인 폼 섹션 */}
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
          <img
            src={graphicLogo}
            alt="모모소 로그인"
            width="24"
            height="24"
            style={{
              marginRight: '0.5rem',
              filter: 'brightness(0) invert(1)',
            }}
          />
          모모소 로그인
        </StyledButton>

        {/* 계정 찾기 섹션 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button>아이디 찾기</Button>
          <Button>비밀번호 찾기</Button>
        </Box>

        {/* 소셜 로그인 섹션 */}
        <Divider sx={{ my: 2 }}>간편 로그인</Divider>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <SocialLoginButton onClick={() => handleSocialLogin('Google')}>
            <img
              src="/src/assets/social-login/google-G.png"
              alt="Google 로그인"
            />
          </SocialLoginButton>

          <SocialLoginButton onClick={() => handleSocialLogin('Naver')}>
            <img
              src="/src/assets/social-login/naver-circle.png"
              alt="Naver 로그인"
            />
          </SocialLoginButton>

          <SocialLoginButton onClick={() => handleSocialLogin('Kakao')}>
            <img
              src="/src/assets/social-login/kakaotalk-rectangle.png"
              alt="Kakao 로그인"
            />
          </SocialLoginButton>
        </Box>
      </LoginBox>
    </LoginContainer>
  )
}

export default Login
