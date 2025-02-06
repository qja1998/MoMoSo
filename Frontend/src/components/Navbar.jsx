import { styled } from '@mui/material/styles'
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#FFFFFF',
  boxShadow: 'none',
  borderBottom: '1px solid #E5E5E5',
  fontFamily: 'Pretendard-Regular, sans-serif',
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <StyledAppBar position="static">
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
              <MenuItem component={Link} to="/editor">
                AI소설 에디터
              </MenuItem>
              <MenuItem component={Link} to="/community">
                그룹 토론
              </MenuItem>
              <MenuItem component={Link} to="/novels">
                소설 게시판
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <NavLink to="/editor">AI소설 에디터</NavLink>
            <NavLink to="/community">그룹 토론</NavLink>
            <NavLink to="/novels">소설 게시판</NavLink>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  )
}

export default Navbar
