import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import DiscussionRoom from './pages/DiscussionRoom'
import DiscussionSummary from './pages/DiscussionSummary'
import NavbarLayout from '/src/components/layout/NavbarLayout'
import SidebarLayout from '/src/components/layout/SidebarLayout'
import { AuthProvider } from '/src/hooks/useAuth'
import ChangeUserInfo from '/src/pages/ChangeUserInfo'
import FindId from '/src/pages/FindId'
import FindPassword from '/src/pages/FindPassword'
import Login from '/src/pages/Login'
import LoginSuccess from '/src/pages/LoginSuccess'
// import MyPage from '/src/pages/MyPage'
import NotFound from '/src/pages/NotFound'
import NovelBackgroundEditor from '/src/pages/NovelBackgroundEditor'
import NovelEditor from '/src/pages/NovelEditor'
import NovelEpisodeEditor from '/src/pages/NovelEpisodeEditor'
import NovelEpisodeList from '/src/pages/NovelEpisodeList'
import NovelEpisodeViewer from '/src/pages/NovelEpisodeViewer'
import NovelList from '/src/pages/NovelList'
import ResetPassword from '/src/pages/ResetPassword'
import SignUp from '/src/pages/SignUp'
import theme from '/src/styles/theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Navbar Layout */}
            <Route element={<NavbarLayout />}>
              {/* Auth routes */}
              <Route path="/" element={<NovelList />} />
              <Route path="/auth">
                <Route path="login" element={<Login />} />
                <Route path="login-success" element={<LoginSuccess />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="find-id" element={<FindId />} />
                <Route path="find-password" element={<FindPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                {/* <Route path="mypage" element={<MyPage />} /> */}
                <Route path="change-info" element={<ChangeUserInfo />} />
              </Route>

              {/* 실제 프로덕션용 라우트 */}
              <Route path="/novel">
                <Route path="" element={<NovelList />} />
                <Route path=":novelId" element={<NovelEpisodeList />} />
                <Route path=":novelId/:episodeId" element={<NovelEpisodeViewer />} />
                <Route path="edit/:novelId" element={<NovelEditor />} />
              </Route>

              {/* 디버그용 라우트 */}
              <Route path="/debug/viewer/1" element={<NovelEpisodeList />} />
              <Route path="/debug/viewer" element={<NovelEpisodeViewer />} />
            </Route>

            {/* Sidebar Layout */}
            <Route element={<SidebarLayout />}>
              <Route path="/discussion">
                <Route path=":discussionId" element={<DiscussionRoom />} />
                <Route path=":discussionId/summary" element={<DiscussionSummary />} />
              </Route>

              <Route path="/novel/edit">
                <Route path="background" element={<NovelBackgroundEditor />} />
                <Route path="episode/:episodeId" element={<NovelEpisodeEditor />} />
              </Route>

              {/* 디버그용 라우트 */}
              <Route path="/debug">
                <Route path="discussion" element={<DiscussionRoom />} />
                <Route path="summary" element={<DiscussionSummary />} />
              </Route>
            </Route>

            {/* Not Found Page - 모든 정의되지 않은 경로에 대해 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
