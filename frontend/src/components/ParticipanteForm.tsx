import { ParticipanteCreate, ReservaDetalleCreate } from '../models'
import { ChangeEvent, useState } from 'react'
import ReservaDetalleList from './ReservaDetalleList'

export interface ParticipanteFormProps {
  value: ParticipanteCreate
  index?: number
  onChange: (val: ParticipanteCreate) => void
  onRemove?: () => void
  readOnly?: boolean
  showReservas?: boolean // para futura integración con ReservaDetalleList
  errors?: Record<string, string[]>
}

export default function ParticipanteForm({ value, onChange, onRemove, readOnly, showReservas, errors, index }: ParticipanteFormProps) {
  const [showOpcionales, setShowOpcionales] = useState(false)
  function field<K extends keyof ParticipanteCreate>(k: K) {
    return (e: ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value })
  }
  const fid = (name: string) => `${name}-${index ?? 0}`

  function fieldErr(name: string): string | undefined {
    if (!errors) return undefined
    const arr = errors[name]
    return arr && arr.length ? arr[0] : undefined
  }

  return (
    <div className="participant-entry">
      <div className="mb-3">
        <label className="form-label" htmlFor={fid('apellido')}>Apellido</label>
        <input id={fid('apellido')} className="form-control" name="apellido" aria-invalid={!!fieldErr('apellido')} aria-describedby={fieldErr('apellido') ? 'err-apellido' : undefined} value={value.apellido} onChange={field('apellido')} required disabled={readOnly} />
        {fieldErr('apellido') && <div id="err-apellido" className="text-danger small" role="alert">{fieldErr('apellido')}</div>}
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor={fid('nombres')}>Nombres</label>
        <input id={fid('nombres')} className="form-control" name="nombres" aria-invalid={!!fieldErr('nombres')} aria-describedby={fieldErr('nombres') ? 'err-nombres' : undefined} value={value.nombres} onChange={field('nombres')} required disabled={readOnly} />
        {fieldErr('nombres') && <div id="err-nombres" className="text-danger small" role="alert">{fieldErr('nombres')}</div>}
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor={fid('dni')}>DNI</label>
        <input id={fid('dni')} className="form-control" name="dni" aria-invalid={!!fieldErr('dni')} aria-describedby={fieldErr('dni') ? 'err-dni' : undefined} value={value.dni} onChange={field('dni')} required disabled={readOnly} />
        {fieldErr('dni') && <div id="err-dni" className="text-danger small" role="alert">{fieldErr('dni')}</div>}
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor={fid('rol')}>Rol</label>
        <input id={fid('rol')} className="form-control" name="rol" value={value.rol || ''} onChange={field('rol')} disabled={readOnly} />
      </div>
      {!readOnly && (
        <div className="mb-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowOpcionales(v => !v)}>
            {showOpcionales ? 'Ocultar campos opcionales' : 'Mostrar campos opcionales'}
          </button>
        </div>
      )}
      {showOpcionales && (
        <div className="border-top pt-2 mt-2">
          <div className="mb-2">
            <label className="form-label" htmlFor={fid('institucion_cargo')}>Institución / Cargo</label>
            <input id={fid('institucion_cargo')} className="form-control" name="institucion_cargo" value={value.institucion_cargo || ''} onChange={field('institucion_cargo')} disabled={readOnly} />
          </div>
          <div className="mb-2">
            <label className="form-label" htmlFor={fid('nacionalidad')}>Nacionalidad</label>
            <input id={fid('nacionalidad')} className="form-control" name="nacionalidad" value={value.nacionalidad || ''} onChange={field('nacionalidad')} disabled={readOnly} />
          </div>
          <div className="mb-2">
            <label className="form-label" htmlFor={fid('cuil')}>CUIL</label>
            <input id={fid('cuil')} className="form-control" name="cuil" value={value.cuil || ''} onChange={field('cuil')} disabled={readOnly} />
          </div>
          <div className="mb-2">
            <label className="form-label" htmlFor={fid('fecha_nacimiento')}>Fecha de nacimiento</label>
            <input id={fid('fecha_nacimiento')} className="form-control" name="fecha_nacimiento" type="date" value={value.fecha_nacimiento || ''} onChange={field('fecha_nacimiento')} disabled={readOnly} />
          </div>
        </div>
      )}
      {onRemove && !readOnly && (
        <button type="button" className="btn btn-danger btn-sm" onClick={onRemove}>Quitar</button>
      )}
      {showReservas && (
        <div className="text-secondary small mt-2">Reservas: {value.reservas_detalladas?.length || 0}</div>
      )}
      {showReservas && (
        <ReservaDetalleList
          value={value.reservas_detalladas as ReservaDetalleCreate[]}
          onChange={(reservas) => onChange({ ...value, reservas_detalladas: reservas })}
          readOnly={readOnly}
          errors={errors && Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith('reservas_detalladas')))}
        />
      )}
    </div>
  )
}
