import { Link } from 'react-router-dom'

import { Box, Button, Divider, InputLabel, TextField, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { PrimaryButton, SocialLoginButton } from '../components/common/buttons'

const SignUpContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 64px)',
  padding: '2rem',
})

const SignUpBox = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
})

const SignUp = () => {
  const handleSocialLogin = (provider) => {
    // TODO: 소셜 로그인 구현
    console.log(`${provider} 회원가입 시도`)
  }

  return (
    <SignUpContainer>
      <SignUpBox>
        {/* 헤더 섹션 */}
        <Typography variant="h4" align="center" gutterBottom fontWeight={950}>
          회원가입
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          모두 모여 소설을 만드는 공간 모모소
          <br />
          함께 모여 소설을 창작해보세요!
        </Typography>

        {/* 회원가입 폼 섹션 */}
        <InputLabel htmlFor="email" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
          이메일
        </InputLabel>
        <TextField
          id="email"
          name="email"
          fullWidth
          placeholder="이메일을 입력해주세요"
          variant="outlined"
        />
        <InputLabel htmlFor="name" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
          이름
        </InputLabel>
        <TextField
          id="name"
          name="name"
          fullWidth
          placeholder="이름을 입력해주세요"
          variant="outlined"
        />
        <InputLabel htmlFor="penName" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
          필명
        </InputLabel>
        <TextField
          id="penName"
          name="penName"
          fullWidth
          placeholder="필명을 입력해주세요"
          variant="outlined"
        />
        <InputLabel htmlFor="phone" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
          연락처
        </InputLabel>
        <Box sx={{ display: 'flex', gap: 1, mb: -1 }}>
          <TextField
            id="phone"
            name="phone"
            fullWidth
            placeholder="연락처를 입력해주세요"
            variant="outlined"
            inputProps={{
              maxLength: 13,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              let formattedValue = ''
              if (value.length <= 3) {
                formattedValue = value
              } else if (value.length <= 7) {
                formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`
              } else {
                formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`
              }
              e.target.value = formattedValue
            }}
          />
          <PrimaryButton
            backgroundColor="#FFA000"
            hoverBackgroundColor="#FF8F00"
            sx={{
              px: 4,
              whiteSpace: 'nowrap',
            }}
          >
            인증번호 전송
          </PrimaryButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            id="verificationCode"
            name="verificationCode"
            fullWidth
            placeholder="인증번호를 입력해주세요"
            variant="outlined"
          />
          <PrimaryButton
            backgroundColor="#FFA000"
            hoverBackgroundColor="#FF8F00"
            sx={{
              px: 4,
              whiteSpace: 'nowrap',
            }}
          >
            인증번호 확인
          </PrimaryButton>
        </Box>
        <InputLabel htmlFor="password" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
          비밀번호
        </InputLabel>
        <TextField
          id="password"
          name="password"
          fullWidth
          type="password"
          placeholder="비밀번호를 입력해주세요"
          variant="outlined"
          FormHelperTextProps={{
            sx: {
              position: 'absolute',
              top: '-24px',
              right: -14,
            },
          }}
          helperText="8자 이상, 영문 대소문자, 숫자, 특수문자를 포함해주세요"
        />
        <InputLabel htmlFor="passwordConfirm" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
          비밀번호 확인
        </InputLabel>
        <TextField
          id="passwordConfirm"
          name="passwordConfirm"
          fullWidth
          type="password"
          placeholder="비밀번호를 다시 한번 입력해주세요"
          variant="outlined"
        />

        <PrimaryButton 
          fullWidth
          backgroundColor="#FFA000"
          hoverBackgroundColor="#FF8F00"
        >
          회원가입
        </PrimaryButton>

        {/* 소셜 회원가입 섹션 */}
        <Divider sx={{ my: 2 }}>간편 회원가입</Divider>
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

        {/* 로그인 링크 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            이미 계정이 있으신가요?
          </Typography>
          <Button
            component={Link}
            to="/login"
            sx={{ ml: 1, color: '#FFA726', textTransform: 'none' }}
          >
            로그인하기
          </Button>
        </Box>
      </SignUpBox>
    </SignUpContainer>
  )
}

export default SignUp
