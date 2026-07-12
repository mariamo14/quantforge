import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Last-resort catch so a rendering bug shows a friendly card, not a white page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-line bg-surface-1 p-8 text-center">
          <span className="text-4xl">🔧</span>
          <h1 className="mt-3 text-xl font-bold">Something broke on our side</h1>
          <p className="mt-2 text-sm text-ink-muted">
            The error has been logged to the console. Reloading usually fixes it — your
            progress is safe on the server.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-gradient-to-r from-brand to-accent px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
