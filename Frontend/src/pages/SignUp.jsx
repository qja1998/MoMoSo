import { useEffect, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import CheckIcon from '@mui/icons-material/Check'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

import { PrimaryButton } from '../components/common/buttons'

import axios from 'axios'

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

const SignUp = () => {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({})
  const [isVerified, setIsVerified] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    penName: '',
    phone: '',
    verificationCode: '',
    password: '',
    passwordConfirm: '',
  })

  const [passwordFieldFocused, setPasswordFieldFocused] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    combinationValid: false,
    noRepeatValid: false,
  })
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    let formattedValue = ''
    if (value.length <= 3) {
      formattedValue = value
    } else if (value.length <= 7) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`
    } else {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`
    }
    setFormData((prev) => ({
      ...prev,
      phone: formattedValue,
    }))
  }

  const handleVerificationCodeSend = async () => {
    // TODO: 인증번호 전송 로직 구현
    try {
      console.log("인증번호 전송 요청:", formData.phone);
      const response = await axios.post("http://127.0.0.1:8000/api/v1/auth/send-sms", null, { // ✅ phone을 query parameter로 전달
        params: { phone: formData.phone },
      });
  
      alert(response.data.message); // "Verification code sent successfully" 출력
    } catch (error) {
      console.error("인증번호 전송 오류:", error);
      setErrors({ phone: error.response?.data?.detail || "인증번호 전송에 실패했습니다." });
    }
  };

  const handleVerificationCodeCheck = async () => {
    // TODO: 인증번호 확인 로직 구현
    try {
      console.log("인증번호 확인 요청:", formData.phone, formData.verificationCode);
      const response = await axios.post("http://127.0.0.1:8000/api/v1/auth/verify-sms-code", null, { // ✅ phone과 code를 query parameter로 전달
        params: {
          phone: formData.phone,
          code: formData.verificationCode,
        },
      });
  
      setIsPhoneVerified(true);
      alert(response.data.message); // "Phone number verified successfully" 출력
    } catch (error) {
      console.error("인증번호 확인 오류:", error);
      setErrors({ verificationCode: error.response?.data?.detail || "인증번호가 올바르지 않습니다." });
    }
  };

  const handleSignUp = async () => {
    console.log("회원가입 버튼 클릭됨");
  console.log("회원가입 요청 데이터:", formData); // 요청 데이터 확인

  try {
    const requestData = {
      email: formData.email || "", // ✅ 필수 항목
      name: formData.name || "",
      nickname: formData.penName || "", // ✅ "nickname"으로 변경
      phone: formData.phone || "",
      password: formData.password || "",
      confirm_password: formData.passwordConfirm || "", // ✅ "confirm_password"으로 변경
    };

    const signUpResponse = await axios.post(
      "http://127.0.0.1:8000/api/v1/auth/signup",
      requestData
    );

    console.log("회원가입 성공:", signUpResponse.data);

    // 회원가입 성공 후 자동 로그인
    // ✅ 로그인 요청을 `form-data` 형식으로 변경
    const loginFormData = new URLSearchParams();
    loginFormData.append("username", formData.email);
    loginFormData.append("password", formData.password);

    const loginResponse = await axios.post(
      "http://127.0.0.1:8000/api/v1/auth/login", // ✅ FastAPI에서 기대하는 로그인 방식
      loginFormData,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, // ✅ 필수 헤더 추가
        withCredentials: true, // ✅ 쿠키 저장 활성화
      }
    );

    console.log("로그인 성공:", loginResponse.data);
    navigate("/"); // 메인 페이지로 이동
  } catch (error) {
    console.error("회원가입 오류:", error);

    if (error.response && error.response.data) {
      setErrors(error.response.data);
    } else {
      setErrors({ general: "회원가입 중 오류가 발생했습니다." });
    }
  }
};
  

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
    if (formData.password) {
      setPasswordValidation({
        combinationValid: checkPasswordCombination(formData.password),
        noRepeatValid: checkNoRepeatOrSequence(formData.password),
      })
    } else {
      setPasswordValidation({ combinationValid: false, noRepeatValid: false })
    }
  }, [formData.password])

  const isPasswordMismatch =
    formData.passwordConfirm && formData.password !== formData.passwordConfirm

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ mt: 4, width: '40%', mx: 'auto' }}
    >
      {/* 헤더 섹션 */}
      <Typography variant="h4" align="center" fontWeight={950}>
        회원가입
      </Typography>
      <Typography variant="body1" align="center" sx={{ pb: 2 }}>
        모두 모여 소설을 만드는 공간 모모소
        <br />
        함께 모여 소설을 창작해보세요!
      </Typography>

      {/* 회원가입 폼 섹션 */}
      <TextField
        id="email"
        name="email"
        fullWidth
        label="이메일"
        placeholder="이메일을 입력해주세요"
        variant="outlined"
        value={formData.email}
        onChange={handleInputChange}
        error={!!errors.email}
        helperText={errors.email}
        slotProps={{
          inputLabel: {
            shrink: true,
            sx: { fontWeight: 'bold' },
          },
        }}
      />
      <TextField
        id="name"
        name="name"
        fullWidth
        label="이름"
        placeholder="이름을 입력해주세요"
        variant="outlined"
        value={formData.name}
        onChange={handleInputChange}
        error={!!errors.name}
        helperText={errors.name}
        slotProps={{
          inputLabel: {
            shrink: true,
            sx: { fontWeight: 'bold' },
          },
        }}
      />
      <TextField
        id="penName"
        name="penName"
        fullWidth
        label="필명"
        placeholder="필명을 입력해주세요"
        variant="outlined"
        value={formData.penName}
        onChange={handleInputChange}
        slotProps={{
          inputLabel: {
            shrink: true,
            sx: { fontWeight: 'bold' },
          },
        }}
      />

      {/* 연락처 인증 섹션 */}
      <Stack spacing={2} sx={{ width: '100%' }}>
        <Stack direction="row" spacing={0}>
          <TextField
            id="phone"
            name="phone"
            fullWidth
            label="연락처"
            placeholder="연락처를 입력해주세요"
            variant="outlined"
            value={formData.phone}
            onChange={handlePhoneChange}
            error={!!errors.phone}
            helperText={errors.phone}
            disabled={isPhoneVerified}
            slotProps={{
              inputLabel: {
                shrink: true,
                sx: { fontWeight: 'bold' },
              },
              input: {
                maxLength: 13,
                inputMode: 'numeric',
                pattern: '[0-9]*',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px 0 0 4px',
              },
            }}
          />
          <PrimaryButton
            backgroundColor="#FFA000"
            hoverBackgroundColor="#FF8F00"
            onClick={handleVerificationCodeSend}
            disabled={!formData.phone}
            sx={{
              height: '56px',
              borderRadius: '0 4px 4px 0',
              px: 4,
              whiteSpace: 'nowrap',
              boxShadow: 'none',
            }}
          >
            {isPhoneVerified ? "인증완료" : "인증번호 전송"}
          </PrimaryButton>
        </Stack>
        <Stack direction="row" spacing={0}>
          <TextField
            id="verificationCode"
            name="verificationCode"
            fullWidth
            label="인증번호"
            placeholder="인증번호를 입력해주세요"
            variant="outlined"
            value={formData.verificationCode}
            onChange={handleInputChange}
            error={!!errors.verificationCode}
            helperText={errors.verificationCode}
            disabled={isPhoneVerified}
            slotProps={{
              inputLabel: {
                shrink: true,
                sx: { fontWeight: 'bold' },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px 0 0 4px',
              },
            }}
          />
          <PrimaryButton
            backgroundColor="#FFA000"
            hoverBackgroundColor="#FF8F00"
            onClick={handleVerificationCodeCheck}
            disabled={!formData.verificationCode}
            sx={{
              height: '56px',
              borderRadius: '0 4px 4px 0',
              px: 4,
              whiteSpace: 'nowrap',
              boxShadow: 'none',
            }}
          >
            인증번호 확인
          </PrimaryButton>
        </Stack>
      </Stack>

      {/* 비밀번호 섹션 */}
      <Stack spacing={2} sx={{ width: '100%' }}>
        <TextField
          id="password"
          name="password"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요"
          variant="outlined"
          value={formData.password}
          onChange={handleInputChange}
          error={!!errors.password}
          helperText={errors.password}
          onFocus={() => setPasswordFieldFocused(true)}
          slotProps={{
            inputLabel: {
              shrink: true,
              sx: { fontWeight: 'bold' },
            },
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

        <TextField
          id="passwordConfirm"
          name="passwordConfirm"
          fullWidth
          type={showPasswordConfirm ? 'text' : 'password'}
          label="비밀번호 확인"
          placeholder="비밀번호를 다시 한번 입력해주세요"
          variant="outlined"
          value={formData.passwordConfirm}
          onChange={handleInputChange}
          onBlur={() => setConfirmPasswordTouched(true)}
          error={confirmPasswordTouched && isPasswordMismatch}
          helperText={
            confirmPasswordTouched && isPasswordMismatch ? '비밀번호가 일치하지 않습니다.' : ' '
          }
          slotProps={{
            inputLabel: {
              shrink: true,
              sx: { fontWeight: 'bold' },
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                    {showPasswordConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      <PrimaryButton
        fullWidth
        backgroundColor="#FFA000"
        hoverBackgroundColor="#FF8F00"
        onClick={handleSignUp}
        disabled={
          !formData.email ||
          !formData.name ||
          !formData.penName ||
          !formData.phone ||
          !formData.verificationCode ||
          !formData.password ||
          !formData.passwordConfirm ||
          formData.password !== formData.passwordConfirm ||
          !passwordValidation.combinationValid ||
          !passwordValidation.noRepeatValid
        }
      >
        회원가입
      </PrimaryButton>

      {/* 로그인 링크 */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          이미 계정이 있으신가요?
        </Typography>
        <Button component={Link} to="/login" sx={{ color: '#FFA726', textTransform: 'none' }}>
          로그인하기
        </Button>
      </Stack>
    </Stack>
  )
}

export default SignUp
