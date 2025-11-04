import { validateSolicitudInvestigacion } from '../utils/validateSolicitud'

describe('validateSolicitudInvestigacion', () => {
  it('detecta fin < inicio', () => {
    const { valid, errors } = validateSolicitudInvestigacion({
      responsable_apellido_nombre: 'A',
      responsable_dni: '1',
      responsable_email_principal: 'a@a.com',
      fecha_inicio_actividad_general: '2025-09-10',
      fecha_fin_actividad_general: '2025-09-01',
      objetivos: 'o',
      actividades: 'a',
      integrantes: [{ apellido: 'P', nombres: 'N', dni: '2', reservas_detalladas: [] }],
    })
    expect(valid).toBe(false)
    expect(errors['fecha_fin_actividad_general']).toBeTruthy()
  })

  it('ok con datos mínimos correctos', () => {
    const { valid } = validateSolicitudInvestigacion({
      responsable_apellido_nombre: 'A',
      responsable_dni: '1',
      responsable_email_principal: 'a@a.com',
      fecha_inicio_actividad_general: '2025-09-01',
      fecha_fin_actividad_general: '2025-09-10',
      objetivos: 'o',
      actividades: 'a',
      integrantes: [{ apellido: 'P', nombres: 'N', dni: '2', reservas_detalladas: [] }],
    })
    expect(valid).toBe(true)
  })
})
