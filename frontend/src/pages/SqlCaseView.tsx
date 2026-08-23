import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSqlCase } from '../lib/sqlCases'

type Stage = {
  id: number
  order: number
  title: string
  prompt?: string
  xp_reward: number
}

type SqlCaseDetail = {
  id: number
  slug: string
  title: string
  story_intro?: string
  difficulty?: string
  stages: Stage[]
}

const DIFFICULTY_STAMP: Record<string, { class: string; label: string }> = {
  easy: { class: 'stamp-easy', label: 'CLEARED' },
  medium: { class: 'stamp-medium', label: 'CONFIDENTIAL' },
  hard: { class: 'stamp-hard', label: 'RESTRICTED' },
}

export default function SqlCaseView() {
  const { slug } = useParams<{ slug: string }>()
  const [caseData, setCaseData] = useState<SqlCaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    getSqlCase(slug)
      .then(setCaseData)
      .catch(() => setError('Case not found'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            height: '2.5rem',
            background: 'var(--color-evidence)',
            borderRadius: '4px',
            marginBottom: '1rem',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            height: '1rem',
            width: '40%',
            background: 'var(--color-evidence)',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite 0.2s',
          }} />
        </div>
        <div className="dossier-card" style={{ opacity: 0.5, marginBottom: '2rem' }}>
          <div style={{
            height: '1rem',
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
        {[1, 2, 3].map((i) => (
          <div key={i} className="dossier-card" style={{ opacity: 0.5, marginBottom: '1rem' }}>
            <div style={{
              height: '1.5rem',
              background: 'var(--color-evidence)',
              borderRadius: '4px',
              marginBottom: '0.5rem',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        ))}
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="verdict-banner verdict-error">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>CASE FILE NOT FOUND</div>
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{error ?? 'Unknown error'}</div>
          </div>
        </div>
      </div>
    )
  }

  const difficulty = caseData.difficulty ? DIFFICULTY_STAMP[caseData.difficulty] : null

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          to="/sql-cases" 
          style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '0.85rem', 
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            textDecoration: 'none',
          }}
        >
          ← RETURN TO SQL CASES
        </Link>
      </div>

      {/* Case header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <h2 style={{ 
          margin: 0, 
          fontSize: '2.5rem', 
          color: 'var(--color-typewriter)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '1px',
        }}>
          {caseData.title}
        </h2>
        {difficulty && (
          <span className={`badge-stamp ${difficulty.class}`} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem', transform: 'rotate(-2deg)' }}>
            {difficulty.label}
          </span>
        )}
      </div>
      
      <p style={{ 
        color: 'var(--color-redacted)', 
        fontFamily: 'var(--font-mono)', 
        fontSize: '0.9rem', 
        marginBottom: '2rem',
        letterSpacing: '0.5px',
      }}>
        FILE REF: CASE-{caseData.id.toString().padStart(4, '0')} // STATUS: OPEN
      </p>

      {/* Story intro */}
      {caseData.story_intro && (
        <div className="official-memo" style={{ marginBottom: '3rem' }}>
          {caseData.story_intro}
        </div>
      )}

      {/* Stage list */}
      <h3 style={{ 
        marginTop: '3rem', 
        marginBottom: '1.5rem', 
        borderBottom: '1px solid var(--color-redacted)', 
        paddingBottom: '0.5rem', 
        color: 'var(--color-redacted)', 
        display: 'inline-block',
        fontFamily: 'var(--font-display)',
        letterSpacing: '1px',
      }}>
        INVESTIGATION STEPS
      </h3>
      
      {caseData.stages.length === 0 ? (
        <div className="dossier-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
          }}>
            🔍 No investigation steps available
          </p>
          <p style={{ color: 'var(--color-redacted)' }}>
            This case file is incomplete
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {caseData.stages.map((s) => (
            <Link 
              key={s.id} 
              to={`/sql-stages/${s.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="dossier-card" style={{ 
                marginBottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem 1.5rem',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '1.1rem', 
                  color: 'var(--color-typewriter)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  flex: 1,
                  fontFamily: 'var(--font-display)',
                }}>
                  <span style={{ 
                    color: 'var(--color-clue)', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.9rem',
                    minWidth: '3rem',
                  }}>
                    [{s.order.toString().padStart(2, '0')}]
                  </span>
                  {s.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ 
                    color: 'var(--color-verified)', 
                    fontSize: '0.85rem', 
                    fontFamily: 'var(--font-mono)', 
                    background: 'rgba(13, 148, 136, 0.1)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    border: '1px solid var(--color-verified)',
                  }}>
                    +{s.xp_reward} XP
                  </span>
                  <span style={{
                    color: 'var(--color-clue)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '1px',
                  }}>
                    →
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
