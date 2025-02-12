import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import NavbarLayout from '/src/components/layout/NavbarLayout'
import SidebarLayout from '/src/components/layout/SidebarLayout'
import ChangeUserInfo from '/src/pages/ChangeUserInfo'
import FindId from '/src/pages/FindId'
import FindPassword from '/src/pages/FindPassword'
import Login from '/src/pages/Login'
// import MyPage from '/src/pages/MyPage'
import NotFound from '/src/pages/NotFound'
import NovelBackgroundEditor from '/src/pages/NovelBackgroundEditor'
import NovelEditor from '/src/pages/NovelEditor'
import NovelEpisodeEditor from '/src/pages/NovelEpisodeEditor'
import NovelEpisodeList from '/src/pages/NovelEpisodeList'
import NovelEpisodeViewer from '/src/pages/NovelEpisodeViewer'
import NovelList from '/src/pages/NovelList'
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
            <Route path="/" element={<NovelList />} />
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="find-id" element={<FindId />} />
              <Route path="find-password" element={<FindPassword />} />
              {/* <Route path="mypage" element={<MyPage />} /> */}
              <Route path="change-info" element={<ChangeUserInfo />} />
            </Route>
            <Route path="/novel/edit/" element={<NovelEditor />} />

            <Route path="/novel/viewer">
              <Route path="list" element={<NovelList />} />
              {/* 작품 상세 페이지의 실제 주소 스타일 */}
              {/* <Route path="viewer/:novelId" element={<NovelEpisodeList />} /> */}
              {/* 에피소드 뷰어 페이지의 실제 주소 스타일 */}
              {/* <Route path="viewer/:novelId/:episodeId" element={<NovelViewer />} /> */}
              {/* 디버그를 위한 작품 상세 페이지 */}
              <Route path="detail" element={<NovelEpisodeList />} />
              {/* 디버그를 위한 에피소드 뷰어 페이지 */}
              <Route path="" element={<NovelEpisodeViewer />} />
            </Route>
          </Route>

          {/* Sidebar Layout */}
          <Route element={<SidebarLayout />}>
            <Route path="/novel/edit">
              <Route path="background" element={<NovelBackgroundEditor />} />
              {/* 작품 회차 수정 페이지의 실제 주소 스타일일 */}
              <Route path="episode/:episodeId" element={<NovelEpisodeEditor />} />
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
