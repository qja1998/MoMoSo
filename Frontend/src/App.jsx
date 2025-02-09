import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import NavbarLayout from '/src/components/layout/NavbarLayout'
import SidebarLayout from '/src/components/layout/SidebarLayout'
import FindId from '/src/pages/FindId'
import FindPassword from '/src/pages/FindPassword'
import Login from '/src/pages/Login'
import NovelBackgroundGeneration from '/src/pages/NovelBackgroundGeneration'
import NovelEditor from '/src/pages/NovelEditor'
import SignUp from '/src/pages/SignUp'
import theme from '/src/styles/theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Navbar Layout */}
          <Route element={<NavbarLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/find-password" element={<FindPassword />} />
            <Route path="/" element={<div>대시보드</div>} />
          </Route>

          {/* Sidebar Layout */}
          <Route element={<SidebarLayout />}>
            <Route path="/editor" element={<NovelEditor />} />
            <Route path="/editor/background" element={<NovelBackgroundGeneration />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
