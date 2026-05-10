import React from 'react'

interface Props {
  children: React.ReactNode
  onError?: (error: Error) => void
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="cv-error-panel">
          <div className="cv-error-title">Render Error</div>
          <pre className="cv-error-message">{this.state.error.message}</pre>
          <pre className="cv-error-stack">{this.state.error.stack}</pre>
          <button
            className="cv-btn cv-btn-secondary"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
