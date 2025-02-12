import { Link } from 'react-router-dom'

import Email from '@mui/icons-material/Email'
import Lock from '@mui/icons-material/Lock'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import GoogleIcon from '../assets/icons/GoogleIcon'
import { PrimaryButton } from '../components/common/buttons'
import graphicLogo from '/src/assets/logo/graphic-logo.svg'

const Login = () => {
  const handleSocialLogin = () => {
    // TODO: 구글 소셜 로그인 구현
    // 1. Google OAuth 인증 요청
    // 2. 인증 토큰 받기
    // 3. 사용자 정보 요청
    // 4. 로그인 처리
    console.log('구글 로그인 시도')
  }

  const handleLogin = () => {
    // TODO: 일반 로그인 구현
    // 1. 입력값 유효성 검사
    // 2. API 로그인 요청
    // 3. 토큰 저장
    // 4. 로그인 상태 업데이트
    console.log('일반 로그인 시도')
  }

  return (
    <Stack
      sx={{
        height: 'calc(100vh - 64px)',
        padding: '0 2rem',
        marginTop: '-64px',
        paddingTop: '64px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: '100%',
          maxWidth: '400px',
        }}
      >
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
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#c9c9c9' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          fullWidth
          type="password"
          placeholder="비밀번호를 입력해주세요"
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ color: '#c9c9c9' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* 계정 찾기 섹션 */}
        <Stack direction="row" justifyContent="center" spacing={1} alignItems="center">
          <Button
            component={Link}
            to="/auth/find-password"
            sx={{ fontWeight: 600, color: '#555555' }}
          >
            비밀번호 찾기
          </Button>
          <span style={{ color: '#c9c9c9' }}>|</span>
          <Button component={Link} to="/auth/find-id" sx={{ fontWeight: 600, color: '#555555' }}>
            아이디 찾기
          </Button>
          <span style={{ color: '#c9c9c9' }}>|</span>
          <Button component={Link} to="/auth/signup" sx={{ fontWeight: 600, color: '#555555' }}>
            회원가입
          </Button>
        </Stack>

        {/* 로그인 버튼 섹션 */}
        <Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
          <PrimaryButton fullWidth onClick={handleLogin} sx={{ borderRadius: '4px' }}>
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
            <Typography 
              sx={{ 
                fontWeight: 600,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.5px',
              }}
            >
              모모소 로그인
            </Typography>
          </PrimaryButton>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSocialLogin}
            startIcon={<GoogleIcon />}
            sx={{
              height: '40px',
              backgroundColor: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              fontFamily: '"Google Sans",arial,sans-serif',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '0.25px',
              color: '#1f1f1f',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f6f6f6',
                borderColor: '#dadce0',
              },
            }}
          >
            Google 로그인
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default Login
