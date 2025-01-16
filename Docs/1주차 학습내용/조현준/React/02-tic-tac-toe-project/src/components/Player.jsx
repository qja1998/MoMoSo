import { useState } from 'react'

export default function Player({ initialName, symbol, isActive, onChangeName }) {
  const [playerName, setPlayerName] = useState(initialName)
  const [isEditing, setIsEditing] = useState(false)

  function handleClickEdit() {
    setIsEditing((editing) => !editing)

    if (isEditing) {
      onChangeName(symbol, playerName)
    }
  }

  function handleInputChange(event) {
    setPlayerName(event.target.value)
  }

  let nameDisplay = <span className="player-name">{playerName}</span>

  if (isEditing) {
    nameDisplay = <input type="text" required value={playerName} onChange={handleInputChange} />
  }

  return (
    <li className={isActive ? 'active' : undefined}>
      <span className="player">
        {nameDisplay}
        <span className="player-symbol">{symbol}</span>
      </span>
      <button onClick={handleClickEdit}>{isEditing ? 'Save' : 'Edit'}</button>
    </li>
  )
}
