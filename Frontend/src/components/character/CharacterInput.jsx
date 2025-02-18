import PropTypes from 'prop-types';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import {
    Box,
    Card,
    Divider,
    TextField,
    Stack,
} from '@mui/material';
import { PrimaryButton } from '../common/buttons';
import { useState } from 'react';
import axios from 'axios'; // Import axios

const CHARACTER_TYPES = {
    protagonist: '주인공',
    supporter: '조력자',
    antagonist: '적대자',
    extra: '기타 인물',
};

const CharacterInput = ({ type, character, onChange, onGenerate, novelPk }) => { // Add novelPk prop
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field) => (event) => {
        onChange({ ...character, [field]: event.target.value });
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            const characterData = {
                name: character.name,
                role: character.type, // Assuming 'type' maps to 'role'
                age: parseInt(character.age, 10), // Convert age to integer
                sex: character.gender === "male", // Convert gender to boolean
                job: character.job,
                profile: character.profile,
            };
    
            console.log("Sending character data:", characterData); // Check the transformed data
    
            const response = await axios.post(
                `http://127.0.0.1:8000/api/v1/novel/character/${novelPk}`,
                characterData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                console.log('Character saved successfully:', response.data);
                alert('캐릭터가 성공적으로 저장되었습니다.');
            } else {
                console.error('Error saving character:', response.status, response.data);
                alert('캐릭터 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error saving character:', error);
            alert('캐릭터 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

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
                <TextField
                    label="캐릭터 유형"
                    value={type}
                    onChange={handleChange('type')}
                    placeholder={"주인공, 조력자, 적대자 등"}
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
                    onClick={handleSaveClick} // Call the save function
                    disabled={isSaving}
                >
                    {isSaving ? '저장 중...' : '저장'}
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
    );
};

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
    novelPk: PropTypes.any, // Add novelPk prop
};

export default CharacterInput;