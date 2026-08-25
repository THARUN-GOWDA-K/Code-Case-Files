import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type CaseItem = { id: number; title: string; summary?: string }

export default function ChallengeList() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/challenges/')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load cases')
        return r.json()
      })
      .then((data) => {
        setCases(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            height: '2rem',
            background: 'var(--color-evidence)',
            borderRadius: '4px',
            marginBottom: '1rem',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            height: '1rem',
            width: '60%',
            background: 'var(--color-evidence)',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite 0.2s',
          }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="dossier-card" style={{ opacity: 0.5 }}>
            <div style={{
              height: '1.5rem',
              background: 'var(--color-evidence)',
              borderRadius: '4px',
              marginBottom: '0.5rem',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              height: '1rem',
              width: '80%',
              background: 'var(--color-evidence)',
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite 0.3s',
            }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="verdict-banner verdict-error">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>CASE FILES UNAVAILABLE</div>
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{error}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ 
          color: 'var(--color-redacted)', 
          fontSize: '0.85rem', 
          fontFamily: 'var(--font-display)',
          letterSpacing: '1px',
        }}>
          CASE FILES
        </span>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        color: 'var(--color-typewriter)',
        marginBottom: '2rem',
        letterSpacing: '1px',
      }}>
        AVAILABLE CASES
      </h2>

      {cases.length === 0 ? (
        <div className="dossier-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
          }}>
            📁 No case files assigned
          </p>
          <p style={{ color: 'var(--color-redacted)' }}>
            Check back later for new assignments
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cases.map((c, index) => (
            <Link 
              key={c.id} 
              to={`/case/${c.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="dossier-card">
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-clue)',
                  marginBottom: '0.5rem',
                  fontSize: '1.3rem',
                }}>
                  CASE #{index + 1}: {c.title}
                </h3>
                {c.summary && (
                  <p style={{ 
                    color: 'var(--color-redacted)', 
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    {c.summary}
                  </p>
                )}
                <div style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span style={{
                    color: 'var(--color-clue)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '1px',
                  }}>
                    INVESTIGATE →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
