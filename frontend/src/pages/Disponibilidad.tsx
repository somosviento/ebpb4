import { useState, useEffect } from 'react'
import { useApiClient } from '../api/client'
import { ReservaDiariaOut } from '../models'
import { useNotifications } from '../context/NotificationContext'

export default function Disponibilidad() {
  const { request } = useApiClient()
  const { push } = useNotifications()
  const [fecha, setFecha] = useState<string>('')
  const [data, setData] = useState<ReservaDiariaOut | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fecha) return
    let isCancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const d = await request<ReservaDiariaOut>(`/api/reservas/disponibilidad/${fecha}`)
        if (!isCancelled) setData(d)
      } catch (e) {
        if (!isCancelled) {
          setError('No se pudo obtener disponibilidad')
          push({ type: 'error', message: 'Error consultando disponibilidad', autoCloseMs: 3000 })
        }
      } finally {
        if (!isCancelled) setLoading(false)
      }
    })()
    return () => { isCancelled = true }
  }, [fecha, request, push])

  return (
    <div>
      <h1>Disponibilidad Pernocte</h1>
      <div className="card p-3">
        <div className="mb-2">
          <label className="form-label" htmlFor="fecha-disponibilidad">Fecha</label>
          <input id="fecha-disponibilidad" className="form-control" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        {!fecha && <p className="text-secondary">Seleccione una fecha.</p>}
        {loading && <p>Consultando...</p>}
        {error && <p className="text-danger">{error}</p>}
        {data && !loading && (
          <div className="mt-2">
            <p><strong>Fecha:</strong> {data.fecha}</p>
            <p><strong>Ocupadas:</strong> {data.plazas_pernocte_ocupadas}</p>
              <p><strong>Disponibles:</strong> {data.plazas_pernocte_disponibles}</p>
          </div>
        )}
      </div>
    </div>
  )
}
