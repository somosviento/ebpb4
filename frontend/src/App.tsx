import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminHome from './pages/AdminHome'
import AdminReservas from './pages/AdminReservas'
import AcercaDe from './pages/AcercaDe'
import SolicitudInvestigacionNueva from './pages/SolicitudInvestigacionNueva'
import SolicitudDetalle from './pages/SolicitudDetalle'
import SolicitudCatedrasNueva from './pages/SolicitudCatedrasNueva'
import Disponibilidad from './pages/Disponibilidad'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import { useEffect, useState } from 'react'
import { useNotifications } from './context/NotificationContext'
import { useLocation, useNavigate } from 'react-router-dom'

// Simple global fetch interceptor pattern via window.fetch patch (minimalistic)
function useGlobalApiErrors() {
  const { push } = useNotifications()
  const { logout, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const BASE = (import.meta as any).env?.BASE_URL || '/'
  const REDIRECT_KEY = `${String(BASE).replace(/\/$/, '') || '/'}:postLoginRedirect`
  useEffect(() => {
    const original = window.fetch
    window.fetch = async (...args) => {
  const currentPath = location.pathname + location.search + location.hash
      let res: Response
      try {
        res = await original(...(args as Parameters<typeof fetch>))
      } catch (e) {
        push({ type: 'error', message: 'Error de red', autoCloseMs: 4000 })
        throw e
      }
      if (!res.ok) {
        if (res.status === 401) {
          // Guardar ruta previa sólo si había token (sesión expirada / invalida)
            if (token) {
            try { sessionStorage.setItem(REDIRECT_KEY, currentPath) } catch { /* ignore */ }
            logout()
            push({ type: 'error', message: 'Sesión expirada. Ingresá nuevamente.', autoCloseMs: 5000 })
            navigate('/login', { replace: true })
          } else {
            push({ type: 'error', message: 'No autorizado (401)', autoCloseMs: 4000 })
          }
        } else if (res.status === 422) {
          push({ type: 'error', message: 'Error de validación (422)', autoCloseMs: 4000 })
        } else {
          push({ type: 'error', message: `Error HTTP ${res.status}`, autoCloseMs: 4000 })
        }
      }
      return res
    }
    return () => { window.fetch = original }
  }, [push, logout, token, location, navigate])
}

function GlobalApiErrorsInstaller() {
  // mount global fetch interceptor only after providers are in place
  useGlobalApiErrors()
  return null
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ErrorBoundary>
          <GlobalApiErrorsInstaller />
          {children}
        </ErrorBoundary>
      </AuthProvider>
    </NotificationProvider>
  )
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  // Detección de cambio de OpenAPI: comparamos hash generado en build con último almacenado en localStorage
  const [openapiChanged, setOpenapiChanged] = useState(false)
  useEffect(() => {
    let currentHash: string | undefined
    try {
      // import dinámico para permitir HMR sin fallar si no existe
      // @ts-ignore - archivo generado por script
      const meta = require('./openapi-hash.json') as { hash?: string }
      currentHash = meta.hash
    } catch { /* ignore */ }
    if (!currentHash) return
    try {
      const stored = localStorage.getItem('openapiHash')
      if (stored && stored !== currentHash) {
        setOpenapiChanged(true)
      }
      if (!stored || stored !== currentHash) {
        localStorage.setItem('openapiHash', currentHash)
      }
    } catch { /* ignore storage */ }
  }, [])
  return (
    <Providers>
      <Layout>
        {openapiChanged && (
          <div style={{background:'#ffe08a', padding:8, border:'1px solid #e0b000', marginBottom:12}} role="alert">
            Nueva versión del esquema backend detectada. Refrescá tipos (npm run gen:types & npm run gen:openapi-hash) y verificá formularios.
          </div>
        )}
        <Routes>
          <Route path="/" element={<AcercaDe />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/solicitudes/nueva/investigacion" element={<SolicitudInvestigacionNueva />} />
            <Route path="/solicitudes/nueva/catedras" element={<SolicitudCatedrasNueva />} />
          <Route path="/solicitudes/:id" element={<SolicitudDetalle />} />
          <Route path="/disponibilidad" element={<Disponibilidad />} />
          <Route path="/acerca-de" element={<AcercaDe />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reservas"
            element={
              <ProtectedRoute>
                <AdminReservas />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Providers>
  )
}
