import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import NavbarLayout from '/src/components/layout/NavbarLayout'
import SidebarLayout from '/src/components/layout/SidebarLayout'
import FindId from '/src/pages/FindId'
import FindPassword from '/src/pages/FindPassword'
import Login from '/src/pages/Login'
import NovelBackgroundEditor from '/src/pages/NovelBackgroundEditor'
import NovelEditor from '/src/pages/NovelEditor'
import NovelEpisodeEditor from '/src/pages/NovelEpisodeEditor'
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
            {/* Auth routes */}
            <Route path="/" element={<div>대시보드</div>} />
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="find-id" element={<FindId />} />
              <Route path="find-password" element={<FindPassword />} />
            </Route>
            <Route path="/novel/edit/" element={<NovelEditor />} />
          </Route>

          {/* Sidebar Layout */}
          <Route element={<SidebarLayout />}>
            <Route path="/novel">
              <Route path="edit/background" element={<NovelBackgroundEditor />} />
              <Route path="edit/episode" element={<NovelEpisodeEditor />} />
              <Route path="viewer/list" element={<div>작품 리스트 페이지</div>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
