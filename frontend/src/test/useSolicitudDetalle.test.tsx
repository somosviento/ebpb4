import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useSolicitudDetalle } from '../hooks/useSolicitudDetalle'
import { NotificationProvider } from '../context/NotificationContext'
import { AuthProvider } from '../context/AuthContext'

const mockRequest = vi.fn()
vi.mock('../api/client', () => ({
  useApiClient: () => ({ request: mockRequest }),
  ApiError: class extends Error { constructor(public status: number, msg: string){ super(msg) } }
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return <NotificationProvider><AuthProvider>{children}</AuthProvider></NotificationProvider>
}

function Demo({ id }: { id: string }) {
  const { solicitud, loading, error } = useSolicitudDetalle(id)
  if (loading) return <div>loading</div>
  if (error) return <div>Error: {error}</div>
  return <div data-testid="result">{solicitud?.id}</div>
}

describe('useSolicitudDetalle', () => {
  beforeEach(() => { mockRequest.mockReset() })

  it('carga y muestra id', async () => {
    mockRequest.mockResolvedValue({ id: 5, tipo_solicitud: 'investigacion', objetivos: '', actividades: '', fecha_creacion: '2025-09-01', fecha_inicio_actividad_general: '2025-09-01', fecha_fin_actividad_general: '2025-09-02', responsable_apellido_nombre: '', responsable_dni: '', responsable_email_principal: '', participantes: [] })
    render(<Wrapper><Demo id="5" /></Wrapper>)
    expect(await screen.findByTestId('result')).toHaveTextContent('5')
  })

  it('maneja error', async () => {
    mockRequest.mockRejectedValue(new Error('boom'))
    render(<Wrapper><Demo id="7" /></Wrapper>)
    await screen.findByText(/Error:/)
  })
})
