import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSqlCases } from '../lib/sqlCases'

type SqlCase = {
  id: number
  slug: string
  title: string
  story_intro?: string
  difficulty?: string
  stages?: { id: number; order: number; title: string }[]
}

const DIFF_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  easy:   { label: 'Easy',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  emoji: '🟢' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  emoji: '🟡' },
  hard:   { label: 'Hard',   color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',   emoji: '🔴' },
}

function CaseSkeleton() {
  return (
    <div style={{
      background: 'var(--c-shadow)',
      border: '1px solid var(--c-border)',
      borderRadius: 'var(--r-lg)',
      padding: '1.75rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ height: 20, width: '50%' }} />
        <div className="skeleton" style={{ height: 20, width: 60, borderRadius: 'var(--r-full)' }} />
      </div>
      <div className="skeleton" style={{ height: 13, marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: 13, width: '80%', marginBottom: '1.25rem' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 'var(--r-full)' }} />
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 'var(--r-full)' }} />
      </div>
    </div>
  )
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

  if (loading) return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="skeleton" style={{ height: 12, width: 140, marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ height: 32, width: 300 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {[1,2,3].map(i => <CaseSkeleton key={i} />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="verdict-banner verdict-error">
      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700 }}>SQL CASE FILES UNAVAILABLE</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 400, marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>{error}</div>
      </div>
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--c-amber)',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>🗄️</span> SQL Database Investigations
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--c-text)',
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          Active SQL Cases
        </h2>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>
          Query the evidence databases to uncover the truth. Each query gets checked instantly.
        </p>
      </div>

      {cases.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--c-shadow)',
          borderRadius: 'var(--r-lg)',
          border: '1px solid var(--c-border)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗄️</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--c-text-muted)' }}>
            No SQL cases available yet
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {cases.map((c, index) => {
            const diff = c.difficulty ? DIFF_CONFIG[c.difficulty] : null
            const stageCount = c.stages?.length ?? 0

            return (
              <Link
                key={c.id}
                to={`/sql-cases/${c.slug}`}
                className="case-card"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  animationDelay: `${index * 70}ms`,
                  opacity: 0,
                  animation: `slideInUp 400ms ease forwards`,
                }}
              >
                {/* Top row: title + difficulty */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      color: 'var(--c-text-faint)',
                      letterSpacing: '0.1em',
                      marginBottom: '0.3rem',
                    }}>
                      SQL CASE #{String(index + 1).padStart(3, '0')}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: 'var(--c-text)',
                      letterSpacing: '-0.01em',
                    }}>
                      {c.title.replace(/^Case #\d+ — /, '')}
                    </h3>
                  </div>
                  {diff && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.55rem',
                      background: diff.bg,
                      borderRadius: 'var(--r-sm)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: diff.color,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                      transform: 'rotate(-1.5deg)',
                    }}>
                      {diff.label}
                    </span>
                  )}
                </div>

                {/* Story intro */}
                {c.story_intro && (
                  <p style={{
                    color: 'var(--c-text-muted)',
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {c.story_intro}
                  </p>
                )}

                {/* Footer meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {stageCount > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.2rem 0.55rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--c-border)',
                        borderRadius: 'var(--r-sm)',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--c-text-muted)',
                      }}>
                        📋 {stageCount} stage{stageCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.55rem',
                      background: 'rgba(56,189,248,0.06)',
                      border: '1px solid rgba(56,189,248,0.12)',
                      borderRadius: 'var(--r-sm)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--c-info)',
                    }}>
                      SQL
                    </span>
                  </div>
                  <span style={{ color: 'var(--c-amber)', fontSize: '1rem', transition: 'transform 200ms ease' }}>→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
