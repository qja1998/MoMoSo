import { useState } from 'react'

import { Link } from 'react-router-dom'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    // TODO: 로그아웃 로직 구현
    handleUserMenuClose()
  }

  const handleProfileClick = () => {
    // TODO: 프로필 페이지 이동 로직 구현
    // - 현재 사용자 정보 확인
    // - 프로필 페이지로 이동
  }

  const handleSettingsClick = () => {
    // TODO: 설정 페이지 이동 로직 구현
    // - 사용자 설정 페이지로 이동
    // - 현재 설정 상태 로드
  }

  const renderMenuItems = () => {
    if (isLoggedIn) {
      return (
        <>
          <MenuItem component={Link} to="/auth/mypage" onClick={handleProfileClick}>
            <PersonIcon sx={{ mr: 1 }} />
            마이페이지
          </MenuItem>
          <MenuItem component={Link} to="/auth/change-info" onClick={handleSettingsClick}>
            <ManageAccountsIcon sx={{ mr: 1 }} />
            회원정보 수정
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            로그아웃
          </MenuItem>
        </>
      )
    } else {
      return (
        <>
          <MenuItem component={Link} to="/auth/login">
            <LoginIcon sx={{ mr: 1 }} />
            로그인
          </MenuItem>
          <MenuItem component={Link} to="/auth/signup">
            <HowToRegIcon sx={{ mr: 1 }} />
            회원가입
          </MenuItem>
        </>
      )
    }
  }

  return (
    <AppBar
      sx={{
        backgroundColor: '#FFFFFF',
        boxShadow: 'none',
        borderBottom: '1px solid #E5E5E5',
        fontFamily: 'Pretendard-Regular, sans-serif',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', width: '120px' }}>
          <img
            src="/src/assets/logo/text-logo.svg"
            alt="MOMOSO"
            style={{ height: '24px', width: '120px' }}
          />
        </Link>
        {isMobile ? (
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon sx={{ color: '#000000' }} />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              onClick={handleClose}
            >
              <MenuItem component={Link} to="/novel/edit">
                AI소설 에디터
              </MenuItem>
              <MenuItem component={Link} to="/community">
                그룹 토론
              </MenuItem>
              <MenuItem component={Link} to="/novel/viewer/list">
                소설 게시판
              </MenuItem>
            </Menu>
          </IconButton>
        ) : (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Link
              to="/novel/edit"
              style={{
                textDecoration: 'none',
                color: '#000000',
                fontFamily: 'Pretendard-Regular, sans-serif',
                '&:hover': { color: '#FFA726' },
              }}
            >
              AI소설 에디터
            </Link>
            <Link
              to="/community"
              style={{
                textDecoration: 'none',
                color: '#000000',
                fontFamily: 'Pretendard-Regular, sans-serif',
                '&:hover': { color: '#FFA726' },
              }}
            >
              그룹 토론
            </Link>
            <Link
              to="/novel/viewer/list"
              style={{
                textDecoration: 'none',
                color: '#000000',
                fontFamily: 'Pretendard-Regular, sans-serif',
                '&:hover': { color: '#FFA726' },
              }}
            >
              소설 게시판
            </Link>
            <IconButton onClick={handleUserMenuOpen}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#FFA726' }}>
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              onClick={handleUserMenuClose}
            >
              {renderMenuItems()}
            </Menu>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
