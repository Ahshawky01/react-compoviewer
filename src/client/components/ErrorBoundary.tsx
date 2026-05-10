import React from 'react'

interface Props {
  children: React.ReactNode
  onError?: (error: Error) => void
}

interface State {
  error: Error | null
}

const CONTEXT_PATTERNS = [
  /must be used within (?:a |an )?(\w+)/i,
  /must be wrapped (?:in|with) (?:a |an )?<(\w+)/i,
  /(\w+Provider)\s+is required/i,
  /No (\w+) (?:context |was )?found/i,
  /could not find .* (?:context|provider)/i,
]

function detectMissingProvider(message: string): string | null {
  for (const pattern of CONTEXT_PATTERNS) {
    const match = message.match(pattern)
    if (match) return match[1] ?? null
  }
  if (/context|provider/i.test(message)) return 'a context provider'
  return null
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
      const provider = detectMissingProvider(this.state.error.message)

      if (provider) {
        const wrapperCode = `// compoviewer-wrapper.tsx
import { ${provider} } from './path/to/${provider}'

export default function Wrapper({ children }) {
  return <${provider}>{children}</${provider}>
}`
        const configCode = `// compoviewer.config.ts
import { defineConfig } from 'react-compoviewer'

export default defineConfig({
  wrapper: './src/compoviewer-wrapper.tsx',
})`

        return (
          <div className="cv-error-panel">
            <div className="cv-error-title">Missing Provider</div>
            <div className="cv-error-message" style={{ color: 'var(--cv-text)' }}>
              This component needs <strong>{provider}</strong> to render.
            </div>
            <div style={{ margin: '12px 0 8px', fontSize: 12, color: 'var(--cv-text-muted)' }}>
              Fix: create a wrapper file and add it to your config:
            </div>
            <pre
              className="cv-error-stack"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => navigator.clipboard?.writeText(wrapperCode)}
              title="Click to copy"
            >
              {wrapperCode}
            </pre>
            <pre
              className="cv-error-stack"
              style={{ cursor: 'pointer', marginTop: 8 }}
              onClick={() => navigator.clipboard?.writeText(configCode)}
              title="Click to copy"
            >
              {configCode}
            </pre>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                className="cv-btn cv-btn-secondary"
                onClick={() => this.setState({ error: null })}
              >
                Retry
              </button>
              <span style={{ fontSize: 11, color: 'var(--cv-text-muted)', alignSelf: 'center' }}>
                Click code blocks to copy
              </span>
            </div>
          </div>
        )
      }

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
