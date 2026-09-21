import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TarefaAtivaProvider } from './context/TarefaAtivaContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TarefaAtivaProvider>
      <App />
    </TarefaAtivaProvider>
  </StrictMode>,
)
