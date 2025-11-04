import { FormEvent, ChangeEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApiClient } from '../api/client'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()
  const apiClient = useApiClient()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    const trimmedUser = username.trim()
    const trimmedPass = password.trim()
    
    if (trimmedUser.length === 0 || trimmedPass.length === 0) {
      setError('Por favor ingrese usuario y contraseña')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await apiClient.request<{ token: string; message: string }>('/api/login', {
        method: 'POST',
        body: {
          username: trimmedUser,
          password: trimmedPass
        }
      })
      
      login(response.token)
      
      let target = '/admin/reservas'
      try {
        const stored = sessionStorage.getItem('postLoginRedirect')
        if (stored) {
          target = stored
          sessionStorage.removeItem('postLoginRedirect')
        }
      } catch { /* ignore */ }
      
      navigate(target, { replace: true })
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
      setLoading(false)
    }
  }

  return (
    <div className="container py-3" style={{ maxWidth: 480 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h2 className="m-0">Iniciar Sesión</h2>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label className="form-label" htmlFor="username">Usuario</label>
              <input
                className="form-control"
                id="username"
                type="text"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                className="form-control"
                id="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
