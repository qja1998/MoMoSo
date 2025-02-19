import axios from 'axios'
import PropTypes from 'prop-types'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [openLoginModal, setOpenLoginModal] = useState(false)
  const [openLogoutModal, setOpenLogoutModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState('')
  const [loginError, setLoginError] = useState('')
  const [googleLoginUrl, setGoogleLoginUrl] = useState('')

  const baseURL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}`
  
  // Axios 기본 설정
  useEffect(() => {
    axios.defaults.withCredentials = true
    axios.defaults.baseURL = baseURL
  }, [])

  // 로그인 상태 확인
  const checkLoginStatus = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/v1/auth/me')
      if (response.data) {
        setIsLoggedIn(true)
        setUser(response.data)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error)
      setIsLoggedIn(false)
      setUser(null)
    }
    setLoading(false)
  }

  // 로그아웃
  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout', {}, { withCredentials: true })
      setIsLoggedIn(false)
      setUser(null)
      setOpenLogoutModal(true)
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const handleLogoutModalClose = () => {
    setOpenLogoutModal(false)
  }

  const showLoginModal = (redirectPath = '/auth/login') => {
    setOpenLoginModal(true)
    setPendingNavigation(redirectPath)
  }

  const handleLoginModalClose = () => {
    setOpenLoginModal(false)
    if (pendingNavigation) {
      navigate(pendingNavigation)
      setPendingNavigation('')
    }
  }

  // 일반 로그인
  const login = async (email, password) => {
    if (!email || !password) {
      setLoginError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }
    setLoginError('')

    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      await axios.post('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      })

      setIsLoggedIn(true)
      await checkLoginStatus()
      navigate(-1)
    } catch (error) {
      console.error('로그인 실패:', error)
      if (error.response?.status === 400) {
        setLoginError(error.response.data.detail)
      } else {
        setLoginError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
      }
      throw error
    }
  }

  // 구글 로그인 URL 가져오기
  useEffect(() => {
    const baseURL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}`
    axios
      .get(`${baseURL}/api/v1/oauth/google/login`)
      .then((response) => {
        setGoogleLoginUrl(response.data.login_url)
      })
      .catch((error) => {
        console.error('구글 로그인 URL 가져오기 실패:', error)
      })
  }, [])

  // 구글 로그인 메시지 핸들러
  const handleGoogleLoginMessage = useCallback(
    (event) => {
      if (!event.origin.includes('localhost')) return

      if (event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        setIsLoggedIn(true)
        checkLoginStatus()
        navigate('/')
        window.removeEventListener('message', handleGoogleLoginMessage)
      }
    },
    [navigate]
  )

  // 구글 로그인 팝업 처리
  const handleSocialLogin = useCallback(() => {
    if (googleLoginUrl) {
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      const popup = window.open(
        googleLoginUrl,
        'googleLogin',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      )

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.')
      }

      window.addEventListener('message', handleGoogleLoginMessage)
    } else {
      console.error('로그인 URL을 가져오지 못했습니다.')
    }
  }, [googleLoginUrl, handleGoogleLoginMessage])

  useEffect(() => {
    checkLoginStatus()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        loginError,
        login,
        logout,
        showLoginModal,
        handleSocialLogin,
      }}
    >
      {children}
      <Dialog
        open={openLoginModal}
        onClose={handleLoginModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">로그인이 필요한 서비스입니다.</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            확인 버튼 또는 엔터 키를 누르시면 로그인 페이지로 이동합니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginModalClose} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openLogoutModal}
        onClose={handleLogoutModalClose}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">로그아웃</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">성공적으로 로그아웃되었습니다.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutModalClose} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useAuth = () => useContext(AuthContext)
