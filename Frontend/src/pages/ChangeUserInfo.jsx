import { useEffect, useState } from 'react'

import CheckIcon from '@mui/icons-material/Check'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}))

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

const PasswordGuideItem = styled(Box)(({ theme, isvalid, focused }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '& .MuiTypography-root': {
    color: !focused
      ? theme.palette.text.secondary
      : isvalid
        ? theme.palette.success.main
        : theme.palette.error.main,
    fontSize: '0.875rem',
    fontWeight: isvalid && focused ? 600 : 400,
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
    color: !focused
      ? theme.palette.text.secondary
      : isvalid
        ? theme.palette.success.main
        : theme.palette.error.main,
  },
}))

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& .MuiTypography-label': { width: 200, fontWeight: 'bold' },
}))

const ChangeUserInfo = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordFieldFocused, setPasswordFieldFocused] = useState(false)
  const [profileData] = useState({
    username: 'UserName',
    email: 'UserEmail@example.com',
    name: '김싸피',
    birth: '2000.01.01',
    phone: '010-1234-5678',
  })
  const [passwordValidation, setPasswordValidation] = useState({
    combinationValid: false,
    noRepeatValid: false,
  })
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)

  const handlePasswordSubmit = () => {
    // TODO: 비밀번호 인증 API 연동
    setIsAuthenticated(true)
    setShowPasswordModal(false)
  }

  const handlePasswordChange = () => {
    // TODO: 비밀번호 변경 API 연동
    setNewPassword('')
    setConfirmPassword('')
  }

  // 비밀번호 조합 조건 검사
  const checkPasswordCombination = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const combinationCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length

    return (
      (combinationCount >= 3 && password.length >= 8) ||
      (combinationCount >= 2 && password.length >= 10)
    )
  }

  // 연속/중복 문자 검사
  const checkNoRepeatOrSequence = (password) => {
    if (!password) return false
    if (/\s/.test(password)) return false // 공백 검사

    // 3자 이상 연속 문자 검사
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password[i]
      const char2 = password[i + 1]
      const char3 = password[i + 2]

      // 동일 문자 3번 연속
      if (char1 === char2 && char2 === char3) return false

      // 연속된 문자/숫자 (오름차순/내림차순)
      if (
        (char1.charCodeAt(0) + 1 === char2.charCodeAt(0) &&
          char2.charCodeAt(0) + 1 === char3.charCodeAt(0)) ||
        (char1.charCodeAt(0) - 1 === char2.charCodeAt(0) &&
          char2.charCodeAt(0) - 1 === char3.charCodeAt(0))
      ) {
        return false
      }
    }

    return true
  }

  useEffect(() => {
    if (newPassword) {
      setPasswordValidation({
        combinationValid: checkPasswordCombination(newPassword),
        noRepeatValid: checkNoRepeatOrSequence(newPassword),
      })
    } else {
      setPasswordValidation({ combinationValid: false, noRepeatValid: false })
    }
  }, [newPassword])

  const isPasswordMismatch = confirmPassword && newPassword !== confirmPassword

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
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 2 }}
          />
          <StyledButton fullWidth variant="contained" onClick={handlePasswordSubmit}>
            확인
          </StyledButton>
        </DialogContent>
      </StyledDialog>

      {isAuthenticated && (
        <StyledContainer maxWidth="lg">
          <Paper sx={{ width: '100%', bgcolor: '#FFFFFF', p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
              회원정보 수정
            </Typography>
            <Stack spacing={3}>
              <InfoItem>
                <Typography className="MuiTypography-label">아이디</Typography>
                <Typography>{profileData.username}</Typography>
              </InfoItem>

              <Stack spacing={2}>
                <Typography className="MuiTypography-label">새 비밀번호</Typography>
                <TextField
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 입력해 주세요."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setPasswordFieldFocused(true)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Box>
                  <PasswordGuideItem
                    isvalid={passwordValidation.combinationValid}
                    focused={passwordFieldFocused}
                  >
                    <CheckIcon />
                    <Typography>
                      영문, 숫자, 특수문자 3가지 조합 8자리 이상 또는 2가지 조합 10자리 이상
                    </Typography>
                  </PasswordGuideItem>
                  <PasswordGuideItem
                    isvalid={passwordValidation.noRepeatValid}
                    focused={passwordFieldFocused}
                  >
                    <CheckIcon />
                    <Typography>공백 및 3자 이상의 연속 또는 중복 문자는 사용 불가</Typography>
                  </PasswordGuideItem>
                </Box>

                <Typography className="MuiTypography-label">새 비밀번호 확인</Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="새 비밀번호를 한 번 더 입력해 주세요."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  error={confirmPasswordTouched && isPasswordMismatch}
                  helperText={
                    confirmPasswordTouched && isPasswordMismatch
                      ? '새 비밀번호가 일치하지 않습니다.'
                      : ' '
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Box>
                  <StyledButton
                    variant="contained"
                    onClick={handlePasswordChange}
                    disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                  >
                    비밀번호 변경
                  </StyledButton>
                </Box>
              </Stack>

              <InfoItem>
                <Typography className="MuiTypography-label">이름</Typography>
                <Typography>{profileData.name}</Typography>
              </InfoItem>

              <InfoItem>
                <Typography className="MuiTypography-label">생년월일/성별</Typography>
                <Typography>{profileData.birth} / 남</Typography>
              </InfoItem>

              <InfoItem>
                <Typography className="MuiTypography-label">이메일</Typography>
                <Typography>{profileData.email}</Typography>
                <StyledButton
                  variant="outlined"
                  size="small"
                  sx={{
                    ml: 2,
                    height: '32px',
                    backgroundColor: 'transparent',
                    color: '#FFB347',
                    borderColor: '#FFB347',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#FFA022',
                      borderColor: '#FFA022',
                    },
                  }}
                >
                  변경
                </StyledButton>
              </InfoItem>

              <InfoItem>
                <Typography className="MuiTypography-label">휴대폰번호</Typography>
                <Typography>{profileData.phone}</Typography>
                <StyledButton
                  variant="outlined"
                  size="small"
                  sx={{
                    ml: 2,
                    height: '32px',
                    backgroundColor: 'transparent',
                    color: '#FFB347',
                    borderColor: '#FFB347',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#FFA022',
                      borderColor: '#FFA022',
                    },
                  }}
                >
                  변경
                </StyledButton>
              </InfoItem>
            </Stack>
          </Paper>
        </StyledContainer>
      )}
    </>
  )
}

export default ChangeUserInfo
