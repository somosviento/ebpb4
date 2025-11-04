import { useNotifications } from '../context/NotificationContext'

export default function NotificationCenter() {
  const { notifications, remove } = useNotifications()
  if (notifications.length === 0) return null
  return (
    <div style={{ position: 'fixed', top: 8, right: 8, maxWidth: 320 }} aria-live="polite" aria-atomic="true">
      {notifications.map((n) => (
        <div key={n.id} style={{ border: '1px solid #888', background: '#fff', padding: 8, marginBottom: 8 }} role="status">
          <strong>{n.type.toUpperCase()}</strong>
          <div>{n.message}</div>
          <button aria-label="Cerrar notificación" onClick={() => remove(n.id)}>x</button>
        </div>
      ))}
    </div>
  )
}
