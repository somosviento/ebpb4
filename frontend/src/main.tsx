import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <style>{`@keyframes spin {from {transform: rotate(0deg);} to {transform: rotate(360deg);} }`}</style>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
