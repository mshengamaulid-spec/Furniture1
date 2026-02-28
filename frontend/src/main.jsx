import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const envApiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_TARGET || ''
const vercelFallback =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app')
    ? 'https://furniture-backend-gfjq.onrender.com'
    : ''
const apiBaseUrl = (envApiBase || vercelFallback)
  .replace(/\/$/, '')
  .replace(/\/api$/, '')
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
