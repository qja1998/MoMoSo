import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '/src/hooks/useAuth';

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  useEffect(() => {
    axios.defaults.withCredentials = true;

    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/auth/me');
        if (response.status === 200) {
          console.log('소셜 로그인 성공 (쿠키 확인):', response.data);
          setIsLoggedIn(true);
          navigate('/');
        } else {
          console.log('소셜 로그인 실패 (쿠키 없음)');
          setIsLoggedIn(false);
          navigate('/auth/login'); // 로그인 페이지로 다시 이동
        }
      } catch (error) {
        console.error('로그인 상태 확인 실패:', error);
        setIsLoggedIn(false);
        navigate('/auth/login'); // 로그인 페이지로 다시 이동
      }
    };

    checkLoginStatus();
  }, [navigate, setIsLoggedIn]);

  return (
    <div>
      <h1>로그인 처리 중...</h1>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
};

export default LoginSuccess;