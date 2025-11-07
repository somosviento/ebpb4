// Modelos derivados de openapi.json (simplificados a lo necesario para el front)

export interface ReservaDetalleCreate {
  fecha: string // date (YYYY-MM-DD)
  es_diurno?: boolean
  es_pernocte?: boolean
}

export interface ParticipanteCreate {
  apellido: string
  nombres: string
  dni: string // DNI o Pasaporte
  institucion_cargo?: string | null
  nacionalidad?: string | null
  cuil?: string | null
  fecha_nacimiento?: string | null // date
  rol?: string | null
  reservas_detalladas: ReservaDetalleCreate[]
}

export interface ParticipanteOut {
  id: number
  apellido: string
  nombres: string
  dni: string
  institucion_cargo?: string | null
  nacionalidad?: string | null
  cuil?: string | null
  fecha_nacimiento?: string | null
  rol?: string | null
}

export interface ParticipanteReservaOut {
  id: number
  fecha: string
  es_diurno: boolean
  es_pernocte: boolean
}

export interface SolicitudParticipanteOut extends ParticipanteOut {
  participante_reservas?: ParticipanteReservaOut[]
}

export interface SolicitudBaseCommon {
  responsable_apellido_nombre: string
  responsable_dni: string
  responsable_email_principal: string
  responsable_email_alternativo?: string | null
  responsable_telefono?: string | null
  responsable_direccion_postal?: string | null
  responsable_reservas_detalladas: ReservaDetalleCreate[]
  fecha_inicio_actividad_general: string // date
  fecha_fin_actividad_general: string // date
  objetivos: string
  actividades: string
  sitios?: string | null
  infraestructuras?: string | null
  otras_aclaraciones?: string | null
  institucion?: string | null
  antecedentes?: string | null
  requiere_ayudantes?: boolean | null
  requiere_pasajes_descuento?: boolean | null
  requiere_alojamiento_descuento?: boolean | null
  detalle_alojamiento_descuento?: string | null
  requiere_vianda_restaurant?: boolean | null
  integrantes: ParticipanteCreate[]
}

export interface SolicitudInvestigacionCreate extends SolicitudBaseCommon {
  tipo_solicitud: 'investigacion'
}

export interface SolicitudCatedrasCreate extends SolicitudBaseCommon {
  tipo_solicitud: 'catedras'
  asignatura?: string | null
  requiere_pasajes?: boolean | null
}

export interface SolicitudOut {
  id: number
  tipo_solicitud: string
  objetivos: string
  actividades: string
  sitios?: string | null
  infraestructuras?: string | null
  otras_aclaraciones?: string | null
  fecha_creacion: string // date
  fecha_inicio_actividad_general: string
  fecha_fin_actividad_general: string
  responsable_apellido_nombre: string
  responsable_dni: string
  responsable_email_principal: string
  responsable_email_alternativo?: string | null
  responsable_telefono?: string | null
  responsable_direccion_postal?: string | null
  institucion?: string | null
  antecedentes?: string | null
  requiere_ayudantes?: boolean | null
  requiere_pasajes_descuento?: boolean | null
  requiere_alojamiento_descuento?: boolean | null
  detalle_alojamiento_descuento?: string | null
  requiere_vianda_restaurant?: boolean | null
  asignatura?: string | null
  requiere_pasajes?: boolean | null
  participantes?: SolicitudParticipanteOut[]
}

export interface ReservaDiariaOut {
  fecha: string
  plazas_pernocte_ocupadas: number
  plazas_pernocte_disponibles: number
}

// Validation Error (422)
export interface ValidationErrorItem {
  loc: (string | number)[]
  msg: string
  type: string
}
export interface HTTPValidationError {
  detail?: ValidationErrorItem[]
}

// Utilidad para mapear errores a un diccionario campo->mensajes
export function mapValidationErrors(e: HTTPValidationError): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  if (!e.detail) return out
  for (const item of e.detail) {
    const key = item.loc.slice(1).join('.') || 'general' // salteamos primer nivel si es 'body'
    out[key] = out[key] || []
    out[key].push(item.msg)
  }
  return out
}
