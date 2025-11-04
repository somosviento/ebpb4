import React, { createContext, useCallback, useContext, useState } from 'react'

export type Notification = {
  id: string
  type: 'info' | 'error' | 'success'
  message: string
  createdAt: number
  autoCloseMs?: number
}

type NotificationContextType = {
  notifications: Notification[]
  push: (n: Omit<Notification, 'id' | 'createdAt'>) => void
  remove: (id: string) => void
  clear: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const remove = useCallback((id: string) => {
    setNotifications((list) => list.filter((n) => n.id !== id))
  }, [])

  const push: NotificationContextType['push'] = useCallback((n) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const createdAt = Date.now()
    const full: Notification = { id, createdAt, ...n }
    setNotifications((list) => [...list, full])
    if (n.autoCloseMs) {
      setTimeout(() => remove(id), n.autoCloseMs)
    }
  }, [remove])

  const clear = useCallback(() => setNotifications([]), [])

  return (
    <NotificationContext.Provider value={{ notifications, push, remove, clear }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider')
  return ctx
}
