import React from 'react'
import { useApiClient } from '../api/client'

type ReservaAdminItem = {
  id: number
  fecha: string
  es_diurno: boolean
  es_pernocte: boolean
  participante: { id: number; apellido: string; nombres: string; dni: string }
  solicitud: { id: number; tipo_solicitud: string }
}

type ReservaAdminListOut = {
  total: number
  limit: number
  offset: number
  items: ReservaAdminItem[]
}

export default function AdminReservas() {
  const { request } = useApiClient()
  const [items, setItems] = React.useState<ReservaAdminItem[]>([])
  const [total, setTotal] = React.useState(0)
  const [limit, setLimit] = React.useState(25)
  const [offset, setOffset] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [filters, setFilters] = React.useState({
    fecha_desde: '',
    fecha_hasta: '',
    es_diurno: '',
    es_pernocte: '',
    participante_dni: '',
    participante_apellido: '',
    solicitud_id: '',
  })

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (filters.fecha_desde) params.set('fecha_desde', filters.fecha_desde)
    if (filters.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta)
    if (filters.es_diurno) params.set('es_diurno', filters.es_diurno)
    if (filters.es_pernocte) params.set('es_pernocte', filters.es_pernocte)
    if (filters.participante_dni) params.set('participante_dni', filters.participante_dni)
    if (filters.participante_apellido) params.set('participante_apellido', filters.participante_apellido)
    if (filters.solicitud_id) params.set('solicitud_id', filters.solicitud_id)
    params.set('limit', String(limit))
    params.set('offset', String(offset))
    try {
      const res = await request<ReservaAdminListOut>(`/api/admin/reservas?${params.toString()}`)
      setItems(res.items)
      setTotal(res.total)
    } catch (e: any) {
      const msg = e?.message || 'Error al cargar reservas'
      setError(msg)
      setItems([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters, limit, offset, request])

  React.useEffect(() => { load() }, [load])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setOffset(0) // reset page on filter change
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    setFilters({ fecha_desde: '', fecha_hasta: '', es_diurno: '', es_pernocte: '', participante_dni: '', participante_apellido: '', solicitud_id: '' })
    setOffset(0)
  }

  const del = async (id: number) => {
    if (!confirm('¿Eliminar reserva seleccionada?')) return
    await request(`/api/admin/participantes-reservas/${id}`, { method: 'DELETE' })
    load()
  }

  const page = Math.floor(offset / limit) + 1
  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <h2 className="h5 m-0">Reservas (Admin)</h2>
          <div>
            <button className="btn btn-sm btn-outline-secondary me-2" onClick={clearFilters}>Limpiar</button>
            <button className="btn btn-sm btn-primary" onClick={load} disabled={loading}>{loading ? 'Cargando…' : 'Actualizar'}</button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-2">
            <label htmlFor="fDesde" className="form-label">Desde</label>
            <input id="fDesde" name="fecha_desde" type="date" className="form-control" value={filters.fecha_desde} onChange={onChange} />
          </div>
          <div className="col-6 col-md-2">
            <label htmlFor="fHasta" className="form-label">Hasta</label>
            <input id="fHasta" name="fecha_hasta" type="date" className="form-control" value={filters.fecha_hasta} onChange={onChange} />
          </div>
          <div className="col-6 col-md-2">
            <label htmlFor="fDiurno" className="form-label">Diurno</label>
            <select id="fDiurno" name="es_diurno" className="form-select" value={filters.es_diurno} onChange={onChange}>
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label htmlFor="fPernocte" className="form-label">Pernocte</label>
            <select id="fPernocte" name="es_pernocte" className="form-select" value={filters.es_pernocte} onChange={onChange}>
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          {/* <div className="col-6 col-md-2">
            <label htmlFor="fDni" className="form-label">DNI</label>
            <input id="fDni" name="participante_dni" className="form-control" value={filters.participante_dni} onChange={onChange} />
          </div> */}
          {/* <div className="col-6 col-md-2">
            <label htmlFor="fApe" className="form-label">Apellido</label>
            <input id="fApe" name="participante_apellido" className="form-control" value={filters.participante_apellido} onChange={onChange} />
          </div> */}
          {/* <div className="col-6 col-md-2">
            <label htmlFor="fSol" className="form-label">Solicitud ID</label>
            <input id="fSol" name="solicitud_id" type="number" className="form-control" value={filters.solicitud_id} onChange={onChange} />
          </div> */}
          {/* <div className="col-6 col-md-2">
            <label htmlFor="fLimit" className="form-label">Por página</label>
            <select id="fLimit" className="form-select" value={limit} onChange={e => { setOffset(0); setLimit(parseInt(e.target.value || '25', 10)) }}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div> */}
        </div>

        <div className="table-responsive">
          <table className="table table-sm table-striped align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Diurno</th>
                <th>Pernocte</th>
                <th>Participante</th>
                <th>DNI</th>
                <th>Solicitud</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}>
                  <td>{new Date(it.fecha).toLocaleDateString()}</td>
                  <td>{it.es_diurno ? 'Sí' : 'No'}</td>
                  <td>{it.es_pernocte ? 'Sí' : 'No'}</td>
                  <td>{it.participante.apellido}, {it.participante.nombres}</td>
                  <td>{it.participante.dni}</td>
                  <td>#{it.solicitud.id} ({it.solicitud.tipo_solicitud})</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-danger" onClick={() => del(it.id)} title="Eliminar"><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td colSpan={7} className="text-center text-muted">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <div className="text-muted small">Total: {total}</div>
          <div className="btn-group">
            <button className="btn btn-sm btn-outline-secondary" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Anterior</button>
            <span className="btn btn-sm btn-outline-secondary disabled">Página {page} / {pages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  )
}
