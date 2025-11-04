import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { SolicitudParticipanteOut, ParticipanteReservaOut, ParticipanteCreate } from '../models'
import ParticipanteForm from '../components/ParticipanteForm'
import { useAuth } from '../context/AuthContext'
import { useSolicitudDetalle } from '../hooks/useSolicitudDetalle'
import { useAdminParticipanteReservas } from '../hooks/useAdminParticipanteReservas'
import { useApiClient } from '../api/client'
import { useNotifications } from '../context/NotificationContext'

export default function SolicitudDetalle() {
  const { id } = useParams()
  const { push } = useNotifications()
  const { token } = useAuth()
  const { request } = useApiClient()
  const { solicitud, loading, error, refetch } = useSolicitudDetalle(id)
  const [adding, setAdding] = useState(false)
  const emptyParticipante: ParticipanteCreate = {
    apellido: '',
    nombres: '',
    dni: '',
    reservas_detalladas: [],
  }
  const [nuevoPart, setNuevoPart] = useState<ParticipanteCreate>(emptyParticipante)
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  if (loading) return <div>Cargando...</div>
  if (error) return <div>{error}</div>
  if (!solicitud) return <div>No encontrada</div>

  const participantes: SolicitudParticipanteOut[] = solicitud.participantes || []

  async function onSubmitNuevo(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)
    setValidationErrors({})
    try {
      await request(`/api/admin/solicitudes/${id}/participantes`, { method: 'POST', body: nuevoPart })
      push({ type: 'success', message: 'Participante agregado', autoCloseMs: 3000 })
      setNuevoPart(emptyParticipante)
      setAdding(false)
      await refetch()
    } catch (err: any) {
      if (err?.validation) {
        setValidationErrors(err.validation)
      } else {
        push({ type: 'error', message: err.message || 'Error agregando participante', autoCloseMs: 4000 })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Solicitud #{solicitud.id}</h1>
      <section className="card p-3 mb-3">
        <h2 className="h5 mb-3">Datos Generales</h2>
        <div className="row row-cols-1 row-cols-md-2 g-2">
          <div><strong>Tipo:</strong> {solicitud.tipo_solicitud}</div>
          <div><strong>Inicio:</strong> {solicitud.fecha_inicio_actividad_general}</div>
          <div><strong>Fin:</strong> {solicitud.fecha_fin_actividad_general}</div>
          <div className="col-12"><strong>Responsable:</strong> {solicitud.responsable_apellido_nombre} ({solicitud.responsable_dni})</div>
          <div className="col-12"><strong>Email:</strong> {solicitud.responsable_email_principal}</div>
          <div className="col-12"><strong>Objetivos:</strong> {solicitud.objetivos}</div>
          <div className="col-12"><strong>Actividades:</strong> {solicitud.actividades}</div>
        </div>
      </section>
      <section className="mb-3">
        <h2 className="h5 mb-2">Participantes ({participantes.length})</h2>
        {participantes.length === 0 && <div className="text-secondary">No hay participantes.</div>}
        {participantes.map((p) => (
          <div key={p.id} className="card p-3 mb-3">
            <ParticipanteForm
              value={{
                apellido: p.apellido,
                nombres: p.nombres,
                dni: p.dni,
                rol: p.rol || undefined,
                reservas_detalladas: [],
              }}
              onChange={() => { /* readonly */ }}
              readOnly
              showReservas={false}
            />
            {token && (
              <ParticipanteReservasAdmin
                participanteId={p.id}
                reservas={p.participante_reservas || []}
                onChanged={refetch}
              />
            )}
          </div>
        ))}
        {token && (
          <div className="pt-3 border-top">
            {!adding && (
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setAdding(true)}>
                <i className="bi bi-person-plus me-1"/>Agregar participante
              </button>
            )}
            {adding && (
              <form onSubmit={onSubmitNuevo} className="mt-2">
                <ParticipanteForm
                  value={nuevoPart}
                  onChange={setNuevoPart}
                  showReservas={true}
                />
                {Object.keys(validationErrors).length > 0 && (
                  <div className="text-danger small mb-2">
                    {Object.entries(validationErrors).map(([k, msgs]) => (
                      <div key={k}>{k}: {msgs.join(', ')}</div>
                    ))}
                  </div>
                )}
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setAdding(false); setNuevoPart(emptyParticipante); }}>Cancelar</button>
                </div>
              </form>
            )}
          </div>
        )}
      </section>
      {/* Acciones admin se agregarán más adelante */}
    </div>
  )
}

interface ParticipanteReservasAdminProps {
  participanteId: number
  reservas: ParticipanteReservaOut[]
  onChanged: () => void
}

function ParticipanteReservasAdmin({ participanteId, reservas, onChanged }: ParticipanteReservasAdminProps) {
  const hook = useAdminParticipanteReservas(participanteId, onChanged)
  const { adding, editingId, fecha, esDiurno, esPernocte, submitting, setFecha, setEsDiurno, setEsPernocte, startAdd, startEdit, submit, onDelete, resetForm } = hook
  return (
    <div className="border-top pt-2">
      <strong>Reservas</strong>
      {reservas.length === 0 && <div className="text-secondary">No hay reservas.</div>}
      {reservas.length > 0 && (
        <table className="table table-sm align-middle mt-2">
          <thead>
            <tr>
              <th className="text-start">Fecha</th>
              <th className="text-center">Diurno</th>
              <th className="text-center">Pernocte</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id}>
                <td>{r.fecha}</td>
                <td className="text-center">{r.es_diurno ? '✔' : ''}</td>
                <td className="text-center">{r.es_pernocte ? '✔' : ''}</td>
                <td className="text-end">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => startEdit(r)}>Editar</button>
                  <button type="button" className="btn btn-outline-danger btn-sm ms-2" onClick={() => onDelete(r.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!adding && (
        <div className="mt-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => startAdd()}>Agregar reserva</button>
        </div>
      )}
      {adding && (
        <form onSubmit={submit} className="mt-2 bg-light p-2 rounded">
          <div className="mb-2">
            <label className="form-label" htmlFor={`fecha-${participanteId}`}>Fecha</label>
            <input id={`fecha-${participanteId}`} className="form-control" type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
          </div>
          <div className="form-check form-check-inline">
            <input id={`diurno-${participanteId}`} className="form-check-input" type="checkbox" checked={esDiurno} onChange={e => setEsDiurno(e.target.checked)} />
            <label className="form-check-label" htmlFor={`diurno-${participanteId}`}>Diurno</label>
          </div>
          <div className="form-check form-check-inline">
            <input id={`pernocte-${participanteId}`} className="form-check-input" type="checkbox" checked={esPernocte} onChange={e => setEsPernocte(e.target.checked)} />
            <label className="form-check-label" htmlFor={`pernocte-${participanteId}`}>Pernocte</label>
          </div>
          <div className="mt-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>{submitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}</button>
            <button type="button" className="btn btn-secondary btn-sm ms-2" onClick={() => resetForm()}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  )
}
