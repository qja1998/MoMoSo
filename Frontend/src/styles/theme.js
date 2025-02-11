import { createTheme } from '@mui/material/styles'

import '/src/styles/fonts/pretendardvariable.css'

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
      styleOverrides: `
        @font-face {
          font-family: 'Pretendard Variable';
          font-weight: 45 920;
          font-style: normal;
          font-display: swap;
          src: url('./fonts/woff2/PretendardVariable.woff2') format('woff2-variations');
        }
      `,
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
