import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'

import { Container, CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'

import Navbar from '/src/components/common/Navbar'
import FindId from '/src/pages/FindId'
import FindPassword from '/src/pages/FindPassword'
import Login from '/src/pages/Login'
import SignUp from '/src/pages/SignUp'
import theme from '/src/styles/theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth={false} disableGutters>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/find-id" element={<FindId />} />
            <Route path="/find-password" element={<FindPassword />} />
            <Route path="/editor" element={<div>AI소설 에디터</div>} />
            <Route path="/community" element={<div>그룹 토론</div>} />
            <Route path="/novels" element={<div>소설 게시판</div>} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  )
}

export default App
