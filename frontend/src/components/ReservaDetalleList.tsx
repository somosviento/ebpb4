import { ReservaDetalleCreate } from '../models'
import { useState } from 'react'

export interface ReservaDetalleListProps {
  value: ReservaDetalleCreate[]
  onChange: (val: ReservaDetalleCreate[]) => void
  readOnly?: boolean
  // errores con claves relativas al participante, ej:
  // 'reservas_detalladas.0.fecha', 'reservas_detalladas.0.turno', 'reservas_detalladas'
  errors?: Record<string, string[]>
}

const empty = (): ReservaDetalleCreate => ({ fecha: '', es_diurno: true, es_pernocte: false })

export default function ReservaDetalleList({ value, onChange, readOnly, errors }: ReservaDetalleListProps) {
  const [error, setError] = useState<string | null>(null)

  function update(idx: number, patch: Partial<ReservaDetalleCreate>) {
    const next = value.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    onChange(next)
  }

  function add() {
    onChange([...value, empty()])
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function validateDuplicates(next: ReservaDetalleCreate[]) {
    const dates = next.filter(r => r.fecha).map(r => r.fecha)
    const dup = dates.find((d, i) => dates.indexOf(d) !== i)
    if (dup) {
      setError(`Fecha duplicada: ${dup}`)
    } else {
      setError(null)
    }
  }

  function onBlur(idx: number) {
    validateDuplicates(value)
  }

  return (
    <div className="date-entry">
      <div className="form-section-title"><i className="bi bi-calendar-event me-2"></i>Reservas detalladas</div>
      {value.length === 0 && <div>No hay reservas.</div>}
      {value.map((r, idx) => (
        <div key={idx} className="card mb-2">
          <div className="card-body">
            <div className="row mb-2">
              <div className="col-md-4">
                <label className="form-label" htmlFor={`fecha-${idx}`}>Fecha</label>
                <input
                  id={`fecha-${idx}`}
                  className="form-control"
                  type="date"
                  value={r.fecha}
                  disabled={readOnly}
                  onChange={(e) => update(idx, { fecha: e.target.value })}
                  onBlur={() => onBlur(idx)}
                />
                {errors?.[`reservas_detalladas.${idx}.fecha`] && (
                  <div role="alert" className="text-danger small">
                    {errors[`reservas_detalladas.${idx}.fecha`][0]}
                  </div>
                )}
              </div>
              <div className="col-md-8 d-flex align-items-end gap-3">
                <div className="form-check">
                  <input className="form-check-input" id={`diurno-${idx}`} type="checkbox" checked={!!r.es_diurno} disabled={readOnly} onChange={(e) => update(idx, { es_diurno: e.target.checked })} />
                  <label className="form-check-label" htmlFor={`diurno-${idx}`}>Diurno</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" id={`pernocte-${idx}`} type="checkbox" checked={!!r.es_pernocte} disabled={readOnly} onChange={(e) => update(idx, { es_pernocte: e.target.checked })} />
                  <label className="form-check-label" htmlFor={`pernocte-${idx}`}>Pernocte</label>
                </div>
                {!readOnly && (
                  <button type="button" className="btn btn-light btn-sm" onClick={() => remove(idx)}>
                    <i className="bi bi-x-circle me-1"></i>Quitar
                  </button>
                )}
              </div>
            </div>
          {errors?.[`reservas_detalladas.${idx}.turno`] && (
            <div role="alert" className="text-danger small">
              {errors[`reservas_detalladas.${idx}.turno`][0]}
            </div>
          )}
          </div>
        </div>
      ))}
      {!readOnly && (
        <div className="mt-2">
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={add}><i className="bi bi-plus-circle me-1"></i>Agregar fecha</button>
        </div>
      )}
      {error && <div className="text-danger small mt-2">{error}</div>}
      {errors?.['reservas_detalladas'] && (
        <div role="alert" className="text-danger small mt-2">
          {errors['reservas_detalladas'][0]}
        </div>
      )}
    </div>
  )
}
