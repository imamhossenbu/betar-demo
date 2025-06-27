import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import AuthProvider from './provider/AuthProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  </AuthProvider>
)
