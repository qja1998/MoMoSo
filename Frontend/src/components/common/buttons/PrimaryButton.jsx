import PropTypes from 'prop-types'

import { Button } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)(({ bgColor, textColor, hoverBgColor }) => ({
  fontWeight: 500,
  fontSize: '1rem',
  width: 'fit-content',
  height: 'auto',
  borderRadius: 8,
  backgroundColor: bgColor,
  color: textColor,
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: hoverBgColor,
  },
  '&.MuiButton-fullWidth': {
    width: '100%',
  },
}))

const PrimaryButton = ({
  children,
  startIcon,
  backgroundColor = '#FFA000',
  color = 'white',
  hoverBackgroundColor = '#FF8F00',
  ...props
}) => {
  return (
    <StyledButton
      variant="contained"
      startIcon={startIcon}
      bgColor={backgroundColor}
      textColor={color}
      hoverBgColor={hoverBackgroundColor}
      {...props}
    >
      {children}
    </StyledButton>
  )
}

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  startIcon: PropTypes.node,
  backgroundColor: PropTypes.string,
  color: PropTypes.string,
  hoverBackgroundColor: PropTypes.string,
}

export default PrimaryButton
