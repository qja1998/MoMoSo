import { useState, useEffect } from 'react';
import { Box, InputLabel, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PrimaryButton } from '../components/common/buttons';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 64px)',
    padding: '0 2rem',
    marginTop: '-64px',
    paddingTop: '64px',
})

const ResetPasswordBox = styled(Box)({
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
})

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from query parameters
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }

        // 비밀번호 길이 유효성 검사
        if (newPassword.length < 8 || newPassword.length > 128) {
            setError('비밀번호는 8자 이상 128자 이하여야 합니다.');
            return;
        }

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/v1/auth/reset-password',
                {
                    email: email,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                }
            );
            alert(response.data.message);
            navigate('/auth/login'); // 비밀번호 변경 성공 후 로그인 페이지로 이동
        } catch (error) {
            console.error('비밀번호 재설정 오류:', error);
            setError(error.response?.data?.detail || '비밀번호 재설정에 실패했습니다.');
        }
    };

    useEffect(() => {
        if (!email) {
            setError('잘못된 접근입니다. 비밀번호 찾기 페이지를 통해 접근해주세요.');
        }
    }, [email]);

    return (
        <ResetPasswordContainer>
            <ResetPasswordBox>
                {/* 헤더 섹션 */}
                <Typography variant="h4" align="center" gutterBottom fontWeight={950}>
                    비밀번호 변경
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                    새로운 비밀번호를 입력해주세요.
                </Typography>

                {/* 에러 메시지 */}
                {error && (
                    <Typography color="error" align="center">
                        {error}
                    </Typography>
                )}

                {/* 새 비밀번호 입력 필드 */}
                <InputLabel htmlFor="newPassword" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
                    새로운 비밀번호
                </InputLabel>
                <TextField
                    id="newPassword"
                    name="newPassword"
                    fullWidth
                    type="password"
                    placeholder="새로운 비밀번호를 입력해주세요"
                    variant="outlined"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                {/* 비밀번호 확인 입력 필드 */}
                <InputLabel htmlFor="confirmPassword" sx={{ mb: -1, fontSize: '1em', fontWeight: 'bold' }}>
                    비밀번호 확인
                </InputLabel>
                <TextField
                    id="confirmPassword"
                    name="confirmPassword"
                    fullWidth
                    type="password"
                    placeholder="비밀번호를 다시 한 번 입력해주세요"
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <PrimaryButton
                    fullWidth
                    onClick={handleResetPassword}
                    disabled={!email}
                >
                    비밀번호 변경
                </PrimaryButton>
            </ResetPasswordBox>
        </ResetPasswordContainer>
    );
}

export default ResetPassword;