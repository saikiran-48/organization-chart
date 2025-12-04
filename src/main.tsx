import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { makeServer } from './server/mirage.ts'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes.tsx'

// Initialize mock API server (needed for both dev and production since we have no real backend)
makeServer()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/organization-chart">
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)