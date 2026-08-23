import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSqlCases } from '../lib/sqlCases'

type SqlCase = {
  id: number
  slug: string
  title: string
  story_intro?: string
  difficulty?: string
}

const DIFFICULTY_STAMP: Record<string, { class: string; label: string }> = {
  easy: { class: 'stamp-easy', label: 'CLEARED' },
  medium: { class: 'stamp-medium', label: 'CONFIDENTIAL' },
  hard: { class: 'stamp-hard', label: 'RESTRICTED' },
}

export default function SqlCaseList() {
  const [cases, setCases] = useState<SqlCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listSqlCases()
      .then(setCases)
      .catch(() => setError('Failed to load SQL cases'))
      .finally(() => setLoading(false))
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="dossier-card" style={{ opacity: 0.5 }}>
              <div style={{
                height: '1.5rem',
                background: 'var(--color-evidence)',
                borderRadius: '4px',
                marginBottom: '1rem',
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
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="verdict-banner verdict-error">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>SQL CASE FILES UNAVAILABLE</div>
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
          CASE FILES → SQL INVESTIGATIONS
        </span>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        color: 'var(--color-typewriter)',
        marginBottom: '0.5rem',
        letterSpacing: '1px',
      }}>
        ACTIVE SQL CASES
      </h2>
      <p style={{ 
        color: 'var(--color-redacted)', 
        marginBottom: '2rem', 
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
      }}>
        Select a case file to begin your investigation.
      </p>
      
      {cases.length === 0 ? (
        <div className="dossier-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
          }}>
            📁 No SQL cases assigned yet
          </p>
          <p style={{ color: 'var(--color-redacted)' }}>
            Check back later for new assignments
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {cases.map((c) => {
            const difficulty = c.difficulty ? DIFFICULTY_STAMP[c.difficulty] : null
            
            return (
              <Link to={`/sql-cases/${c.slug}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div className="dossier-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.25rem', 
                      color: 'var(--color-typewriter)', 
                      fontFamily: 'var(--font-display)',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem' 
                    }}>
                      📁 {c.title}
                    </h3>
                    {difficulty && (
                      <span className={`badge-stamp ${difficulty.class}`} style={{ flexShrink: 0, marginLeft: 12 }}>
                        {difficulty.label}
                      </span>
                    )}
                  </div>
                  {c.story_intro && (
                    <p style={{ 
                      margin: '0', 
                      color: 'var(--color-redacted)', 
                      fontSize: '0.9rem', 
                      lineHeight: 1.5,
                      fontFamily: 'var(--font-body)',
                    }}>
                      {c.story_intro.slice(0, 120).trimEnd()}…
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
            )
          })}
        </div>
      )}
    </div>
  )
}
