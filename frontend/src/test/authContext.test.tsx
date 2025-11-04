import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { AuthProvider, useAuth } from '../context/AuthContext'

function Demo() {
  const { token, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="token">{token || ''}</span>
      <button onClick={() => login('X')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  it('login y logout modifican token y localStorage', async () => {
    localStorage.removeItem('token')
    render(<AuthProvider><Demo /></AuthProvider>)
    const span = screen.getByTestId('token')
    expect(span.textContent).toBe('')
    await act(async () => { screen.getByText('login').click() })
    expect(localStorage.getItem('token')).toBe('X')
    expect(screen.getByTestId('token').textContent).toBe('X')
    await act(async () => { screen.getByText('logout').click() })
    expect(localStorage.getItem('token')).toBeNull()
    expect(screen.getByTestId('token').textContent).toBe('')
  })
})
