import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Container } from '@mui/material'
import theme from './styles/theme'
import Navbar from './components/Navbar'
import Login from './pages/Login'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth={false} disableGutters>
          <Routes>
            <Route path="/login" element={<Login />} />
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
