import { Link } from 'react-router-dom'

import { Email, Lock } from '@mui/icons-material'
import { Box, Button, Divider, InputAdornment, TextField, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { PrimaryButton, SocialLoginButton } from '../components/common/buttons'
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

const Login = () => {
  const handleSocialLogin = (provider) => {
    // TODO: 소셜 로그인 구현
    console.log(`${provider} 로그인 시도`)
  }

  return (
    <LoginContainer>
      <LoginBox>
        {/* 헤더 섹션 */}
        <Typography variant="h4" align="center" gutterBottom fontWeight={950}>
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email sx={{ color: '#c9c9c9' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          type="password"
          placeholder="비밀번호를 입력해주세요"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock sx={{ color: '#c9c9c9' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* 계정 찾기 섹션 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button component={Link} to="/auth/find-id">
            아이디 찾기
          </Button>
          <Button component={Link} to="/auth/find-password">
            비밀번호 찾기
          </Button>
        </Box>

        {/* 로그인 버튼 섹션 */}
        <PrimaryButton fullWidth>
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
        </PrimaryButton>

        {/* 소셜 로그인 섹션 */}
        <Divider sx={{ my: 2 }}>간편 로그인</Divider>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          <SocialLoginButton
            imgSrc="/src/assets/social-login/google-G.png"
            provider="Google"
            onClick={() => handleSocialLogin('Google')}
          />

          <SocialLoginButton
            imgSrc="/src/assets/social-login/naver-circle.png"
            provider="Naver"
            onClick={() => handleSocialLogin('Naver')}
          />

          <SocialLoginButton
            imgSrc="/src/assets/social-login/kakaotalk-rectangle.png"
            provider="Kakao"
            onClick={() => handleSocialLogin('Kakao')}
          />
        </Box>
      </LoginBox>
    </LoginContainer>
  )
}

export default Login
