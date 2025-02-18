import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button,
  Card, 
  CardActionArea, 
  CardContent, 
  CardMedia, 
  Stack, 
  Typography,
  Container,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';

const NovelEditor = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState([]);
  const BACKEND_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}`

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/users/novels-written`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setNovels(data);
        }
      } catch (error) {
        console.error('Failed to fetch novels:', error);
      }
    };

    fetchNovels();
  }, []);

  const handleNovelClick = (novelId) => {
    navigate(`/novel/edit/episodelist/${novelId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, m: "2rem 6rem" }}>
      {/* Header with Create Button */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          집필 중인 소설 목록
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => navigate('/novel/edit/background')}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'success.dark'
            }
          }}
        >
          새로운 소설 생성하기
        </Button>
      </Box>

      {/* Novel List Grid */}
      <Grid container spacing={3}>
        {novels.map((novel) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={novel.novel_pk}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleNovelClick(novel.novel_pk)}
                sx={{ height: '100%' }}
              >
                <CardMedia
                  component="img"
                  sx={{ aspectRatio: '3/4', objectFit: 'cover' }}
                  image={novel.coverImage || '/api/placeholder/300/400'}
                  alt={novel.title}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {novel.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
                    {novel.author}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {novel.description}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <VisibilityIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {novel.views.toLocaleString()}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FavoriteIcon fontSize="small" color="error" />
                      <Typography variant="body2" color="text.secondary">
                        {novel.likes.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default NovelEditor;