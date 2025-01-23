import logoImg from '../assets/investment-calculator-logo.png'

function Header() {
  return (
    <header id="header">
      <img
        src={logoImg}
        alt="Investment calculator logo"
      />
      <h1>React Investment Calculator</h1>
    </header>
  )
}

export default Header
