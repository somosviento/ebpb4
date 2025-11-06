import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthContextType = {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const BASE = (import.meta as any).env?.BASE_URL || '/'
const STORAGE_KEY = `${String(BASE).replace(/\/$/, '') || '/'}:token`

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
  })

  useEffect(() => {
    try {
      if (token) localStorage.setItem(STORAGE_KEY, token)
      else localStorage.removeItem(STORAGE_KEY)
    } catch { /* ignore storage */ }
  }, [token])

  const value = useMemo(
    () => ({
      token,
      login: (t: string) => setToken(t),
      logout: () => setToken(null),
    }),
    [token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
