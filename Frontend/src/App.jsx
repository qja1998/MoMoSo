import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import DiscussionRoom from './pages/DiscussionRoom'
import DiscussionSummary from './pages/DiscussionSummary'
import NavbarLayout from '/src/components/layout/NavbarLayout'
import SidebarLayout from '/src/components/layout/SidebarLayout'
import { AuthProvider } from '/src/hooks/useAuth'
import UserChangeInfo from '/src/pages/UserChangeInfo'
import UserFindId from '/src/pages/UserFindId'
import UserFindPassword from '/src/pages/UserFindPassword'
import UserLogin from '/src/pages/UserLogin'
import UserLoginSuccess from '/src/pages/UserLoginSuccess'
import UserResetPassword from '/src/pages/UserResetPassword'
// import MyPage from '/src/pages/MyPage'
import NotFound from '/src/pages/NotFound'
import NovelBackgroundEditor from '/src/pages/NovelBackgroundEditor'
import NovelEditor from '/src/pages/NovelEditor'
import NovelEditorNovelDetail from '/src/pages/NovelEditorNovelDetail'
import NovelEditorEpisode from '/src/pages/NovelEditorEpisode'
import NovelEpisodeList from '/src/pages/NovelEpisodeList'
import NovelEpisodeViewer from '/src/pages/NovelEpisodeViewer'
import NovelList from '/src/pages/NovelList'
import UserSignUp from '/src/pages/UserSignUp'
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
                <Route path="login" element={<UserLogin />} />
                <Route path="login-success" element={<UserLoginSuccess />} />
                <Route path="signup" element={<UserSignUp />} />
                <Route path="find-id" element={<UserFindId />} />
                <Route path="find-password" element={<UserFindPassword />} />
                <Route path="reset-password" element={<UserResetPassword />} />
                {/* <Route path="mypage" element={<MyPage />} /> */}
                <Route path="change-info" element={<UserChangeInfo />} />
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

            {/* 실제 프로덕션용 라우트 */}
            <Route path="/novel">
              <Route path=":novelId" element={<NovelEpisodeList />} />
              <Route path=":novelId/:episodeId" element={<NovelEpisodeViewer />} />
            </Route>
            {/* Sidebar Layout */}
            <Route element={<SidebarLayout />}>
            <Route path="/novel/edit" element={<NovelEditor />} />
            <Route path="/novel/edit/episodelist/:novelId" element={<NovelEditorNovelDetail />} />
              <Route path="/discussion">
                <Route path=":discussionId" element={<DiscussionRoom />} />
                <Route path=":discussionId/summary" element={<DiscussionSummary />} />
              </Route>

              <Route path="/novel/edit">
                <Route path="background" element={<NovelBackgroundEditor />} />
                <Route path="background/:novelId" element={<NovelBackgroundEditor />} />
                <Route path="episode/:novelId" element={<NovelEditorEpisode />} />
                <Route path="episode/:novelId/:episodeId" element={<NovelEditorEpisode />} />
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
