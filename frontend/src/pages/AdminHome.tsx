import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function AdminHome() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <h1>Área Admin</h1>
      <p>Autenticado con token: {token ? 'sí' : 'no'}</p>
      <div className="mb-3">
        <Link to="/admin/reservas" className="btn btn-primary btn-sm me-2">Ver Reservas</Link>
      </div>
      <button onClick={doLogout}>Salir</button>
    </div>
  )
}
