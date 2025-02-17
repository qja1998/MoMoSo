import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // 여기에 선언
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Axios 기본 설정
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.defaults.baseURL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}:${import.meta.env.VITE_BACKEND_PORT}`;
  }, []);

  // 로그인 상태 확인
  const checkLoginStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/auth/me'); // 쿠키 자동 포함
      setIsLoggedIn(!!response.data);
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
      setIsLoggedIn(false);
    }
    setLoading(false);
  };

  // 로그아웃
  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout', {}, { withCredentials: true }); // 쿠키 포함 요청
      setIsLoggedIn(false); // 상태 업데이트
      alert('성공적으로 로그아웃되었습니다.')
      navigate('/auth/login')
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
