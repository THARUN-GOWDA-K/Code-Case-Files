import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--color-typewriter)',
          fontFamily: 'var(--font-body)',
        }}>
          <div className="verdict-banner verdict-error" style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 'bold' }}>APPLICATION ERROR</div>
              <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                Something went wrong. Please refresh the page.
              </div>
            </div>
          </div>
          {this.state.error && (
            <details style={{ 
              marginTop: '1rem', 
              textAlign: 'left',
              background: 'var(--color-evidence)',
              padding: '1rem',
              borderRadius: '4px',
              border: '1px solid var(--color-redacted)',
            }}>
              <summary style={{ cursor: 'pointer', color: 'var(--color-clue)' }}>
                Error details
              </summary>
              <pre style={{ 
                marginTop: '1rem',
                color: 'var(--color-redacted)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--color-clue)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
