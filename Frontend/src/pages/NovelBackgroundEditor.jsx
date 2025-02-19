import styled from '@emotion/styled'
import { useState, useEffect } from 'react' // Import useEffect
import AddIcon from '@mui/icons-material/Add'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import OfflineBoltIcon from '@mui/icons-material/OfflineBolt'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import CharacterInput from '../components/character/CharacterInput'
import DropZone from '../components/common/DropZone'
import { PrimaryButton } from '../components/common/buttons'
import axios from 'axios'; // Import Axios

// 결과 이미지 슬롯 스타일링
const ResultSlot = styled(Paper)(({ theme }) => ({
  aspectRatio: '3/4',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.grey[100],
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },
}))

// 스타일 프리셋 데이터
const stylePresets = [
  { id: 1, name: '수채화', description: '부드럽고 감성적인 수채화 스타일' },
  { id: 2, name: '유화', description: '클래식하고 고급스러운 유화 스타일' },
  { id: 3, name: '일러스트', description: '현대적이고 감각적인 일러스트 스타일' },
  { id: 4, name: '포토리얼', description: '사실적이고 생동감 있는 사진 스타일' },
  { id: 5, name: '미니멀', description: '심플하고 모던한 미니멀 스타일' },
]
const BACKEND_URL = "http://127.0.0.1:8000/api/v1/"
const NovelBackgroundEditor = () => {
  const [selectedGenre, setSelectedGenre] = useState([])
  const [title, setTitle] = useState('')
  const [worldView, setWorldView] = useState('')
  const [background, setBackground] = useState('')
  const [characters, setCharacters] = useState([
    { id: 1, type: 'protagonist', name: '', gender: '', age: '', job: '', profile: '' },
    { id: 2, type: 'protagonist', name: '', gender: '', age: '', job: '', profile: '' },
    { id: 3, type: 'protagonist', name: '', gender: '', age: '', job: '', profile: '' },
    { id: 4, type: 'protagonist', name: '', gender: '', age: '', job: '', profile: '' },
    { id: 5, type: 'supporter', name: '', gender: '', age: '', job: '', profile: '' },
    { id: 6, type: 'antagonist', name: '', gender: '', age: '', job: '', profile: '' },
  ])
  const [generationType, setGenerationType] = useState('default')
  const [keywordInput, setKeywordInput] = useState('')
  const [keywords, setKeywords] = useState([])
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [results, setResults] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false); // Save State
  const [userPk, setUserPk] = useState(null); // User PK state
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [summary, setSummary] = useState('');  // New state for summary
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false); // New state for summary generating
  const [novelPk, setNovelPk] = useState(null);

  const genres = [
    '판타지',
    '무협',
    '액션',
    '로맨스',
    '스릴러',
    '드라마',
    'SF',
    '기타'
  ]

  // useEffect Hook for fetching user info on component mount
    useEffect(() => {
        const fetchUserInfo = async () => {
            setLoading(true); // Start loading
            try {
                const response = await axios.get('http://localhost:8000/api/v1/users/logged-in', { withCredentials: true });
                
                setUserPk(response.data.user_pk); // Extract user_pk from the response
                setUserInfo(response.data); // Store user info
                console.log("User Info:", response.data); // Log the user info for debugging

            } catch (error) {
                console.error("Error fetching user info:", error);
                // Handle error appropriately (e.g., redirect to login page)
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchUserInfo();
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleGenreClick = (genre) => {
      if (selectedGenre.includes(genre)) {
        // 이미 선택된 장르인 경우, 제거
        setSelectedGenre(selectedGenre.filter((g) => g !== genre));
      } else {
        // 선택되지 않은 장르인 경우, 추가
        setSelectedGenre([...selectedGenre, genre]);
      }
    };

    const handleWorldviewGenerate = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/v1/ai/worldview", {
                genre: selectedGenre.join(" "),
                title: title,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });


            setWorldView(response.data.worldview);
        } catch (error) {
            console.error("Error generating worldview:", error);
            // Handle error appropriately (e.g., display an error message to the user)
        }
    };



  const handleCharacterChange = (characterId) => (newCharacterData) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === characterId ? { ...char, ...newCharacterData } : char))
    )
  }

  const handleCharacterGenerate = (characterId) => () => {
    // TODO: AI 캐릭터 생성 로직 구현
    console.log(`Generate character ${characterId}`)
  }

  const onAddCharacter = () => {
    setCharacters((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        type: 'extra',
        name: '',
        gender: '',
        age: '',
        job: '',
        profile: '',
      },
    ])
  }

  // 파일 업로드 핸들러
  // const handleFileSelect = async (file) => {
  //   setUploadLoading(true)
  //   try {
  //     // TODO: 실제 파일 업로드 로직 구현
  //     console.log('Selected file:', file)
  //     await new Promise((resolve) => setTimeout(resolve, 2000)) // 임시 딜레이
  //   } catch (error) {
  //     console.error('File upload failed:', error)
  //   } finally {
  //     setUploadLoading(false)
  //   }
  // }

  const handleKeywordInputKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (keywordInput.trim()) {
              setKeywords(prev => [...prev, keywordInput.trim()]);
              setKeywordInput('');
          }
      }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setKeywords(keywords.filter((k) => k !== keywordToDelete))
  }

    const handleSynopsisGenerate = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/v1/ai/synopsis", {
                genre: selectedGenre.join(" "),
                title: title,
                worldview: worldView, // Corrected variable name
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setBackground(response.data.synopsis);
        } catch (error) {
            console.error("Error generating synopsis:", error);
        }
      };
      // Save Function
      const handleSave = async () => {
        setIsSaving(true);
        try {
            const dataToSend = {
                title: title,
                worldview: worldView,
                synopsis: background,
                genres: selectedGenre,
                summary: summary,
            };
    
            const response = await axios.post(
                `http://127.0.0.1:8000/api/v1/novel?user_pk=${userPk}`,
                dataToSend,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
    
            if (response.status === 200) {
                console.log("Novel saved successfully");
                console.log("Response Data:", response.data); // Log the response
                console.log("Novel Pk value:", response.data.novel_pk);
                setNovelPk(response.data.novel_pk);
    
            } else {
                console.error(
                    "Error saving novel:",
                    response.status,
                    response.data
                );
            }
        } catch (error) {
            console.error("Error saving novel:", error);
            if (error.response) {
                console.error("Error details:", error.response.data);
            }
        } finally {
            setIsSaving(false);
        }
    };
    const handleAICharacterGenerate = async () => {
        setIsGenerating(true);
        let endpoint = "http://127.0.0.1:8000/api/v1/ai/";
    
        try {
            const hasCharacterData = characters.some(char =>
                char.name || char.gender || char.age || char.job || char.profile
            );
    
            const requestData = {
                genre: selectedGenre.join(" "),
                title: title,
                worldview: worldView,
                synopsis: background,
                characters: hasCharacterData ? characters : []
            };
    
            endpoint += hasCharacterData ? "characters-new" : "characters";
    
            console.log("Request data:", requestData);
    
            const response = await axios.post(endpoint, requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
            console.log("API Response:", response.data);
    
            if (response.data) {
                let newCharactersJSON = null;
                if (hasCharacterData) {
                    newCharactersJSON = response.data.new_characters;
                } else {
                    newCharactersJSON = response.data.characters;
                }
    
                let newCharacters = []; // 기본값으로 빈 배열 설정
    
                try {
                    if (newCharactersJSON) {
                        // JSON 파싱 시도
                        const parsedData = JSON.parse(newCharactersJSON);
    
                        // 파싱된 데이터가 배열인지 확인
                        if (Array.isArray(parsedData)) {
                            newCharacters = parsedData;
                        } else {
                            // 배열이 아닌 경우, 로그를 남기고 빈 배열 사용
                            console.warn("Parsed character data is not an array, using empty array instead");
                        }
                    } else {
                        console.warn("Character data is null or undefined, using empty array instead");
                    }
                } catch (error) {
                    // JSON 파싱 실패 시 로그를 남기고 빈 배열 사용
                    console.error("Failed to parse character data:", error);
                    console.error("Raw data:", newCharactersJSON);
                    console.warn("Using empty array instead");
                }
    
    
                const formattedCharacters = newCharacters.map((char, index) => {
                    const formattedChar = {
                        id: characters[index]?.id || index + 1,
                        type: char.role || 'protagonist',
                        name: char.name || '',
                        gender: char.sex || '',
                        age: char.age || '',
                        job: char.job || '',
                        profile: char.profile || ''
                    };
                    console.log(`Formatted character ${index}:`, formattedChar);
                    return formattedChar;
                });
    
                console.log("About to update characters with:", formattedCharacters);


    
                setCharacters(hasCharacterData ? [...characters, ...formattedCharacters] : formattedCharacters);
    
                setTimeout(() => {
                    console.log("Characters state after update:", characters);
                    if (characters !== formattedCharacters) {
                        console.log("State update might not have been reflected immediately due to React's batching");
                    }
                }, 0);
    
            } else {
                throw new Error("Invalid response format");
            }
    
        } catch (error) {
            console.error("Error in character generation:", error);
            if (error.response) {
                console.error("Server error response:", error.response.data);
            }
            alert("캐릭터 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAISummaryGenerate = async () => {
        setIsGeneratingSummary(true);
        try {
            const requestData = {
                genre: selectedGenre.join(" "),
                title: title,
                worldview: worldView,
                synopsis: background
            };
            const response = await axios.post("http://127.0.0.1:8000/api/v1/ai/summary", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            setSummary(response.data.summary);
        } catch (error) {
            console.error("Error generating summary:", error);
            // Handle error (e.g., display an error message)
        } finally {
            setIsGeneratingSummary(false);
        }
    };
    const handleFileUpload = async (file) => {
        if (!file || !novelPk) {
          alert("소설을 먼저 저장해주세요.");
          return;
        }
    
        setUploadLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
      
            const response = await axios.post(
                `${BACKEND_URL}save?user_novel=novel&pk=${novelPk}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
    
            if (response.status === 200) {
                console.log("File uploaded successfully:", response.data);
                alert("표지 이미지가 성공적으로 업로드되었습니다.");
            }
        } catch (error) {
            console.error("File upload error:", error);
            alert("표지 이미지 업로드에 실패했습니다.");
            if (error.response) {
              console.log("Server responded with:", error.response.status, error.response.data);
            }

        } finally {
            setUploadLoading(false);
        }
    };
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const requestData = {
                genre: selectedGenre,
                style: stylePresets.find(style => style.id === selectedStyle)?.name || '',
                title: title,
                worldview: worldView,
                keywords: keywords
            };
    
            const response = await axios.post(
                "http://localhost:8000/image/generate",
                requestData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
    
            if (response.status === 200) {
                // 응답 데이터에 따라 결과 처리
                setResults([response.data]); // 또는 적절한 데이터 처리
            }
        } catch (error) {
            console.error("Image generation error:", error);
            alert("이미지 생성에 실패했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };
    
  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, overflowX: 'hidden', overflowY: 'auto', height: '100vh' }}
    >
         {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        ) : (
      <Stack direction="column" spacing={2} sx={{ width: '100%', p: 3 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
        >
          <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 950 }}>
            작품의 배경에 대한 정보를 입력해주세요.
          </Typography>
        </Stack>
        <Divider sx={{ mb: 4 }} />

        {/* 장르 선택 버튼들 */}
        <Typography variant="h3" sx={{ mb: 1, fontSize: '1.5rem', fontWeight: 700 }}>
          장르 태그
        </Typography>
        <Box
          sx={{
            overflowX: 'auto',
            pb: 2,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#FFA000',
              borderRadius: '4px',
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              minWidth: 'min-content',
              flexWrap: 'nowrap',
            }}
          >
            {genres.map((genre) => (
    <Button
        key={genre}
        variant={selectedGenre.includes(genre) ? 'contained' : 'outlined'}
        onClick={() => handleGenreClick(genre)}
        sx={{
          color: selectedGenre.includes(genre) ? 'white' : 'grey.700',
          fontWeight: 600,
          backgroundColor: selectedGenre.includes(genre) ? '#FFA000' : 'transparent',
          whiteSpace: 'nowrap',
          borderRadius: '20px',
          minWidth: 'auto',
          width: 'fit-content',
          py: 1,
          px: 2,
          flex: '0 0 auto',
          '&:hover': {
            backgroundColor: selectedGenre.includes(genre) ? '#FFA000' : 'rgba(255, 160, 0, 0.1)',
          },
          borderColor: selectedGenre.includes(genre) ? '#FFA000' : 'grey.300',
        }}
      >
        {genre}
      </Button>
    ))}
          </Stack>
        </Box>

        {/* 제목 입력 */}
        <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              제목
            </Typography>
            {/* 삭제: 제목 옆 AI 생성 버튼 */}
          </Stack>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요. AI 생성 후 수정도 가능합니다."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: 'white',
              },
            }}
          />
        </Stack>

        {/* 희망하는 세계관 입력 */}
        <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              세계관
            </Typography>
            <PrimaryButton
                startIcon={<OfflineBoltIcon />}
                onClick={handleWorldviewGenerate}
                sx={{ py: 0.5 }}
            >
              AI 생성
            </PrimaryButton>
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={worldView}
            onChange={(e) => setWorldView(e.target.value)}
            placeholder="세계관을 입력해주세요. AI 생성 후 수정도 가능합니다."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: 'white',
              },
            }}
          />
        </Stack>

        {/* 기본 동기/배경 입력 */}
        <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              기본 줄거리
            </Typography>
            <PrimaryButton
              startIcon={<OfflineBoltIcon />}
              onClick={handleSynopsisGenerate}
              sx={{ py: 0.5 }}
            >
              AI 생성
            </PrimaryButton>
          </Stack>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="기본 줄거리를 입력해주세요. AI 생성 후 수정도 가능합니다."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: 'white',
              },
            }}
          />
          {/* Summary Input Field */}
          <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
              <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      한줄 요약
                  </Typography>
                  <PrimaryButton
                      startIcon={<OfflineBoltIcon />}
                      onClick={handleAISummaryGenerate}
                      disabled={isGeneratingSummary}
                      sx={{ py: 0.5 }}
                  >
                      {isGeneratingSummary ? "생성 중..." : "AI 생성"}
                  </PrimaryButton>
              </Stack>
              <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="작품의 한줄 요약을 입력해주세요. AI 생성 후 수정도 가능합니다."
                  variant="outlined"
                  sx={{
                      '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          backgroundColor: 'white',
                      },
                  }}
              />
          </Stack>
          <Stack direction="row" spacing={1}>
            <PrimaryButton
              startIcon={<SaveIcon />}
              backgroundColor="#111111"
              hoverBackgroundColor="#404040"
              sx={{ py: 0.5 }}
              onClick={handleSave} // Save Function
              disabled={isSaving || !userPk} // Disable if userPk is null
            >
              {isSaving ? "저장 중..." : "저장"}
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
        </Stack>
        <Divider sx={{ my: 4 }} /> {/* 구분선 */}

        {/* 캐릭터 입력 섹션 */}
        <Stack direction="column" spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h3" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              등장인물 정보를 입력해주세요
            </Typography>
            <Stack direction="row" spacing={1}>
              <PrimaryButton
                startIcon={<OfflineBoltIcon />}
                onClick={handleAICharacterGenerate}
                sx={{ py: 0.5 }}
                disabled={isGenerating}
              >
                {isGenerating ? "생성 중..." : "AI 생성"}
              </PrimaryButton>
              <PrimaryButton
                startIcon={<AddIcon />}
                backgroundColor="#1c1c1c"
                hoverBackgroundColor="#333333"
                textColor="#ffffff"
                sx={{ py: 0.5 }}
                onClick={onAddCharacter}
              >
                캐릭터 추가
              </PrimaryButton>
            </Stack>
          </Stack>

          <Box
            sx={{
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#FFA000',
                borderRadius: '4px',
              },
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                minWidth: 'min-content',
                px: 1,
              }}
            >
              {characters.map((character) => (
                <CharacterInput
                  key={character.id}
                  type={character.type}
                  character={character}
                  onChange={handleCharacterChange(character.id)}
                  onGenerate={handleCharacterGenerate(character.id)}
                  novelPk={novelPk}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 4 }} />

        {/* 표지 생성 섹션 */}
        <Stack direction="column" spacing={4}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 950 }}>
              소설 표지 생성
            </Typography>
          </Stack>
          <Divider />

          {/* 생성 타입 선택 */}
          <Stack spacing={2}>
            <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              표지 생성 타입
            </Typography>
            <Stack direction="row" spacing={2}>
              {/* <PrimaryButton
                startIcon={<AutoFixHighIcon />}
                onClick={() => setGenerationType('default')}
                variant={generationType === 'default' ? 'contained' : 'outlined'}
                backgroundColor={generationType === 'default' ? '#FFA000' : 'transparent'}
                textColor={generationType === 'default' ? 'white' : '#FFA000'}
              >
                기본 이미지
              </PrimaryButton> */}
              <PrimaryButton
                startIcon={<CloudUploadIcon />}
                onClick={() => setGenerationType('upload')}
                variant={generationType === 'upload' ? 'contained' : 'outlined'}
                backgroundColor={generationType === 'upload' ? '#FFA000' : 'transparent'}
                textColor={generationType === 'upload' ? 'white' : '#FFA000'}
              >
                파일 업로드
              </PrimaryButton>
              <PrimaryButton
                startIcon={<AddIcon />}
                onClick={() => setGenerationType('ai')}
                variant={generationType === 'ai' ? 'contained' : 'outlined'}
                backgroundColor={generationType === 'ai' ? '#FFA000' : 'transparent'}
                textColor={generationType === 'ai' ? 'white' : '#FFA000'}
              >
                AI 표지 생성
              </PrimaryButton>
            </Stack>
          </Stack>

          {generationType === 'upload' && (
            <DropZone onFileSelect={handleFileUpload} accept="image/*" loading={uploadLoading} />
          )}

          {generationType === 'ai' && (
            <>
              {/* 키워드 입력 */}
              <Stack spacing={2}>
                <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  이미지 생성 키워드
                </Typography>
                <TextField
                    fullWidth
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordInputKeyDown}
                    placeholder="키워드를 입력하고 Enter나 Space를 눌러주세요"
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                        },
                    }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      onDelete={() => handleDeleteKeyword(keyword)}
                      sx={{
                        backgroundColor: '#FFA000',
                        color: 'white',
                        '& .MuiChip-deleteIcon': {
                          color: 'white',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Stack>

              {/* 스타일 선택 */}
              <Stack spacing={2}>
                <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  이미지 스타일 선택
                </Typography>
                <Grid
                  container
                  spacing={2}
                  sx={{
                    width: '100%',
                    '& .MuiGrid-item': {
                      padding: 0,
                    },
                  }}
                >
                  {stylePresets.map((style) => (
                    <Grid item xs={12} sm={6} md={4} key={style.id}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedStyle === style.id ? '2px solid #FFA000' : 'none',
                          '&:hover': {
                            backgroundColor: 'grey.100',
                          },
                        }}
                        onClick={() => setSelectedStyle(style.id)}
                      >
                        <Typography variant="h6">{style.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {style.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Stack>

              {/* 생성 결과 */}
              <Stack spacing={2}>
                <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  AI 생성 결과물
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    pb: 2,
                    gap: 2,
                    '&::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#FFA000',
                      borderRadius: '4px',
                    },
                  }}
                >
                  {results.map((result, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: '0 0 auto',
                        width: '250px',
                      }}
                    >
                      <ResultSlot>
                        {isGenerating ? (
                          <Typography color="text.secondary">생성중...</Typography>
                        ) : (
                          <Typography color="text.secondary">결과 {index + 1}</Typography>
                        )}
                      </ResultSlot>
                    </Box>
                  ))}
                </Box>
              </Stack>

              {/* 생성 버튼 */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <PrimaryButton
                  startIcon={
                    isGenerating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AutoFixHighIcon />
                    )
                  }
                  onClick={handleGenerate}
                  disabled={isGenerating || keywords.length === 0 || !selectedStyle}
                  sx={{ minWidth: 200 }}
                >
                  {isGenerating ? '생성중...' : 'AI 표지 생성하기'}
                </PrimaryButton>
              </Box>
            </>
          )}
        </Stack>
      </Stack>
        )}
    </Box>
  )
}

export default NovelBackgroundEditor