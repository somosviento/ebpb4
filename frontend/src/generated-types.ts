// Archivo generado automáticamente. NO editar a mano.
// Fuente: openapi.json

export interface SolicitudInvestigacionCreate {
  responsable_apellido_nombre: string;
  responsable_dni: string;
  responsable_email_principal: string;
  responsable_email_alternativo?: string | null;
  responsable_telefono?: string | null;
  responsable_direccion_postal?: string | null;
  fecha_inicio_actividad_general: string;
  fecha_fin_actividad_general: string;
  objetivos: string;
  actividades: string;
  sitios?: string | null;
  infraestructuras?: string | null;
  otras_aclaraciones?: string | null;
  institucion?: string | null;
  antecedentes?: string | null;
  requiere_ayudantes?: boolean | null;
  requiere_pasajes_descuento?: boolean | null;
  requiere_alojamiento_descuento?: boolean | null;
  detalle_alojamiento_descuento?: string | null;
  requiere_vianda_restaurant?: boolean | null;
  tipo_solicitud?: "investigacion";
  integrantes: ParticipanteCreate[];
}

export interface SolicitudCatedrasCreate {
  responsable_apellido_nombre: string;
  responsable_dni: string;
  responsable_email_principal: string;
  responsable_email_alternativo?: string | null;
  responsable_telefono?: string | null;
  responsable_direccion_postal?: string | null;
  fecha_inicio_actividad_general: string;
  fecha_fin_actividad_general: string;
  objetivos: string;
  actividades: string;
  sitios?: string | null;
  infraestructuras?: string | null;
  otras_aclaraciones?: string | null;
  institucion?: string | null;
  antecedentes?: string | null;
  requiere_ayudantes?: boolean | null;
  requiere_pasajes_descuento?: boolean | null;
  requiere_alojamiento_descuento?: boolean | null;
  detalle_alojamiento_descuento?: string | null;
  requiere_vianda_restaurant?: boolean | null;
  tipo_solicitud?: "catedras";
  asignatura?: string | null;
  requiere_pasajes?: boolean | null;
  integrantes: ParticipanteCreate[];
}

export interface SolicitudOut {
  id: number;
  tipo_solicitud: string;
  objetivos: string;
  actividades: string;
  sitios?: string | null;
  infraestructuras?: string | null;
  otras_aclaraciones?: string | null;
  fecha_creacion: string;
  fecha_inicio_actividad_general: string;
  fecha_fin_actividad_general: string;
  responsable_apellido_nombre: string;
  responsable_dni: string;
  responsable_email_principal: string;
  responsable_email_alternativo?: string | null;
  responsable_telefono?: string | null;
  responsable_direccion_postal?: string | null;
  institucion?: string | null;
  antecedentes?: string | null;
  requiere_ayudantes?: boolean | null;
  requiere_pasajes_descuento?: boolean | null;
  requiere_alojamiento_descuento?: boolean | null;
  detalle_alojamiento_descuento?: string | null;
  requiere_vianda_restaurant?: boolean | null;
  asignatura?: string | null;
  requiere_pasajes?: boolean | null;
  participantes?: SolicitudParticipanteOut[];
}

export interface ParticipanteCreate {
  apellido: string;
  nombres: string;
  dni: string;
  institucion_cargo?: string | null;
  nacionalidad?: string | null;
  cuil?: string | null;
  fecha_nacimiento?: string | null;
  rol?: string | null;
  reservas_detalladas: ReservaDetalleCreate[];
}

export interface ParticipanteOut {
  apellido: string;
  nombres: string;
  dni: string;
  institucion_cargo?: string | null;
  nacionalidad?: string | null;
  cuil?: string | null;
  fecha_nacimiento?: string | null;
  rol?: string | null;
  id: number;
  participante_reservas?: ParticipanteReservaOut[];
}

export interface ParticipanteReservaOut {
  id: number;
  fecha: string;
  es_diurno: boolean;
  es_pernocte: boolean;
}

export interface ReservaDetalleCreate {
  fecha: string;
  es_diurno?: boolean;
  es_pernocte?: boolean;
}

export interface ReservaDiariaOut {
  fecha: string;
  plazas_pernocte_ocupadas: number;
  plazas_pernocte_disponibles: number;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface SolicitudParticipanteOut {
  apellido: string;
  nombres: string;
  dni: string;
  institucion_cargo?: string | null;
  nacionalidad?: string | null;
  cuil?: string | null;
  fecha_nacimiento?: string | null;
  rol?: string | null;
  id: number;
  participante_reservas?: ParticipanteReservaOut[];
}
