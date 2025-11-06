import React from 'react'
import { mapValidationErrors, HTTPValidationError } from '../models'
import { useAuth } from '../context/AuthContext'

export class ApiError extends Error {
  status: number
  validation?: Record<string, string[]>
  raw?: unknown
  constructor(status: number, message: string, opts?: { validation?: Record<string, string[]>; raw?: unknown }) {
    super(message)
    this.status = status
    this.validation = opts?.validation
    this.raw = opts?.raw
  }
}

export type HttpOptions = Omit<RequestInit, 'body'> & { body?: any; retry?: number }

async function doFetch(url: string, opts: HttpOptions, token?: string | null, attempt = 0): Promise<Response> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const init: RequestInit = {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }
  try {
    const res = await fetch(url, init)
    if (!res.ok) {
      // Retry logic solo para GET en errores 5xx
      if (res.status >= 500 && res.status < 600 && opts.retry && attempt < opts.retry) {
        return doFetch(url, opts, token, attempt + 1)
      }
    }
    return res
  } catch (e) {
    if (opts.retry && attempt < opts.retry) {
      return doFetch(url, opts, token, attempt + 1)
    }
    throw e
  }
}

async function parseJsonSafe(res: Response): Promise<any | undefined> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try { return await res.json() } catch { return undefined }
  }
  return undefined
}

const DEFAULT_API_BASE = (import.meta.env as any).VITE_API_BASE || ''

function resolveUrl(url: string) {
  // If url is absolute (starts with http) or already contains the base, leave it
  if (/^https?:\/\//i.test(url)) return url
  if (DEFAULT_API_BASE && url.startsWith(DEFAULT_API_BASE)) return url
  // Ensure proper joining (no duplicate slashes)
  return `${DEFAULT_API_BASE.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`
}

export function useHttp() {
  const { token } = useAuth()

  const request = React.useCallback(async function request<T>(url: string, opts: HttpOptions = {}): Promise<T> {
  const fullUrl = resolveUrl(url)
  const res = await doFetch(fullUrl, opts, token)
    const data = await parseJsonSafe(res)
    if (!res.ok) {
      if (res.status === 422 && data) {
        const validation = mapValidationErrors(data as HTTPValidationError)
        throw new ApiError(res.status, 'Validation Error', { validation, raw: data })
      }
      throw new ApiError(res.status, data?.detail || data?.message || `HTTP ${res.status}`, { raw: data })
    }
    return data as T
  }, [token])

  return { request }
}
