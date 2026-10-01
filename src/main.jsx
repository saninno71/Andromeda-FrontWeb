import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
import App from './components/App.jsx'
import { iniciarDiagnosticoNavegacion } from './diagnosticoNavegacion.js'

iniciarDiagnosticoNavegacion()

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <App />
  // </StrictMode>,

  <App />
  
)
