import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  Edit,
  Home,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  MenuBook,
  VideoCall,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
} from '@mui/material'

const drawerWidth = 240

const HeaderContainer = styled('div')(({ theme, open }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: open ? 'space-between' : 'center',
  flexDirection: open ? 'row' : 'column',
  padding: theme.spacing(0, 1),
  height: open ? '64px' : '128px',
  gap: open ? theme.spacing(2) : theme.spacing(3),
}))

const Logo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  '& img': {
    height: '32px',
    width: 'auto',
    maxWidth: '100%',
  },
})

const Sidebar = () => {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()

  const menuItems = [
    { text: 'Dashboard', icon: <Home fontSize="large" />, path: '/' },
    { text: 'Editor', icon: <Edit fontSize="large" />, path: '/editor' },
    { text: 'Viewer', icon: <MenuBook fontSize="large" />, path: '/viewer' },
    { text: 'Conference', icon: <VideoCall fontSize="large" />, path: '/conference' },
  ]

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          boxSizing: 'border-box',
          backgroundColor: '#FFF8EE',
          color: '#1E1E1E',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      <HeaderContainer open={open}>
        {open ? (
          <>
            <Logo>
              <img src="/src/assets/logo/text-logo.svg" alt="MOMOSO" />
            </Logo>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: '#FFB347',
                color: '#FFFFFF',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#FFA022',
                },
              }}
            >
              <KeyboardDoubleArrowLeft />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: '#FFB347',
                color: '#FFFFFF',
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: '#FFA022',
                },
              }}
            >
              <KeyboardDoubleArrowRight />
            </IconButton>
            <Logo>
              <img src="/src/assets/logo/graphic-logo.svg" alt="MOMOSO" />
            </Logo>
          </>
        )}
      </HeaderContainer>
      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': {
                  backgroundColor: '#FFE5CC',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: '#1E1E1E',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    color: '#1E1E1E',
                    fontFamily: '"Poppins", "Pretendard"',
                    fontSize: open ? '20px' : '16px',
                    fontWeight: open ? 'bold' : 'normal',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/mypage')}
            sx={{
              justifyContent: open ? 'initial' : 'center',
              alignItems: 'center',
              px: 2.5,
              '&:hover': {
                backgroundColor: '#FFE5CC',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 'auto',
                my: open ? 0 : 1.5,
                justifyContent: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  border: '2px solid #FFB347',
                }}
              />
            </ListItemIcon>
            {open && (
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <ListItemText
                  primary="UserName"
                  secondary="UserEmail@domain.com"
                  slotProps={{
                    primary: {
                      sx: {
                        color: '#1E1E1E',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        mb: 0,
                      },
                    },
                    secondary: {
                      sx: {
                        color: '#666666',
                        fontSize: 'auto',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  )
}

export default Sidebar
