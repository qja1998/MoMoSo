import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#FFA726',
      light: '#FFB74D',
      dark: '#FB8C00',
    },
    background: {
      default: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Pretendard Variable", system-ui, -apple-system, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': {
          fontFamily: 'Pretendard Variable',
          fontStyle: 'normal',
          fontWeight: '45 920',
          src: `local('Pretendard Variable'), url('@/styles/fonts/PretendardVariable.ttf') format('truetype')`,
          fontDisplay: 'swap',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
  },
})

export default theme
