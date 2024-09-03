import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import AgentMovements from './AgentMovements.jsx'
import SSEComponent from './SSEComponent.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
    {/* <SSEComponent/> */}
  </StrictMode>,
)
