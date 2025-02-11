import React from 'react'
import JoinForm from './components/JoinForm'
import DebateRoom from './components/DebateRoom'
import { useOpenVidu } from './hooks/useOpenVidu'

const App = () => {
  const {
    session,
    publisher,
    subscribers,
    roomName,
    userName,
    joinRoom,
    leaveRoom
  } = useOpenVidu()

  return (
    <div className="App">
      {!session ? (
        <JoinForm onJoin={joinRoom} />
      ) : (
        <DebateRoom
          session={session}
          publisher={publisher}
          subscribers={subscribers}
          roomName={roomName}
          userName={userName}
          onLeave={leaveRoom}
        />
      )}
    </div>
  )
}

export default App
