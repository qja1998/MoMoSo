import { Box, InputLabel, TextField, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

import { PrimaryButton } from '../components/common/buttons'

const FindIdContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 'calc(100vh - 64px)',
  padding: '0 2rem',
  marginTop: '-64px',
  paddingTop: '64px',
})

const FindIdBox = styled(Box)({
  width: '100%',
  maxWidth: '400px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
})

const FindId = () => {
  return (
    <FindIdContainer>
      <FindIdBox>
        {/* 헤더 섹션 */}
        <Typography variant="h4" align="center" gutterBottom fontWeight={950}>
          아이디 찾기
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          가입 시 입력한 이름과 연락처를 입력해주세요.
        </Typography>

        {/* 아이디 찾기 폼 섹션 */}
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
            sx={{
              px: 4,
              whiteSpace: 'nowrap',
            }}
          >
            인증번호 확인
          </PrimaryButton>
        </Box>

        <PrimaryButton fullWidth sx={{ mt: 2 }}>
          아이디 찾기
        </PrimaryButton>
      </FindIdBox>
    </FindIdContainer>
  )
}

export default FindId
