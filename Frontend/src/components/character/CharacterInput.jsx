import PropTypes from 'prop-types'

import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Card,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { PrimaryButton } from '../common/buttons'

const CHARACTER_TYPES = {
  protagonist: '주인공',
  supporter: '조력자',
  antagonist: '적대자',
  extra: '기타 인물',
}

const CharacterInput = ({ type, character, onChange, onGenerate }) => {
  const handleChange = (field) => (event) => {
    onChange({ ...character, [field]: event.target.value })
  }

  return (
    <Card
      sx={{
        Width: 350,
        border: `1px solid hsla(0, 0%, 77%)`,
        backgroundColor: '#white',
        borderRadius: 2,
        p: 3,
        flex: '0 0 auto',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h3" sx={{ fontSize: '1.2rem', fontWeight: 700, flex: 1 }}>
          {CHARACTER_TYPES[type]}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>캐릭터 유형</InputLabel>
          <Select
            value={type}
            label="캐릭터 유형"
            onChange={handleChange('type')}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          >
            {Object.entries(CHARACTER_TYPES).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="이름"
            value={character.name}
            onChange={handleChange('name')}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <TextField
            label="성별"
            value={character.gender}
            onChange={handleChange('gender')}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="나이"
            value={character.age}
            onChange={handleChange('age')}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
          <TextField
            label="직업"
            value={character.job}
            onChange={handleChange('job')}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
        <TextField
          label="프로필"
          value={character.profile}
          onChange={handleChange('profile')}
          multiline
          rows={4}
          fullWidth
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <PrimaryButton
          startIcon={<RefreshIcon />}
          backgroundColor="#1c1c1c"
          hoverBackgroundColor="#444444"
          onClick={onGenerate}
          sx={{ py: 0.5 }}
        >
          재생성
        </PrimaryButton>
        <PrimaryButton
          startIcon={<SaveIcon />}
          backgroundColor="#111111"
          hoverBackgroundColor="#404040"
          sx={{ py: 0.5 }}
        >
          저장
        </PrimaryButton>
        <PrimaryButton
          startIcon={<DeleteIcon />}
          backgroundColor="#D32F2F"
          hoverBackgroundColor="#A82525"
          sx={{ py: 0.5 }}
        >
          삭제
        </PrimaryButton>
      </Stack>
    </Card>
  )
}

CharacterInput.propTypes = {
  type: PropTypes.string.isRequired,
  character: PropTypes.shape({
    name: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    age: PropTypes.string.isRequired,
    job: PropTypes.string.isRequired,
    profile: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
}

export default CharacterInput
