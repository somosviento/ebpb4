import { ReactNode, useEffect, useState } from 'react'
import logo5Url from '../../img/logo5.png'
import logoEbpbUrl from '../../img/logo_ebpb.png'
import logoWebUrl from '../../img/logo-web.png'
import NotificationCenter from './NotificationCenter'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLastSolicitudId } from '../utils/storage'

export default function Layout({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth()
  const nav = useNavigate()
  const [lastId, setLastId] = useState<number | null>(null)
  useEffect(() => { setLastId(getLastSolicitudId()) }, [])
  const doLogout = () => { logout(); nav('/login') }
  return (
    <div className="bg-light min-vh-100">
      <header className="navbar navbar-expand-md navbar-dark app-navbar shadow-sm">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img src={logo5Url} alt="Logo 5" className="me-2" style={{ height: '32px' }} />
            <img src={logoEbpbUrl} alt="EBPB Logo" className="me-2" style={{ height: '32px' }} />
            <span className="fw-semibold">EBPB4</span>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item"><NavLink className={({isActive}) => `nav-link${isActive ? ' active' : ''}`} to="/acerca-de">Acerca de</NavLink></li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="reservaMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Cargar nueva reserva
                </a>
                <ul className="dropdown-menu" aria-labelledby="reservaMenu">
                  <li><NavLink className={({isActive}) => `dropdown-item${isActive ? ' active' : ''}`} to="/solicitudes/nueva/catedras">Cátedra</NavLink></li>
                  <li><NavLink className={({isActive}) => `dropdown-item${isActive ? ' active' : ''}`} to="/solicitudes/nueva/investigacion">Equipo de Investigación</NavLink></li>
                </ul>
              </li>
              {token && (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="adminMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Admin
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="adminMenu">
                    <li><NavLink className={({isActive}) => `dropdown-item${isActive ? ' active' : ''}`} to="/admin">Inicio</NavLink></li>
                    <li><NavLink className={({isActive}) => `dropdown-item${isActive ? ' active' : ''}`} to="/admin/reservas">Reservas</NavLink></li>
                  </ul>
                </li>
              )}
              {/* {lastId && (
                <li className="nav-item">
                  <NavLink className={({isActive}) => `nav-link${isActive ? ' active' : ''}`} to={`/solicitudes/${lastId}`}>Última Solicitud #{lastId}</NavLink>
                </li>
              )} */}
            </ul>
            <div className="d-flex">
              {token ? (
                <button type="button" className="btn btn-light btn-sm" onClick={doLogout}><i className="bi bi-box-arrow-right me-1"></i>Salir</button>
              ) : (
                <NavLink to="/login" className="nav-link">Iniciar Sesión</NavLink>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container py-3">
        {children}
      </main>
      <footer className="footer mt-auto">
        <div className="container d-flex justify-content-between align-items-center">
          <img src={logoWebUrl} alt="Logo Web" style={{ height: '70px' }} />
          <div className="text-muted">© 2025 - Todos los derechos reservados</div>
        </div>
      </footer>
      <NotificationCenter />
    </div>
  )
}
