import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from '@emotion/styled';
import dayjs from 'dayjs';

import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import ImageIcon from '@mui/icons-material/Image';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

import coverPlaceholder from '/src/assets/placeholder/cover-image-placeholder.png';

const NovelInfo = styled(Paper)({
padding: '24px',
display: 'flex',
gap: '24px',
marginBottom: '24px',
borderRadius: '16px',
backgroundColor: '#ffffff',
boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
'&.MuiTableCell-head': {
backgroundColor: theme.palette.grey[100],
fontWeight: 700,
},
}));

const DiscussionBadge = styled(Box)(({ status }) => ({
display: 'inline-block',
padding: '4px 12px',
borderRadius: '16px',
fontSize: '14px',
fontWeight: 'bold',
backgroundColor: status === '2화 토론' ? '#E3F2FD' : '#E8F5E9',
color: status === '2화 토론' ? '#1976D2' : '#2E7D32',
marginBottom: '8px',
}));

const NovelEpisodeList = () => {
const { novelId } = useParams();
const [novelData, setNovelData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const navigate = useNavigate();

useEffect(() => {
    const fetchNovelDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/v1/novel/${novelId}/detail`);
            setNovelData(response.data);
        } catch (err) {
            setError(err.message || '소설 정보를 불러오는 데 실패했습니다.');
            console.error("Error fetching novel details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (novelId) {
        fetchNovelDetails();
    } else {
        setError('Novel ID가 유효하지 않습니다.');
        setLoading(false);
    }
}, [novelId]);

// 데이터 구조에 맞춰 discussion, episode, novel_info 추출
const discussions = useMemo(() => {
    return novelData?.discussion || [];
}, [novelData]);

const episodes = useMemo(() => {
    return novelData?.episode || [];
}, [novelData]);

const novelInfo = useMemo(() => {
    return novelData?.novel_info?.[0] || {}; // novel_info는 배열의 첫 번째 요소로 접근
}, [novelData]);

// 댓글 목록을 novelData에서 추출
const comments = useMemo(() => {
    return novelData?.comment || []; // `comment` 키에 댓글 배열이 있다고 가정
}, [novelData]);

// 총 조회수/좋아요 계산을 useMemo로 최적화
const { totalViews, totalLikes } = useMemo(() => {
    const views = episodes ? episodes.reduce((sum, ep) => sum + (ep.views || 0), 0) : 0;
    const likes = novelInfo?.likes || 0; // novelInfo에서 좋아요 수를 가져옴, 없으면 0
    return { totalViews: views, totalLikes: likes };
}, [episodes, novelInfo]);

// 토론방 생성 폼 초기값
const initialDiscussionForm = {
    type: 'default',
    dateTime: null,
    topic: '',
    maxParticipants: 5,
};

const [openModal, setOpenModal] = useState(false);
const [discussionForm, setDiscussionForm] = useState(initialDiscussionForm);

// 모달 핸들러 함수들
const handleOpenModal = useCallback(() => setOpenModal(true), []);
const handleCloseModal = useCallback(() => {
    setOpenModal(false);
    setDiscussionForm(initialDiscussionForm);
}, []);

const handleCreateDiscussion = useCallback(() => {
    if (!discussionForm.dateTime || !discussionForm.topic || !discussionForm.maxParticipants) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

    // TODO: 토론방 생성 로직 구현 (API 연동)
    console.log('Create discussion:', discussionForm);
    handleCloseModal();
}, [discussionForm]);

const [commentInput, setCommentInput] = useState('');

// 댓글 좋아요/싫어요 핸들러
const handleLike = useCallback((commentPk) => {
    // TODO: 좋아요 기능 구현
    console.log('Like comment:', commentPk);
}, []);

const handleDislike = useCallback((commentPk) => {
    // TODO: 싫어요 기능 구현
    console.log('Dislike comment:', commentPk);
}, []);

// 댓글 작성 핸들러
const handleSubmitComment = useCallback(() => {
    if (!commentInput.trim()) return;

    // TODO: 댓글 작성 로직 구현 (API 연동)
    console.log('Submit comment:', commentInput);
    setCommentInput('');
}, [commentInput]);

// 댓글 삭제 핸들러
const handleDeleteComment = useCallback((commentPk) => {
    // TODO: 댓글 삭제 기능 구현
    console.log('Delete comment:', commentPk);
}, []);

const handleEpisodeClick = (ep_pk) => {
    const selectedEpisode = episodes.find(episode => episode.ep_pk === ep_pk);
    if (selectedEpisode) {
        // 모든 에피소드 데이터와 선택된 에피소드 데이터를 함께 전달
        navigate(`/novel/${novelId}/${ep_pk}`, { state: { episode: selectedEpisode, episodeList: episodes } });
    } else {
        console.error('Episode not found:', ep_pk);
    }
};


if (loading) {
    return <Typography>Loading...</Typography>;
}

if (error) {
    return <Typography color="error">Error: {error}</Typography>;
}




return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <NovelInfo>
            {/* 표지 섹션 */}
            <Box
                component="img"
                src={
                    novelInfo.novel_img === "static_url"
                      ? coverPlaceholder : `${novelInfo.novel_img}`
                    }
                alt="소설 표지"
                sx={{
                    width: 200,
                    height: 267,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    flex: 2,
                }}
            />

            {/* 소설 정보 섹션 */}
            <Stack direction="column" sx={{ flex: 4, justifyContent: 'space-between' }}>
                <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 950 }}>
                    {novelInfo.title || '제목 없음'}
                </Typography>
                <Stack direction="column" spacing={1}>
                    <Typography variant="body1" color="text.secondary">
                        {novelInfo.user_pk || '작가 정보 없음'}
                    </Typography>
                    <Typography variant="body1">
                        {novelInfo.summary || '시놉시스 없음'}
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <VisibilityIcon color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {totalViews.toLocaleString()}
                            </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <FavoriteIcon color="error" />
                            <Typography variant="body2" color="text.secondary">
                                {totalLikes.toLocaleString()}
                            </Typography>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>

            {/* 토론방 섹션 */}
            <Stack sx={{ flex: 4, p: 2, gap: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                    토론방
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                    sx={{
                        bgcolor: '#FFA000',
                        '&:hover': { bgcolor: '#FF8F00' },
                    }}
                >
                    토론 생성
                </Button>

                {/* 토론 목록 */}
                <Stack spacing={2}>
                    {discussions.map((discussion) => (
                        <Paper
                            key={discussion.discussion_pk}
                            elevation={1}
                            sx={{
                                p: 2,
                                borderRadius: 1,
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'grey.50' },
                            }}
                        >
                            <DiscussionBadge status={discussion.ep_pk ? '2화 토론' : '전체 토론'}>
                                {discussion.ep_pk ? '2화 토론' : '전체 토론'}
                            </DiscussionBadge>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                {discussion.topic}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {dayjs(discussion.start_time).format('YYYY.MM.DD HH:mm')}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    참여 인원 0/{discussion.max_participants}명 {/* TODO: 참여 인원 수 API 연동 */}
                                </Typography>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
            </Stack>

            {/* 토론방 생성 모달 */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>토론방 생성</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>토론 유형</InputLabel>
                            <Select
                                value={discussionForm.type}
                                label="토론 유형"
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                onChange={(e) => setDiscussionForm({ ...discussionForm, type: e.target.value })}
                            >
                                <MenuItem value="default">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <MenuBookIcon />
                                        <Box>
                                            <Typography>전체 작품 토론</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                작품 전체에 대해 토론
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </MenuItem>
                                <MenuItem value="episode">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <MenuBookIcon />
                                        <Box>
                                            <Typography>회차별 토론</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                특정 회차에 대해 토론
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    value={discussionForm.dateTime}
                                    onChange={(newValue) =>
                                        setDiscussionForm({ ...discussionForm, dateTime: newValue })
                                    }
                                    minDateTime={dayjs()}
                                    format="YYYY/MM/DD HH:mm"
                                    ampm={false}
                                    slotProps={{
                                        inputLabel: {
                                            shrink: true,
                                        },
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                            label: '토론 일시',
                                            variant: 'outlined',
                                        },
                                    }}
                                />
                            </LocalizationProvider>
                        </FormControl>

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="토론 주제"
                            placeholder="토론 주제를 입력하세요."
                            value={discussionForm.topic}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            onChange={(e) => setDiscussionForm({ ...discussionForm, topic: e.target.value })}
                        />

                        <FormControl fullWidth>
                            <TextField
                                value={discussionForm.maxParticipants}
                                label="최대 참여 인원"
                                type="number"
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                onChange={(e) =>
                                    setDiscussionForm({ ...discussionForm, maxParticipants: e.target.value })
                                }
                            />
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseModal} variant="outlined">
                        취소
                    </Button>
                    <Button
                        onClick={handleCreateDiscussion}
                        variant="contained"
                        sx={{
                            backgroundColor: '#FFA000',
                            '&:hover': { bgcolor: '#FF8F00' },
                        }}
                    >
                        생성하기
                    </Button>
                </DialogActions>
            </Dialog>
        </NovelInfo>

        {/* 에피소드 목록 */}
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>화수</StyledTableCell>
                        <StyledTableCell>제목</StyledTableCell>
                        <StyledTableCell align="right">조회수</StyledTableCell>
                        <StyledTableCell align="right">게시일</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {episodes.map((episode) => (
                        <TableRow
                            key={episode.ep_pk}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'grey.50',
                                    cursor: 'pointer',
                                },
                            }}
                            onClick={() => handleEpisodeClick(episode.ep_pk)} // 클릭 이벤트 핸들러 추가
                        >
                            <TableCell>{episode.ep_pk}</TableCell>
                            <TableCell>{episode.ep_title}</TableCell>
                            <TableCell align="right">{episode.views.toLocaleString()}</TableCell>
                            <TableCell align="right">{dayjs(episode.created_date).format('YYYY.MM.DD')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

        댓글 섹션
        <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                        작품리뷰
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            backgroundColor: 'grey.100',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            color: 'text.secondary',
                        }}
                    >
                        {comments.length}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                    <IconButton size="small">
                        <RefreshIcon />
                    </IconButton>
                    <IconButton size="small">
                        <InfoOutlinedIcon />
                    </IconButton>
                </Stack>
            </Box>

            댓글 입력 영역
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                }}
            >
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="댓글을 남기려면 로그인이 필요합니다."
                    disabled
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1}>
                        <IconButton>
                            <InsertEmoticonIcon />
                        </IconButton>
                        <IconButton>
                            <ImageIcon />
                        </IconButton>
                    </Stack>
                    <Button
                        variant="contained"
                        disabled
                        onClick={handleSubmitComment}
                        startIcon={<SendIcon />}
                        sx={{
                            bgcolor: '#FFA000',
                            '&:hover': { bgcolor: '#FF8F00' },
                        }}
                    >
                        등록하기
                    </Button>
                </Box>
            </Paper>

            {/* 클린봇 알림 */}
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderRadius: 2,
                    bgcolor: '#F5F5F5',
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <SmartToyIcon sx={{ color: '#00DC64' }} />
                    <Typography>
                        <Typography component="span" fontWeight={700}>
                            클린봇
                        </Typography>
                        이 악성댓글을 감지합니다.
                    </Typography>
                </Stack>
                <Button startIcon={<SettingsIcon />} sx={{ color: 'text.secondary' }}>
                    설정
                </Button>
            </Paper>

            댓글 목록
            <Stack spacing={2}>
                {comments.map((comment) => (
                    <Paper
                        key={comment.comment_pk}
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={700}>User {comment.user_pk}</Typography> {/* TODO: 실제 사용자 이름으로 변경 */}
                                <Typography variant="body2" color="text.secondary">
                                    {dayjs(comment.created_date).format('YYYY.MM.DD HH:mm')}
                                </Typography>
                            </Stack>
                            <IconButton size="small">
                                <MoreVertIcon />
                            </IconButton>
                        </Box>
                        {/*{comment.isBest && ( // isBest! 속성이 없으므로 제거*/}
                        {/*    <Box*/}
                        {/*        sx={{*/}
                        {/*            display: 'inline-block',*/}
                        {/*            px: 1.5,*/}
                        {/*            py: 0.5,*/}
                        {/*            borderRadius: 2,*/}
                        {/*            bgcolor: '#E3F2FD',*/}
                        {/*            color: '#1976D2',*/}
                        {/*            mb: 1,*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        <Typography variant="caption" fontWeight={700}>*/}
                        {/*            BEST*/}
                        {/*        </Typography>*/}
                        {/*    </Box>*/}
                        {/*)}*/}
                        <Typography>{comment.content}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Button
                                startIcon={<ThumbUpIcon />}
                                size="small"
                                onClick={() => handleLike(comment.comment_pk)}
                                sx={{ color: 'text.secondary' }}
                            >
                                {comment.likes}
                            </Button>
                            <Button
                                startIcon={<ThumbDownIcon />}
                                size="small"
                                onClick={() => handleDislike(comment.comment_pk)}
                                sx={{ color: 'text.secondary' }}
                            >
                                {comment.dislikes} {/* dislikes 속성이 없으므로 제거하거나, 필요에 따라 다른 값으로 대체 */}
                            </Button>
                        </Stack>
                        <IconButton
                            size="small"
                            onClick={() => handleDeleteComment(comment.comment_pk)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Paper>
                ))}
            </Stack>
        </Paper>
    </Box>
);
};

export default NovelEpisodeList;