import PropTypes from 'prop-types'

import { Button } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)({
  backgroundColor: '#FFA726',
  color: 'white',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: '#FB8C00',
  },
})

const PrimaryButton = ({ children, ...props }) => {
  return (
    <StyledButton variant="contained" {...props}>
      {children}
    </StyledButton>
  )
}

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
}

export default PrimaryButton
