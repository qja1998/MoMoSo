import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CheckIcon from '@mui/icons-material/Check'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { PrimaryButton } from '../components/common/buttons'
import axios from 'axios'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': { width: '100%', maxWidth: 500, padding: theme.spacing(2) },
}))

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FFB347',
  color: '#FFFFFF',
  '&:hover': { backgroundColor: '#FFA022' },
  height: '48px',
  fontSize: theme.typography.fontSize * 1.1,
}))

const UpdateUserContainer = ({ children }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 'calc(100vh - 64px)',
      padding: '0 2rem',
      marginTop: '-64px',
      paddingTop: '64px',
    }}
  >
    {children}
  </Box>
)

const UpdateUserBox = ({ children }) => (
  <Box sx={{ width: "100%", maxWidth: "500px", margin: "0 auto", padding: 4 }}>
    {children}
  </Box>
)

const InfoItem = ({ children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    {children}
  </Box>
)

const UserChangeInfo = () => {
  const BACKEND_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}`
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [updateError, setUpdateError] = useState('')

  const [profileData, setProfileData] = useState({
    email: "",
    name: "",
    nickname: "",
    phone: "",
    user_img: "",
  })

  const [verificationCode, setVerificationCode] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

  // 사용자 정보 조회
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(BACKEND_URL+'/api/v1/users/logged-in', {
        withCredentials: true
      })
      setProfileData(response.data)
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error)
      navigate('/auth/login')
    }
  }

  // 비밀번호 확인
  const handlePasswordSubmit = async () => {
    try {
      await axios.post(
        BACKEND_URL+'/api/v1/auth/verify-password',
        { password },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      setIsAuthenticated(true)
      setShowPasswordModal(false)
      setPasswordError('')
      await fetchUserInfo() // 비밀번호 인증 성공 후 사용자 정보 조회
    } catch (error) {
      setPasswordError(error.response?.status === 400 
        ? '비밀번호를 다시 확인해주세요' 
        : '오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3')
    setProfileData(prev => ({ ...prev, phone: value }))
  }

  // 정보 수정
  const handleUpdateInfo = async () => {
    try {
      await axios.put(
        BACKEND_URL+'/api/v1/users/',
        {
          nickname: profileData.nickname,
          phone: profileData.phone,
        },
        {
          withCredentials: true,
        }
      )
      alert('회원정보가 성공적으로 수정되었습니다.')
      navigate('/')
    } catch (error) {
      setUpdateError(error.response?.data?.detail || '회원정보 수정에 실패했습니다.')
    }
  }

  // 비밀번호 변경 페이지로 이동
  const handleNavigateToResetPassword = () => {
    navigate(`/auth/reset-password?email=${profileData.email}`)
  }

  return (
    <>
      <StyledDialog open={showPasswordModal} onClose={() => {}}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
          비밀번호 확인
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            안전한 개인정보보호를 위해 비밀번호를 입력해 주세요.
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호를 입력해 주세요."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <StyledButton 
            fullWidth 
            variant="contained" 
            onClick={handlePasswordSubmit}
            disabled={!password}
          >
            확인
          </StyledButton>
        </DialogContent>
      </StyledDialog>

      {isAuthenticated && (
        <UpdateUserContainer>
          <UpdateUserBox>
            <Typography variant="h4" align="center" gutterBottom fontWeight={950} marginBottom={"3rem"}>
              회원 정보 수정
            </Typography>

            {updateError && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {updateError}
              </Typography>
            )}

            <Stack spacing={3}>
              <InfoItem>
                <Typography sx={{ width: "60px", flexShrink: 0, fontWeight: 'bold' }}>
                  아이디
                </Typography>
                <Typography>{profileData.email}</Typography>
              </InfoItem>

              <InfoItem>
                <Typography sx={{ width: "60px", flexShrink: 0, fontWeight: 'bold' }}>
                  이름
                </Typography>
                <Typography>{profileData.name}</Typography>
              </InfoItem>

              <InfoItem>
                <Typography sx={{ width: "60px", flexShrink: 0, fontWeight: 'bold' }}>
                  필명
                </Typography>
                <TextField
                  fullWidth
                  placeholder="필명을 입력해주세요"
                  value={profileData.nickname}
                  onChange={(e) => setProfileData(prev => ({ ...prev, nickname: e.target.value }))}
                />
              </InfoItem>

              <InfoItem>
                <Typography sx={{ width: "60px", flexShrink: 0, fontWeight: 'bold' }}>
                  연락처
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      id="phone"
                      name="phone"
                      fullWidth
                      placeholder="연락처를 입력해주세요"
                      variant="outlined"
                      value={profileData.phone}
                      onChange={handlePhoneChange}
                      inputProps={{
                        maxLength: 13,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                      }}
                    />
                    <PrimaryButton
                      disabled={isPhoneVerified}
                      sx={{
                        px: 2,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      인증번호 전송
                    </PrimaryButton>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      id="verificationCode"
                      name="verificationCode"
                      fullWidth
                      placeholder="인증번호를 입력해주세요"
                      variant="outlined"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      disabled={isPhoneVerified}
                    />
                    <PrimaryButton
                      disabled={isPhoneVerified}
                      sx={{
                        px: 2,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      인증번호 확인
                    </PrimaryButton>
                  </Box>
                </Box>
              </InfoItem>

              <Stack spacing={2} sx={{ mt: 2 }}>
                <StyledButton
                  variant="contained"
                  fullWidth
                  onClick={handleUpdateInfo}
                  sx={{
                    backgroundColor: "#FFB347",
                    "&:hover": { backgroundColor: "#FFA022" },
                  }}
                >
                  정보 수정하기
                </StyledButton>

                <StyledButton
                  variant="outlined"
                  fullWidth
                  onClick={handleNavigateToResetPassword}
                  sx={{
                    backgroundColor: "transparent",
                    color: "#FFB347",
                    borderColor: "#FFB347",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "#FFA022",
                      borderColor: "#FFA022",
                    },
                  }}
                >
                  비밀번호 변경
                </StyledButton>
              </Stack>
            </Stack>
          </UpdateUserBox>
        </UpdateUserContainer>
      )}
    </>
  )
}

export default UserChangeInfo