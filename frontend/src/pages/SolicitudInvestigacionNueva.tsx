import { FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiClient, ApiError } from '../api/client'
import { SolicitudInvestigacionCreate, ParticipanteCreate } from '../models'
import { saveLastSolicitud } from '../utils/storage'
import ParticipanteForm from '../components/ParticipanteForm'
import { useNotifications } from '../context/NotificationContext'
import { validateSolicitudInvestigacion } from '../utils/validateSolicitud'
import Spinner from '../components/Spinner'

type FormState = Omit<SolicitudInvestigacionCreate, 'tipo_solicitud'> & { tipo_solicitud?: 'investigacion' }

const emptyIntegrante = (): ParticipanteCreate => ({
  apellido: '',
  nombres: '',
  dni: '',
  reservas_detalladas: [],
})

export default function SolicitudInvestigacionNueva() {
  const { request } = useApiClient()
  const nav = useNavigate()
  const { push } = useNotifications()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [showOpcionales, setShowOpcionales] = useState(false)

  const [form, setForm] = useState<FormState>({
    responsable_apellido_nombre: '',
    responsable_dni: '',
    responsable_email_principal: '',
    fecha_inicio_actividad_general: '',
    fecha_fin_actividad_general: '',
    objetivos: '',
    actividades: '',
    integrantes: [emptyIntegrante()],
    // opcionales omitidos inicialmente
  })

  // Opciones de clonación de reservas
  const [cloneMode, setCloneMode] = useState<'todos' | 'diurno' | 'pernocte'>('todos')
  const [cloneFromDate, setCloneFromDate] = useState<string>('')
  const [cloneToDate, setCloneToDate] = useState<string>('')

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateIntegrante(index: number, patch: Partial<ParticipanteCreate>) {
    setForm((f) => ({
      ...f,
      integrantes: f.integrantes.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }))
  }

  function addIntegrante() {
    setForm((f) => ({ ...f, integrantes: [...f.integrantes, emptyIntegrante()] }))
  }

  function removeIntegrante(i: number) {
    setForm((f) => ({ ...f, integrantes: f.integrantes.filter((_, idx) => idx !== i) }))
  }

  function cloneReservasFromFirst() {
    setForm((f) => {
      if (f.integrantes.length <= 1) return f
      const source = f.integrantes[0].reservas_detalladas || []
      const filtered = source.filter(r => {
        const inMode = cloneMode === 'todos' || (cloneMode === 'diurno' && r.es_diurno) || (cloneMode === 'pernocte' && r.es_pernocte)
        const inFrom = !cloneFromDate || r.fecha >= cloneFromDate
        const inTo = !cloneToDate || r.fecha <= cloneToDate
        return inMode && inFrom && inTo
      })
      const cloned = filtered.map(r => ({ fecha: r.fecha, es_diurno: !!r.es_diurno, es_pernocte: !!r.es_pernocte }))
      const next = f.integrantes.map((it, idx) => idx === 0 ? it : { ...it, reservas_detalladas: cloned })
      return { ...f, integrantes: next }
    })
  }

  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    // cuando cambian los errores enfocamos el primero
    if (Object.keys(errors).length && firstErrorRef.current) {
      firstErrorRef.current.focus()
    }
  }, [errors])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    const payload: SolicitudInvestigacionCreate = {
      ...(form as Omit<SolicitudInvestigacionCreate, 'tipo_solicitud'>),
      tipo_solicitud: 'investigacion',
    }
    
    const { valid, errors: vErrors } = validateSolicitudInvestigacion({ ...(payload as any), tipo_solicitud: undefined })
    if (!valid) {
      setErrors(vErrors)
      // preparar referencia de primer campo con error
      const order = [
        'responsable_apellido_nombre','responsable_dni','responsable_email_principal','fecha_inicio_actividad_general','fecha_fin_actividad_general','objetivos','actividades'
      ]
      for (const k of order) {
        if (vErrors[k]) {
          const el = document.querySelector(`[name="${k}"]`) as any
          if (el) firstErrorRef.current = el
          break
        }
      }
      setSubmitting(false)
      return
    }
    try {
      const created = await request<{ id: number }>('/api/solicitudes/investigacion', {
        method: 'POST',
        body: payload,
      })
  push({ type: 'success', message: 'Solicitud creada', autoCloseMs: 3000 })
  saveLastSolicitud(created.id, 'investigacion')
      nav(`/solicitudes/${created.id}`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.validation) setErrors(err.validation)
        push({ type: 'error', message: err.message, autoCloseMs: 4000 })
      } else {
        push({ type: 'error', message: 'Error desconocido', autoCloseMs: 4000 })
      }
    } finally {
      setSubmitting(false)
    }
  }

  function fieldError(key: string): string | undefined {
    const arr = errors[key]
    return arr && arr.length > 0 ? arr[0] : undefined
  }

  return (
    <div>
      <h1>Nueva Solicitud Investigación</h1>
      <form onSubmit={onSubmit} noValidate>
        <fieldset disabled={submitting} style={{ border: 'none', padding: 0 }}>
          <div className="mb-3">
            <label className="form-label" htmlFor="responsable_apellido_nombre">Responsable Apellido y Nombre *</label>
            <input id="responsable_apellido_nombre" className="form-control" name="responsable_apellido_nombre" aria-invalid={!!fieldError('responsable_apellido_nombre')} aria-describedby={fieldError('responsable_apellido_nombre') ? 'err-resp-nombre' : undefined} value={form.responsable_apellido_nombre} onChange={(e) => update('responsable_apellido_nombre', e.target.value)} required />
            {fieldError('responsable_apellido_nombre') && <div id="err-resp-nombre" className="text-danger small" role="alert">{fieldError('responsable_apellido_nombre')}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="responsable_dni">DNI Responsable *</label>
            <input id="responsable_dni" className="form-control" name="responsable_dni" aria-invalid={!!fieldError('responsable_dni')} aria-describedby={fieldError('responsable_dni') ? 'err-resp-dni' : undefined} value={form.responsable_dni} onChange={(e) => update('responsable_dni', e.target.value)} required />
            {fieldError('responsable_dni') && <div id="err-resp-dni" className="text-danger small" role="alert">{fieldError('responsable_dni')}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="responsable_email_principal">Email Responsable *</label>
            <input id="responsable_email_principal" className="form-control" name="responsable_email_principal" type="email" aria-invalid={!!fieldError('responsable_email_principal')} aria-describedby={fieldError('responsable_email_principal') ? 'err-resp-email' : undefined} value={form.responsable_email_principal} onChange={(e) => update('responsable_email_principal', e.target.value)} required />
            {fieldError('responsable_email_principal') && <div id="err-resp-email" className="text-danger small" role="alert">{fieldError('responsable_email_principal')}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="fecha_inicio_actividad_general">Fecha Inicio Actividad *</label>
            <input id="fecha_inicio_actividad_general" className="form-control" name="fecha_inicio_actividad_general" type="date" aria-invalid={!!fieldError('fecha_inicio_actividad_general')} aria-describedby={fieldError('fecha_inicio_actividad_general') ? 'err-fecha-inicio' : undefined} value={form.fecha_inicio_actividad_general} onChange={(e) => update('fecha_inicio_actividad_general', e.target.value)} required />
            {fieldError('fecha_inicio_actividad_general') && <div id="err-fecha-inicio" className="text-danger small" role="alert">{fieldError('fecha_inicio_actividad_general')}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="fecha_fin_actividad_general">Fecha Fin Actividad *</label>
            <input id="fecha_fin_actividad_general" className="form-control" name="fecha_fin_actividad_general" type="date" aria-invalid={!!fieldError('fecha_fin_actividad_general')} aria-describedby={fieldError('fecha_fin_actividad_general') ? 'err-fecha-fin' : undefined} value={form.fecha_fin_actividad_general} onChange={(e) => update('fecha_fin_actividad_general', e.target.value)} required />
            {fieldError('fecha_fin_actividad_general') && <div id="err-fecha-fin" className="text-danger small" role="alert">{fieldError('fecha_fin_actividad_general')}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="objetivos">Objetivos *</label>
            <textarea id="objetivos" className="form-control" name="objetivos" aria-invalid={!!fieldError('objetivos')} aria-describedby={fieldError('objetivos') ? 'err-objetivos' : undefined} value={form.objetivos} onChange={(e) => update('objetivos', e.target.value)} placeholder= "Describir el objetivo de la actividad/es" required />
            {fieldError('objetivos') && <div id="err-objetivos" className="text-danger small" role="alert">{fieldError('objetivos')}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="actividades">Actividades *</label>
            <textarea id="actividades" className="form-control" name="actividades" aria-invalid={!!fieldError('actividades')} aria-describedby={fieldError('actividades') ? 'err-actividades' : undefined} value={form.actividades} onChange={(e) => update('actividades', e.target.value)} placeholder="Detallar tipo de actividades/muestreos a llevar a cabo. Para muestreos a campo, especificar el protocolo a utilizar." required />
            {fieldError('actividades') && <div id="err-actividades" className="text-danger small" role="alert">{fieldError('actividades')}</div>}
          </div>

          <div className="mt-2 mb-2">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowOpcionales(v => !v)}>
              {showOpcionales ? 'Ocultar campos opcionales' : 'Mostrar campos opcionales'}
            </button>
          </div>
          {showOpcionales && (
            <div className="border-top pt-2 mt-2">
              <h3 className="form-section-title"><i className="bi bi-sliders me-2"/>Campos opcionales</h3>
              <div className="mb-2">
                <label className="form-label" htmlFor="responsable_email_alternativo">Email alternativo</label>
                <input id="responsable_email_alternativo" className="form-control" name="responsable_email_alternativo" type="email" value={form.responsable_email_alternativo || ''} onChange={(e) => update('responsable_email_alternativo', e.target.value)} />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="responsable_telefono">Teléfono responsable</label>
                <input id="responsable_telefono" className="form-control" name="responsable_telefono" value={form.responsable_telefono || ''} onChange={(e) => update('responsable_telefono', e.target.value)} />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="responsable_direccion_postal">Dirección postal responsable</label>
                <input id="responsable_direccion_postal" className="form-control" name="responsable_direccion_postal" value={form.responsable_direccion_postal || ''} onChange={(e) => update('responsable_direccion_postal', e.target.value)} />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="sitios">Sitios</label>
                <textarea id="sitios" className="form-control" name="sitios" value={form.sitios || ''} onChange={(e) => update('sitios', e.target.value)} placeholder="Ej: bosque, lago, ríos, etc." />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="infraestructuras">Infraestructuras</label>
                <textarea id="infraestructuras" className="form-control" name="infraestructuras" value={form.infraestructuras || ''} onChange={(e) => update('infraestructuras', e.target.value)} />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="otras_aclaraciones">Otras aclaraciones</label>
                <textarea id="otras_aclaraciones" className="form-control" name="otras_aclaraciones" value={form.otras_aclaraciones || ''} onChange={(e) => update('otras_aclaraciones', e.target.value)} />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="institucion">Institución</label>
                <input id="institucion" className="form-control" name="institucion" value={form.institucion || ''} onChange={(e) => update('institucion', e.target.value)} />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="antecedentes">Antecedentes</label>
                <textarea id="antecedentes" className="form-control" name="antecedentes" value={form.antecedentes || ''} onChange={(e) => update('antecedentes', e.target.value)} />
              </div>
              <div className="form-check">
                <input className="form-check-input" id="req-ayud" type="checkbox" checked={!!form.requiere_ayudantes} onChange={(e) => update('requiere_ayudantes', e.target.checked)} />
                <label className="form-check-label" htmlFor="req-ayud">Requiere ayudantes</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" id="req-pas-desc" type="checkbox" checked={!!form.requiere_pasajes_descuento} onChange={(e) => update('requiere_pasajes_descuento', e.target.checked)} />
                <label className="form-check-label" htmlFor="req-pas-desc">Requiere pasajes (descuento)</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" id="req-aloj-desc" type="checkbox" checked={!!form.requiere_alojamiento_descuento} onChange={(e) => update('requiere_alojamiento_descuento', e.target.checked)} />
                <label className="form-check-label" htmlFor="req-aloj-desc">Requiere alojamiento (descuento)</label>
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="detalle_alojamiento_descuento">Detalle alojamiento (descuento)</label>
                <textarea id="detalle_alojamiento_descuento" className="form-control" name="detalle_alojamiento_descuento" value={form.detalle_alojamiento_descuento || ''} onChange={(e) => update('detalle_alojamiento_descuento', e.target.value)} />
              </div>
              <div className="form-check">
                <input className="form-check-input" id="req-vianda" type="checkbox" checked={!!form.requiere_vianda_restaurant} onChange={(e) => update('requiere_vianda_restaurant', e.target.checked)} />
                <label className="form-check-label" htmlFor="req-vianda">Requiere vianda / restaurant</label>
              </div>
            </div>
          )}

          <fieldset className="integrantes-fieldset" style={{ border: '1px solid #aaa', marginTop: 12, padding: '10px 12px 12px' }}>
            <legend>Integrantes ({form.integrantes.length})</legend>
            {form.integrantes.length > 1 && (
              <div className="mb-2 d-flex gap-2 align-items-end flex-wrap">
                <label className="me-2">
                  Clonar qué<br />
                  <select className="form-select" value={cloneMode} onChange={(e) => setCloneMode(e.target.value as any)}>
                    <option value="todos">Todos</option>
                    <option value="diurno">Solo diurnos</option>
                    <option value="pernocte">Solo pernoctes</option>
                  </select>
                </label>
                <label className="me-2">
                  Fecha desde<br />
                  <input className="form-control" type="date" value={cloneFromDate} onChange={(e) => setCloneFromDate(e.target.value)} />
                </label>
                <label className="me-2">
                  Fecha hasta<br />
                  <input className="form-control" type="date" value={cloneToDate} onChange={(e) => setCloneToDate(e.target.value)} />
                </label>
                <div>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={cloneReservasFromFirst}><i className="bi bi-arrow-down-up me-1"/>Clonar fechas del 1º integrante</button>
                </div>
              </div>
            )}
            {form.integrantes.map((ing, idx) => (
              <ParticipanteForm
                key={idx}
                value={ing}
                onChange={(val) => updateIntegrante(idx, val)}
                onRemove={form.integrantes.length > 1 ? () => removeIntegrante(idx) : undefined}
                showReservas={true}
                index={idx}
                errors={Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith(`integrantes.${idx}.`)).map(([k,v]) => [k.split(`integrantes.${idx}.`)[1], v]))}
              />
            ))}
            <div className="integrantes-actions">
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={addIntegrante}><i className="bi bi-person-plus me-1"/>Agregar integrante</button>
            </div>
          </fieldset>

          <div className="alert alert-info mt-3" role="alert">
            <small>
              El investigador responsable y su equipo de ayudantes, declaran conocer el <a href="/Reglamento de uso de la Estación Biológica Puerto Blest.pdf" target="_blank" rel="noopener noreferrer">"Reglamento de uso"</a> de la Estación Biológica Puerto Blest. El grupo deberá designar a un integrante como responsable de las actividades que realizan tanto en el campo como en la EBPB.
            </small>
          </div>

          <div className="mt-3 d-flex align-items-center gap-2">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting && <Spinner size={14} />} {submitting ? 'Guardando…' : 'Crear Solicitud'}
            </button>
            {submitting && <span className="text-secondary small">Enviando datos…</span>}
          </div>
        </fieldset>
      </form>
    </div>
  )
}
