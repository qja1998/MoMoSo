import axios from 'axios'

import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import Edit from '@mui/icons-material/Edit'
import Home from '@mui/icons-material/Home'
import KeyboardDoubleArrowLeft from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight'
import MenuBook from '@mui/icons-material/MenuBook'
import VideoCall from '@mui/icons-material/VideoCall'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'

const drawerWidth = 240

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_PROTOCOL}://${import.meta.env.VITE_BACKEND_IP}${import.meta.env.VITE_BACKEND_PORT}`

const Sidebar = () => {
  const [open, setOpen] = useState(true)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: loginData } = await axios.get(`${BACKEND_URL}/api/v1/users/logged-in`)
        setUserInfo({
          nickname: loginData.nickname,
          email: loginData.email,
          userImg: loginData.user_img,
        })
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        setUserInfo(null)
      }
    }

    fetchUserInfo()
  }, [])

  const menuItems = [
    { text: 'Dashboard', icon: <Home fontSize="large" />, path: '/' },
    { text: 'Editor', icon: <Edit fontSize="large" />, path: '/novel/edit' },
    { text: 'Viewer', icon: <MenuBook fontSize="large" />, path: '/novel/viewer/list' },
    { text: 'Conference', icon: <VideoCall fontSize="large" />, path: '/conference' },
  ]

  const handleDrawerToggle = () => {
    // TODO: Add animation effect when toggling drawer
    setOpen(!open)
  }

  const handleNavigate = (path) => {
    // TODO: Add loading state while navigating
    // TODO: Add route transition animation
    navigate(path)
  }

  const handleProfileClick = () => {
    // TODO: Add profile menu popup
    // TODO: Add user authentication check
    navigate('/auth/mypage')
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
      <Stack
        direction={open ? 'row' : 'column'}
        alignItems="center"
        justifyContent={open ? 'space-between' : 'center'}
        sx={{
          p: (theme) => theme.spacing(0, 1),
          height: open ? '64px' : '128px',
          gap: (theme) => (open ? theme.spacing(2) : theme.spacing(3)),
        }}
      >
        {open ? (
          <>
            <Stack sx={{ alignItems: 'center', '& img': { pl: 2, height: '24px', width: 'auto' } }}>
              <img src="/src/assets/logo/text-logo.svg" alt="MOMOSO" />
            </Stack>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: '#FFB347',
                color: '#FFFFFF',
                borderRadius: '50%',
                height: '28px',
                width: '28px',
                '&:hover': { backgroundColor: '#FFA022' },
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
                height: '30px',
                width: '30px',
                '&:hover': { backgroundColor: '#FFA022' },
              }}
            >
              <KeyboardDoubleArrowRight />
            </IconButton>
            <Stack
              sx={{
                alignItems: 'center',
                '& img': { height: '32px', width: 'auto', maxWidth: '100%' },
              }}
            >
              <img src="/src/assets/logo/graphic-logo.svg" alt="MOMOSO" />
            </Stack>
          </>
        )}
      </Stack>
      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&:hover': { backgroundColor: '#FFE5CC' },
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
                slotProps={{
                  primary: {
                    sx: {
                      color: '#1E1E1E',
                      fontFamily: '"Poppins", "Pretendard"',
                      fontSize: open ? '20px' : '16px',
                      fontWeight: open ? 'bold' : 'normal',
                      opacity: open ? 1 : 0,
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Stack sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton
            onClick={userInfo ? handleProfileClick : () => navigate('/auth/login')}
            sx={{
              justifyContent: open ? 'initial' : 'center',
              alignItems: 'center',
              px: 2.5,
              '&:hover': { backgroundColor: '#FFE5CC' },
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
                src={userInfo?.userImg}
                sx={{
                  width: 32,
                  height: 32,
                  border: '2px solid #FFB347',
                }}
              />
            </ListItemIcon>
            {open && (
              <Stack sx={{ flex: 1 }}>
                <ListItemText
                  primary={userInfo ? userInfo.nickname : '로그인이 필요합니다'}
                  secondary={userInfo ? userInfo.email : null}
                  slotProps={{
                    primary: {
                      sx: { color: '#1E1E1E', fontSize: '16px', fontWeight: 'bold', mb: 0 },
                    },
                    secondary: { sx: { color: '#666666', fontSize: 'auto' } },
                  }}
                />
              </Stack>
            )}
          </ListItemButton>
        </ListItem>
      </Stack>
    </Drawer>
  )
}

export default Sidebar
