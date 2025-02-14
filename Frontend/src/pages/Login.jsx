import { Link, useNavigate } from 'react-router-dom'

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

import { useEffect, useState } from "react";
import axios from 'axios'

const BACKEND_URL = import.meta.env.BACKEND_URL

const Login = () => {
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })
  const [formErrors, setFormErrors] = useState({
    email: false,
    password: false,
  })
  const [googleLoginUrl, setGoogleLoginUrl] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/oauth/google/login`)
      .then((response) => {
        console.log(response.data)
        setGoogleLoginUrl(response.data.login_url)
      })
      .catch((error) => {
        console.error("구글 로그인 URL 가져오기 실패:", error)
      })

    // 구글 로그인 결과 메시지 리스너
    const handleMessage = (event) => {
      if (event.origin !== "http://127.0.0.1:8000") return // Ensure the message is from your backend

      if (event.data.type === "GOOGLE_LOGIN_SUCCESS") {
        console.log("로그인 성공:", event.data.data)
        // 여기서 로그인 성공 처리 (예: 상태 업데이트, 리다이렉트 등)
        navigate("/") // 메인 페이지로 이동
      } else if (event.data.type === "GOOGLE_LOGIN_ERROR") {
        console.error("로그인 실패")
        // 로그인 실패 처리 (예: 에러 메시지 표시)
      }
    }

    window.addEventListener("message", handleMessage)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [navigate])

  const handleSocialLogin = () => {
    if (googleLoginUrl) {
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(
        googleLoginUrl,
        "googleLogin",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
      )

      // 팝업이 차단되었는지 확인
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        alert("팝업이 차단되었습니다. 팝업 차단을 해제해주세요.")
      }

      // 팝업 창 닫힘 감지
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed)
          // 팝업이 닫혔을 때 추가적인 처리가 필요하다면 여기에 작성
        }
      }, 1000)
    } else {
      console.error("로그인 URL을 가져오지 못했습니다.")
    }
  }

  const handleLogin = () => {
    // 1. 입력값 유효성 검사
    const errors = {
      email: !loginForm.email.trim(),
      password: !loginForm.password.trim(),
    }

    setFormErrors(errors)

    if (Object.values(errors).some((error) => error)) {
      return
    }

    // 2. API 로그인 요청
    axios.post(`${BACKEND_URL}/api/v1/auth/login`, loginForm)
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.error("로그인 실패:", error)
      })
    // 3. 토큰 저장
    // 4. 로그인 상태 업데이트
    console.log(loginForm)
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
          value={loginForm.email}
          onChange={(e) => {
            setLoginForm({ ...loginForm, email: e.target.value })
            setFormErrors({ ...formErrors, email: false })
          }}
          placeholder="이메일을 입력해주세요"
          variant="outlined"
          error={formErrors.email}
          helperText={formErrors.email ? '이메일을 입력해주세요' : ''}
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
          value={loginForm.password}
          onChange={(e) => {
            setLoginForm({ ...loginForm, password: e.target.value })
            setFormErrors({ ...formErrors, password: false })
          }}
          type="password"
          placeholder="비밀번호를 입력해주세요"
          variant="outlined"
          error={formErrors.password}
          helperText={formErrors.password ? '비밀번호를 입력해주세요' : ''}
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
