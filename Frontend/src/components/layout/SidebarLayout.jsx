import { Outlet } from 'react-router-dom'

import { Box } from '@mui/material'

import Sidebar from '../common/Sidebar'

const SidebarLayout = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflowX: 'hidden', overflowY: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default SidebarLayout
