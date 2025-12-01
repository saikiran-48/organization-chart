import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { makeServer } from './server/mirage.ts'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes.tsx'

// Initialize mock API server in development
if (import.meta.env.DEV) {
  makeServer()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)