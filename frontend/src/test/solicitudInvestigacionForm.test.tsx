import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import SolicitudInvestigacionNueva from '../pages/SolicitudInvestigacionNueva'
import { NotificationProvider } from '../context/NotificationContext'
import { AuthProvider } from '../context/AuthContext'

// Mock de useApiClient para interceptar POST
const mockRequest = vi.fn()
vi.mock('../api/client', () => ({ useApiClient: () => ({ request: mockRequest }), ApiError: class extends Error { validation?: any; constructor(public status: number, msg: string, opt?: any){ super(msg); this.validation = opt?.validation } } }))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <NotificationProvider><AuthProvider><BrowserRouter>{children}</BrowserRouter></AuthProvider></NotificationProvider>
}

describe('Formulario Investigación', () => {
  it('muestra errores de validación frontend y no envía', async () => {
    mockRequest.mockClear()
    render(<Wrapper><SolicitudInvestigacionNueva /></Wrapper>)
    fireEvent.click(screen.getByText('Crear Solicitud'))
    // Debe aparecer al menos uno de los mensajes de requerido (campo email por ejemplo)
    await waitFor(() => expect(screen.getAllByText(/requerido|Requerido/i).length).toBeGreaterThan(0))
    expect(mockRequest).not.toHaveBeenCalled()
  })

  it('envía payload válido y navega', async () => {
    mockRequest.mockClear()
    mockRequest.mockResolvedValueOnce({ id: 99 })
    render(<Wrapper><SolicitudInvestigacionNueva /></Wrapper>)
    const fill = (label: RegExp, value: string) => {
      const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement
      fireEvent.change(input, { target: { value } })
    }
    fill(/Responsable Apellido y Nombre/i, 'Juan Perez')
    fill(/DNI Responsable/i, '123')
    fill(/Email Responsable/i, 'a@a.com')
    fill(/Fecha Inicio Actividad/i, '2025-09-01')
    fill(/Fecha Fin Actividad/i, '2025-09-02')
    fill(/Objetivos/i, 'Obj')
    fill(/Actividades/i, 'Act')
    fill(/^Apellido$/i, 'Gomez')
    fill(/^Nombres$/i, 'Ana Maria')
    fill(/^DNI$/i, '555')
    fireEvent.click(screen.getByText('Crear Solicitud'))
    await waitFor(() => expect(mockRequest).toHaveBeenCalled())
  const calls = mockRequest.mock.calls
  const postCall = [...calls].reverse().find((c) => typeof c[0] === 'string' && c[0].includes('/api/solicitudes/investigacion') && c[1]?.method === 'POST') || calls[calls.length - 1]
  const rawBody = postCall[1].body
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    expect(body.tipo_solicitud).toBe('investigacion')
    expect(body.integrantes[0].apellido).toBe('Gomez')
  })

  it('permite completar campos opcionales y los envía', async () => {
    mockRequest.mockClear()
    mockRequest.mockResolvedValueOnce({ id: 100 })
    render(<Wrapper><SolicitudInvestigacionNueva /></Wrapper>)
    const click = (text: RegExp) => {
      const matches = screen.getAllByText(text)
      fireEvent.click(matches[0])
    }
    const fill = (label: RegExp, value: string) => {
      const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement
      fireEvent.change(input, { target: { value } })
    }
    // completar requeridos mínimos
    fill(/Responsable Apellido y Nombre/i, 'Maria Lopez')
    fill(/DNI Responsable/i, '321')
    fill(/Email Responsable/i, 'm@m.com')
    fill(/Fecha Inicio Actividad/i, '2025-09-01')
    fill(/Fecha Fin Actividad/i, '2025-09-02')
    fill(/Objetivos/i, 'Obj')
    fill(/Actividades/i, 'Act')
  // completar integrante mínimo requerido
  fill(/^Apellido$/i, 'Gomez')
  fill(/^Nombres$/i, 'Ana')
  fill(/^DNI$/i, '555')
    // abrir opcionales y completar algunos
    click(/Mostrar campos opcionales/i)
    fill(/Email alternativo/i, 'alt@alt.com')
    fill(/Teléfono responsable/i, '299-1234')
    fill(/Institución/i, 'UNCo')
    click(/Crear Solicitud/i)
    await waitFor(() => expect(mockRequest).toHaveBeenCalled())
  const calls = mockRequest.mock.calls
  const postCall = [...calls].reverse().find((c) => typeof c[0] === 'string' && c[0].includes('/api/solicitudes/investigacion') && c[1]?.method === 'POST') || calls[calls.length - 1]
  const rawBody = postCall[1].body
  const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
  // eslint-disable-next-line no-console
  console.log('TEST captured body keys', body && Object.keys(body))
    expect(body.responsable_email_alternativo).toBe('alt@alt.com')
    expect(body.responsable_telefono).toBe('299-1234')
    expect(body.institucion).toBe('UNCo')
  })

  it('permite cargar reservas detalladas por integrante y las envía', async () => {
    mockRequest.mockClear()
    mockRequest.mockResolvedValueOnce({ id: 200 })
    render(<Wrapper><SolicitudInvestigacionNueva /></Wrapper>)
    const fill = (label: RegExp, value: string) => {
      const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement
      fireEvent.change(input, { target: { value } })
    }
    // completar requeridos
    fill(/Responsable Apellido y Nombre/i, 'Luis Diaz')
    fill(/DNI Responsable/i, '987')
    fill(/Email Responsable/i, 'l@d.com')
    fill(/Fecha Inicio Actividad/i, '2025-09-01')
    fill(/Fecha Fin Actividad/i, '2025-09-05')
    fill(/Objetivos/i, 'Obj')
    fill(/Actividades/i, 'Act')
    fill(/^Apellido$/i, 'Gomez')
    fill(/^Nombres$/i, 'Ana')
    fill(/^DNI$/i, '555')
    // agregar reserva detallada al primer integrante
    fireEvent.click(screen.getByText('Agregar fecha'))
    const fechaInputs = screen.getAllByLabelText(/^Fecha$/i)
    const fechaReservaInput = fechaInputs[fechaInputs.length - 1] as HTMLInputElement
    fireEvent.change(fechaReservaInput, { target: { value: '2025-09-03' } })
    fireEvent.click(screen.getByLabelText(/Pernocte/i))
    // enviar
    fireEvent.click(screen.getByText('Crear Solicitud'))
    await waitFor(() => expect(mockRequest).toHaveBeenCalled())
    const calls = mockRequest.mock.calls
    const postCall = [...calls].reverse().find((c) => typeof c[0] === 'string' && c[0].includes('/api/solicitudes/investigacion') && c[1]?.method === 'POST') || calls[calls.length - 1]
    const rawBody = postCall[1].body
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    expect(body.integrantes[0].reservas_detalladas).toEqual([
      { fecha: '2025-09-03', es_diurno: false, es_pernocte: true }
    ])
  })

  it('clona reservas del primer integrante al resto', async () => {
    mockRequest.mockClear()
    mockRequest.mockResolvedValueOnce({ id: 201 })
    render(<Wrapper><SolicitudInvestigacionNueva /></Wrapper>)
    const fill = (label: RegExp, value: string) => {
      const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement
      fireEvent.change(input, { target: { value } })
    }
    // completar mínimos
    fill(/Responsable Apellido y Nombre/i, 'Clonar Test')
    fill(/DNI Responsable/i, '100')
    fill(/Email Responsable/i, 'c@t.com')
    fill(/Fecha Inicio Actividad/i, '2025-10-01')
    fill(/Fecha Fin Actividad/i, '2025-10-02')
    fill(/Objetivos/i, 'O')
    fill(/Actividades/i, 'A')
    // integrante 1
    fill(/^Apellido$/i, 'Uno')
    fill(/^Nombres$/i, 'Primero')
    fill(/^DNI$/i, '111')
    fireEvent.click(screen.getByText('Agregar fecha'))
    const fechas1 = screen.getAllByLabelText(/^Fecha$/i)
    fireEvent.change(fechas1[fechas1.length - 1], { target: { value: '2025-10-01' } })
    fireEvent.click(screen.getByLabelText(/Pernocte/i))
    // agregar segundo integrante
    fireEvent.click(screen.getByText('Agregar integrante'))
    // completar mínimos del segundo
    const inputs = screen.getAllByLabelText(/^Apellido$/i)
    fireEvent.change(inputs[inputs.length - 1], { target: { value: 'Dos' } })
    const nombres = screen.getAllByLabelText(/^Nombres$/i)
    fireEvent.change(nombres[nombres.length - 1], { target: { value: 'Segundo' } })
    const dnis = screen.getAllByLabelText(/^DNI$/i)
    fireEvent.change(dnis[dnis.length - 1], { target: { value: '222' } })
    // clonar
    fireEvent.click(screen.getByText('Clonar fechas del 1º integrante'))
    // enviar
    fireEvent.click(screen.getByText('Crear Solicitud'))
    await waitFor(() => expect(mockRequest).toHaveBeenCalled())
    const calls = mockRequest.mock.calls
    const postCall = [...calls].reverse().find((c) => typeof c[0] === 'string' && c[0].includes('/api/solicitudes/investigacion') && c[1]?.method === 'POST') || calls[calls.length - 1]
    const rawBody = postCall[1].body
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    expect(body.integrantes[0].reservas_detalladas).toEqual([
      { fecha: '2025-10-01', es_diurno: false, es_pernocte: true }
    ])
    expect(body.integrantes[1].reservas_detalladas).toEqual([
      { fecha: '2025-10-01', es_diurno: false, es_pernocte: true }
    ])
  })

  it('clona solo pernoctes', async () => {
    mockRequest.mockClear()
    mockRequest.mockResolvedValueOnce({ id: 202 })
    render(<Wrapper><SolicitudInvestigacionNueva /></Wrapper>)
    const fill = (label: RegExp, value: string) => {
      const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement
      fireEvent.change(input, { target: { value } })
    }
    // mínimos
    fill(/Responsable Apellido y Nombre/i, 'Clone Modes')
    fill(/DNI Responsable/i, '300')
    fill(/Email Responsable/i, 'm@m.com')
    fill(/Fecha Inicio Actividad/i, '2025-11-01')
    fill(/Fecha Fin Actividad/i, '2025-11-10')
    fill(/Objetivos/i, 'O')
    fill(/Actividades/i, 'A')
    fill(/^Apellido$/i, 'Uno')
    fill(/^Nombres$/i, 'Primero')
    fill(/^DNI$/i, '111')
    // dos reservas: una diurna y una pernocte
    fireEvent.click(screen.getByText('Agregar fecha'))
    let fechas = screen.getAllByLabelText(/^Fecha$/i)
    fireEvent.change(fechas[fechas.length - 1], { target: { value: '2025-11-05' } })
    fireEvent.click(screen.getByLabelText(/Diurno/i))
    fireEvent.click(screen.getByText('Agregar fecha'))
    fechas = screen.getAllByLabelText(/^Fecha$/i)
    fireEvent.change(fechas[fechas.length - 1], { target: { value: '2025-11-06' } })
    const pernocteBoxes = screen.getAllByLabelText(/Pernocte/i)
    fireEvent.click(pernocteBoxes[pernocteBoxes.length - 1])
    // segundo integrante
    fireEvent.click(screen.getByText('Agregar integrante'))
    const apes = screen.getAllByLabelText(/^Apellido$/i)
    fireEvent.change(apes[apes.length - 1], { target: { value: 'Dos' } })
    const noms = screen.getAllByLabelText(/^Nombres$/i)
    fireEvent.change(noms[noms.length - 1], { target: { value: 'Segundo' } })
    const dnis = screen.getAllByLabelText(/^DNI$/i)
    fireEvent.change(dnis[dnis.length - 1], { target: { value: '222' } })
    // set modo pernocte
    fireEvent.change(screen.getByLabelText(/Clonar qué/i), { target: { value: 'pernocte' } })
    fireEvent.click(screen.getByText('Clonar fechas del 1º integrante'))
    fireEvent.click(screen.getByText('Crear Solicitud'))
    await waitFor(() => expect(mockRequest).toHaveBeenCalled())
    const calls = mockRequest.mock.calls
    const postCall = [...calls].reverse().find((c) => typeof c[0] === 'string' && c[0].includes('/api/solicitudes/investigacion') && c[1]?.method === 'POST') || calls[calls.length - 1]
    const rawBody = postCall[1].body
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    expect(body.integrantes[1].reservas_detalladas).toEqual([
      { fecha: '2025-11-06', es_diurno: false, es_pernocte: true }
    ])
  })

  it('clona por rango de fechas', async () => {
    mockRequest.mockClear()
    mockRequest.mockResolvedValueOnce({ id: 203 })
    render(<Wrapper><SolicitudInvestigacionNueva /></Wrapper>)
    const fill = (label: RegExp, value: string) => {
      const input = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement
      fireEvent.change(input, { target: { value } })
    }
    // mínimos
    fill(/Responsable Apellido y Nombre/i, 'Clone Range')
    fill(/DNI Responsable/i, '400')
    fill(/Email Responsable/i, 'r@r.com')
    fill(/Fecha Inicio Actividad/i, '2025-12-01')
    fill(/Fecha Fin Actividad/i, '2025-12-31')
    fill(/Objetivos/i, 'O')
    fill(/Actividades/i, 'A')
    fill(/^Apellido$/i, 'Uno')
    fill(/^Nombres$/i, 'Primero')
    fill(/^DNI$/i, '111')
    // tres reservas: 10, 15, 20
    for (const day of ['2025-12-10', '2025-12-15', '2025-12-20']) {
      fireEvent.click(screen.getByText('Agregar fecha'))
      const fechasX = screen.getAllByLabelText(/^Fecha$/i)
      fireEvent.change(fechasX[fechasX.length - 1], { target: { value: day } })
      // marcar pernocte para tener turno válido
      const pernos = screen.getAllByLabelText(/Pernocte/i)
      fireEvent.click(pernos[pernos.length - 1])
    }
    // segundo integrante mínimos
    fireEvent.click(screen.getByText('Agregar integrante'))
    const ap2 = screen.getAllByLabelText(/^Apellido$/i)
    fireEvent.change(ap2[ap2.length - 1], { target: { value: 'Dos' } })
    const no2 = screen.getAllByLabelText(/^Nombres$/i)
    fireEvent.change(no2[no2.length - 1], { target: { value: 'Segundo' } })
    const dn2 = screen.getAllByLabelText(/^DNI$/i)
    fireEvent.change(dn2[dn2.length - 1], { target: { value: '222' } })
    // set rango 12-12 a 12-16 (incluye 10? no, incluye 15 sí, 20 no)
    const desde = screen.getByLabelText(/Fecha desde/i)
    fireEvent.change(desde, { target: { value: '2025-12-12' } })
    const hasta = screen.getByLabelText(/Fecha hasta/i)
    fireEvent.change(hasta, { target: { value: '2025-12-16' } })
    fireEvent.click(screen.getByText('Clonar fechas del 1º integrante'))
    fireEvent.click(screen.getByText('Crear Solicitud'))
    await waitFor(() => expect(mockRequest).toHaveBeenCalled())
    const calls = mockRequest.mock.calls
    const postCall = [...calls].reverse().find((c) => typeof c[0] === 'string' && c[0].includes('/api/solicitudes/investigacion') && c[1]?.method === 'POST') || calls[calls.length - 1]
    const rawBody = postCall[1].body
    const body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody
    expect(body.integrantes[1].reservas_detalladas).toEqual([
      { fecha: '2025-12-15', es_diurno: false, es_pernocte: true }
    ])
  })
})
