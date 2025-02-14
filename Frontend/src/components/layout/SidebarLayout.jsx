import { Outlet } from 'react-router-dom'

import { Stack } from '@mui/material'

import Sidebar from '../common/Sidebar'

const SidebarLayout = () => {
  return (
    <Stack direction="row">
      <Sidebar />
      <Outlet />
    </Stack>
  )
}

export default SidebarLayout
