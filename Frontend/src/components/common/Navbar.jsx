import { useState } from 'react'

import { Link } from 'react-router-dom'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#FFFFFF',
  boxShadow: 'none',
  borderBottom: '1px solid #E5E5E5',
  fontFamily: 'Pretendard-Regular, sans-serif',
  position: 'sticky',
  top: 0,
  zIndex: 1100,
})

const NavLink = styled(Link)({
  textDecoration: 'none',
  color: '#000000',
  marginLeft: '2rem',
  fontFamily: 'Pretendard-Regular, sans-serif',
  '&:hover': {
    color: '#FFA726',
  },
})

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null)
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
    // TODO: 로그아웃 로직 구현
    handleUserMenuClose()
  }

  return (
    <StyledAppBar>
      <Toolbar>
        <Box
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
          }}
        >
          <img
            src="/src/assets/logo/text-logo.svg"
            alt="MOMOSO"
            style={{
              height: '24px',
              width: 'auto',
            }}
          />
        </Box>
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon sx={{ color: '#000000' }} />
            </IconButton>
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
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NavLink to="/novel/edit">AI소설 에디터</NavLink>
            <NavLink to="/community">그룹 토론</NavLink>
            <NavLink to="/novel/viewer/list">소설 게시판</NavLink>
            <IconButton onClick={handleUserMenuOpen} sx={{ marginLeft: '1rem' }}>
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
              <MenuItem component={Link} to="/mypage">
                <PersonIcon sx={{ mr: 1 }} />
                마이페이지
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                로그아웃
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  )
}

export default Navbar
