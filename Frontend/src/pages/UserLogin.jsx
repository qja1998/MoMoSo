import { Link, useNavigate } from 'react-router-dom';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GoogleIcon from '../assets/icons/GoogleIcon';
import { PrimaryButton } from '../components/common/buttons';
import graphicLogo from '/src/assets/logo/graphic-logo.svg';
import { useEffect, useState } from "react";
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const UserLogin = () => {
  const BACKEND_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}:${import.meta.env.VITE_BACKEND_PORT}`
  const [googleLoginUrl, setGoogleLoginUrl] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  useEffect(() => {
    axios.defaults.withCredentials = true;

    axios
      .get(BACKEND_URL+'/api/v1/oauth/google/login')
      .then((response) => {
        setGoogleLoginUrl(response.data.login_url);
      })
      .catch((error) => {
        console.error('구글 로그인 URL 가져오기 실패:', error);
      });

      const handleMessage = (event) => {
        console.log('Received message:', event.data); // 1. 수신된 메시지 전체 내용 확인
        if (!event.origin.includes('localhost')) {
          console.log('Origin mismatch:', event.origin); // 2. 오리진 불일치 확인
          return;
        }
      
        if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
          console.log('소셜 로그인 성공:', event.data.data); // 3. 성공 메시지 확인
          setIsLoggedIn(true);
          navigate('/');
        } else if (event.data.type === 'GOOGLE_LOGIN_ERROR') {
          console.error('소셜 로그인 실패'); // 4. 실패 메시지 확인
        }
      };
  
      // 팝업 닫기 요청 처리
      const closePopupHandler = (event) => {
        if (event.origin !== BACKEND_URL+'') return;
        if (event.data.type === 'CLOSE_POPUP') {
          window.removeEventListener('message', closePopupHandler);
          window.close(); // 팝업 창 닫기
        }
      };
      window.addEventListener('message', handleMessage);
  
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [navigate, setIsLoggedIn]);

  // isLoggedIn 상태 변화 감지하여 리다이렉션
  useEffect(() => {
    if (isLoggedIn) {
      console.log('isLoggedIn is true, navigating to /'); // isLoggedIn 상태 확인
      navigate('/');
    }
    else {
      console.log('isLoggedIn is false'); // isLoggedIn 상태 확인
    }
  }, [isLoggedIn, navigate]);

  const handleSocialLogin = () => {
    if (googleLoginUrl) {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        googleLoginUrl,
        'googleLogin',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      }

      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);
          console.log('팝업이 닫혔습니다.');
        }
      }, 1000);
    } else {
      console.error('로그인 URL을 가져오지 못했습니다.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    setLoginError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      await axios.post(
        BACKEND_URL+'/api/v1/auth/login',
        formData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true,
        }
      );

      console.log('로그인 성공');
      setIsLoggedIn(true); // ✅ 로그인 상태 즉시 업데이트
      navigate('/'); // ✅ 로그인 성공 시 메인 페이지로 이동

    } catch (error) {
      console.error('로그인 실패:', error);
      if (error.response?.status === 400) {
        setLoginError(error.response.data.detail);
      } else {
        setLoginError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

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
        <Typography variant="h4" align="center" gutterBottom fontWeight={950}>
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
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#c9c9c9' }} />
                </InputAdornment>
              ),
            },
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {loginError && (
          <Typography color="error" align="center">
            {loginError}
          </Typography>
        )}

        <Stack direction="row" justifyContent="center" spacing={1} alignItems="center">
          <Button component={Link} to="/auth/find-id" sx={{ fontWeight: 600, color: '#555555' }}>
            아이디 찾기
          </Button>
          <span style={{ color: '#c9c9c9' }}>|</span>
          <Button
            component={Link}
            to="/auth/find-password"
            sx={{ fontWeight: 600, color: '#555555' }}
          >
            비밀번호 찾기
          </Button>
          <span style={{ color: '#c9c9c9' }}>|</span>
          <Button component={Link} to="/auth/signup" sx={{ fontWeight: 600, color: '#555555' }}>
            회원가입
          </Button>
        </Stack>

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
  );
};

export default UserLogin;