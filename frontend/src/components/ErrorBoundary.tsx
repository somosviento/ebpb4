import React from 'react'

type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Error' }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Placeholder: could push to notifications or log
    // console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return <div>Ocurrió un error en la interfaz: {this.state.message}</div>
    }
    return this.props.children
  }
}
