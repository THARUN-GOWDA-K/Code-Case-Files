import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      animation: 'scaleIn 400ms ease',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}>
        🔍
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        letterSpacing: '0.15em',
        color: 'var(--c-error)',
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
        fontWeight: 700,
      }}>
        Error 404 — Evidence Not Found
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '3rem',
        fontWeight: 700,
        color: 'var(--c-text)',
        letterSpacing: '-0.03em',
        marginBottom: '1rem',
      }}>
        Case File Missing
      </h1>

      <p style={{
        color: 'var(--c-text-muted)',
        fontSize: '1rem',
        maxWidth: 420,
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        The evidence you're looking for has been classified or doesn't exist.
        Return to headquarters and try a different lead.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary">
          🏛 Return to HQ
        </Link>
        <Link to="/sql-cases" className="btn btn-secondary">
          🗄️ SQL Cases
        </Link>
      </div>
    </div>
  )
}
