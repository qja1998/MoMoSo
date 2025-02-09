import { Outlet } from 'react-router-dom'

import { Box } from '@mui/material'

import Sidebar from '../common/Sidebar'

const SidebarLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default SidebarLayout
