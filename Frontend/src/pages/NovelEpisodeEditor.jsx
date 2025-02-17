import { useState, useRef } from 'react';
import { Box, Typography, Fab, Paper, Input, TextareaAutosize } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

function NovelEpisodeEditor() {
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef('');

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(true);
  };

  const handleContentChange = (event) => {
    contentRef.current = event.target.value;
  };

  const handleSceneGeneration = () => {
    // AI 장면 생성 로직 구현
    console.log('AI 장면 생성:', contentRef.current);
    contentRef.current = 'test';
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1000px', margin: '0 auto' }}>
      <Paper elevation={0} sx={{ p: 3, position: 'relative' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          괴식식당
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          1화
        </Typography>
        <Input
          fullWidth
          placeholder="제목을 입력해주세요"
          sx={{ 
            mb: 2,
            p: 1,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            '&:hover': {
              border: '1px solid #000'
            },
            '&.Mui-focused': {
              border: '2px solid #1976d2'
            }
          }}
        />
        <TextareaAutosize
          minRows={20}
          placeholder="컨텐츠를 입력하거나 AI 장면생성을 눌러주세요."
          defaultValue={contentRef.current}
          onChange={handleContentChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            backgroundColor: '#fff',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            resize: 'vertical',
            '&:hover': {
              border: '1px solid #000'
            },
            '&:focus': {
              outline: 'none',
              border: '2px solid #1976d2'
            }
          }}
        />
        {isFocused && (
          <Fab
            color="primary"
            aria-label="AI 장면 생성"
            onClick={handleSceneGeneration}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
            }}
          >
            <AutoFixHighIcon />
          </Fab>
        )}
      </Paper>
    </Box>
  );
}

export default NovelEpisodeEditor;
