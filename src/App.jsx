import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import './style/variable.css'
import AuthPage from './features/auth/pages/AuthPage.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthPage />
    </>
  )
}

export default App
