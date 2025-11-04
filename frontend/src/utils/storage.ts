// Utilidades de persistencia ligera en localStorage

const LAST_SOLICITUD_ID_KEY = 'last_solicitud_id'
const LAST_SOLICITUD_TIPO_KEY = 'last_solicitud_tipo'

export function saveLastSolicitud(id: number, tipo?: string) {
  try {
    localStorage.setItem(LAST_SOLICITUD_ID_KEY, String(id))
    if (tipo) localStorage.setItem(LAST_SOLICITUD_TIPO_KEY, tipo)
  } catch { /* ignore */ }
}

export function getLastSolicitudId(): number | null {
  try {
    const v = localStorage.getItem(LAST_SOLICITUD_ID_KEY)
    return v ? Number(v) : null
  } catch { return null }
}

export function getLastSolicitudTipo(): string | null {
  try {
    return localStorage.getItem(LAST_SOLICITUD_TIPO_KEY)
  } catch { return null }
}

export function clearLastSolicitud() {
  try {
    localStorage.removeItem(LAST_SOLICITUD_ID_KEY)
    localStorage.removeItem(LAST_SOLICITUD_TIPO_KEY)
  } catch { /* ignore */ }
}
