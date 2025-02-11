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
import NovelEpisodeList from '/src/pages/NovelEpisodeList'
import NotFound from '/src/pages/NotFound'
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
              <Route path="edit/episode/:episodeId" element={<NovelEpisodeEditor />} />
              <Route path="viewer/list" element={<div>작품 리스트 페이지</div>} />
              {/* 작품 상세 페이지의 실제 주소 스타일 */}
              {/* <Route path="viewer/:novelId" element={<NovelEpisodeList />} /> */}
              {/* 디버그를 위한 작품 상세 페이지 */}
              <Route path="viewer/detail" element={<NovelEpisodeList />} />
            </Route>
          </Route>

          {/* Not Found Page - 모든 정의되지 않은 경로에 대해 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
