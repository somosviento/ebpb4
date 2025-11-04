import { useEffect, useState, useCallback } from 'react'
import { SolicitudOut } from '../models'
import { useApiClient } from '../api/client'
import { useNotifications } from '../context/NotificationContext'
import { saveLastSolicitud } from '../utils/storage'

export function useSolicitudDetalle(id?: string) {
  const { request } = useApiClient()
  const { push } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SolicitudOut | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSolicitud = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await request<SolicitudOut>(`/api/solicitudes/${id}`)
      saveLastSolicitud(res.id, res.tipo_solicitud)
      setData(res)
    } catch (e) {
      setError('No se pudo cargar la solicitud')
      push({ type: 'error', message: 'Error cargando solicitud', autoCloseMs: 4000 })
    } finally {
      setLoading(false)
    }
  }, [id, request, push])

  useEffect(() => { fetchSolicitud() }, [fetchSolicitud])

  return { solicitud: data, loading, error, refetch: fetchSolicitud }
}
