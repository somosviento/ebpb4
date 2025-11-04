import { SolicitudInvestigacionCreate, SolicitudCatedrasCreate, ParticipanteCreate, ReservaDetalleCreate } from '../models'

export interface ValidationResult {
  errors: Record<string, string[]>
  valid: boolean
}

function pushErr(map: Record<string, string[]>, key: string, msg: string) {
  map[key] = map[key] || []
  map[key].push(msg)
}

function validateReservas(reservas: ReservaDetalleCreate[], prefix: string, errors: Record<string, string[]>) {
  const seen = new Set<string>()
  reservas.forEach((r, idx) => {
    const base = `${prefix}.reservas_detalladas.${idx}`
    if (!r.fecha) pushErr(errors, `${base}.fecha`, 'Fecha requerida')
    else if (seen.has(r.fecha)) pushErr(errors, `${prefix}.reservas_detalladas`, `Fecha duplicada ${r.fecha}`)
    else seen.add(r.fecha)
    // Sólo exigir turno cuando hay fecha definida; si no hay fecha, el error principal es la fecha requerida
    if (r.fecha && !r.es_diurno && !r.es_pernocte) pushErr(errors, `${base}.turno`, 'Marcar diurno y/o pernocte')
  })
}

function validateParticipante(p: ParticipanteCreate, idx: number, errors: Record<string, string[]>) {
  const prefix = `integrantes.${idx}`
  if (!p.apellido) pushErr(errors, `${prefix}.apellido`, 'Requerido')
  if (!p.nombres) pushErr(errors, `${prefix}.nombres`, 'Requerido')
  if (!p.dni) pushErr(errors, `${prefix}.dni`, 'Requerido')
  if (p.reservas_detalladas) validateReservas(p.reservas_detalladas, prefix, errors)
}

function validateFechas(inicio: string, fin: string, errors: Record<string, string[]>) {
  if (inicio && fin && inicio > fin) {
    pushErr(errors, 'fecha_fin_actividad_general', 'Fin debe ser >= inicio')
  }
}

function validateEmail(email: string, key: string, errors: Record<string, string[]>) {
  if (!email) { pushErr(errors, key, 'Requerido'); return }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) pushErr(errors, key, 'Formato inválido')
}

function validateOptionalEmail(email: string | null | undefined, key: string, errors: Record<string, string[]>) {
  if (!email) return
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email)) pushErr(errors, key, 'Formato inválido')
}

export function validateSolicitudInvestigacion(payload: Omit<SolicitudInvestigacionCreate, 'tipo_solicitud'>): ValidationResult {
  const errors: Record<string, string[]> = {}
  if (!payload.responsable_apellido_nombre) pushErr(errors, 'responsable_apellido_nombre', 'Requerido')
  if (!payload.responsable_dni) pushErr(errors, 'responsable_dni', 'Requerido')
  validateEmail(payload.responsable_email_principal, 'responsable_email_principal', errors)
  validateOptionalEmail(payload.responsable_email_alternativo as any, 'responsable_email_alternativo', errors)
  if (!payload.fecha_inicio_actividad_general) pushErr(errors, 'fecha_inicio_actividad_general', 'Requerido')
  if (!payload.fecha_fin_actividad_general) pushErr(errors, 'fecha_fin_actividad_general', 'Requerido')
  if (!payload.objetivos) pushErr(errors, 'objetivos', 'Requerido')
  if (!payload.actividades) pushErr(errors, 'actividades', 'Requerido')
  validateFechas(payload.fecha_inicio_actividad_general, payload.fecha_fin_actividad_general, errors)
  if (!payload.integrantes || payload.integrantes.length === 0) pushErr(errors, 'integrantes', 'Al menos 1 integrante')
  payload.integrantes?.forEach((p, idx) => validateParticipante(p, idx, errors))
  return { errors, valid: Object.keys(errors).length === 0 }
}

export function validateSolicitudCatedras(payload: Omit<SolicitudCatedrasCreate, 'tipo_solicitud'>): ValidationResult {
  const base = validateSolicitudInvestigacion(payload as any)
  // Podríamos añadir validaciones específicas de cátedras si hiciera falta
  return base
}
