import { useState } from 'react'
import { ParticipanteReservaOut } from '../models'
import { useApiClient } from '../api/client'
import { useNotifications } from '../context/NotificationContext'

export function useAdminParticipanteReservas(participanteId: number, onChanged: () => void) {
  const { request } = useApiClient()
  const { push } = useNotifications()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [fecha, setFecha] = useState('')
  const [esDiurno, setEsDiurno] = useState(false)
  const [esPernocte, setEsPernocte] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function resetForm() {
    setFecha(''); setEsDiurno(false); setEsPernocte(false); setEditingId(null); setAdding(false)
  }

  function startAdd() { resetForm(); setAdding(true) }

  function startEdit(r: ParticipanteReservaOut) {
    setEditingId(r.id)
    setFecha(r.fecha)
    setEsDiurno(r.es_diurno)
    setEsPernocte(r.es_pernocte)
    setAdding(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!fecha) {
      push({ type: 'error', message: 'Fecha requerida', autoCloseMs: 2500 })
      return
    }
    setSubmitting(true)
    try {
      if (editingId) {
        await request(`/api/admin/participantes-reservas/${editingId}`, { method: 'PUT', body: { fecha, es_diurno: esDiurno, es_pernocte: esPernocte } })
        push({ type: 'success', message: 'Reserva actualizada', autoCloseMs: 2500 })
      } else {
        await request(`/api/admin/participantes/${participanteId}/reservas`, { method: 'POST', body: { fecha, es_diurno: esDiurno, es_pernocte: esPernocte } })
        push({ type: 'success', message: 'Reserva agregada', autoCloseMs: 2500 })
      }
      resetForm()
      onChanged()
    } catch (err: any) {
      push({ type: 'error', message: err.message || 'Error', autoCloseMs: 4000 })
    } finally {
      setSubmitting(false)
    }
  }

  async function onDelete(id: number) {
    if (!confirm('¿Eliminar reserva?')) return
    try {
      await request(`/api/admin/participantes-reservas/${id}`, { method: 'DELETE' })
      push({ type: 'success', message: 'Reserva eliminada', autoCloseMs: 2000 })
      onChanged()
    } catch (err: any) {
      push({ type: 'error', message: err.message || 'Error eliminando', autoCloseMs: 4000 })
    }
  }

  return {
    adding,
    editingId,
    fecha,
    esDiurno,
    esPernocte,
    submitting,
    setFecha,
    setEsDiurno,
    setEsPernocte,
    startAdd,
    startEdit,
    submit,
    onDelete,
    resetForm,
  }
}
