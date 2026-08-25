import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type CaseItem = {
  id: number
  title: string
  summary?: string
  difficulty?: string
  stages?: { id: number; order: number; title: string }[]
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  beginner: { label: 'Beginner', color: '#10b981', bg: 'rgba(16,185,129,0.1)', emoji: '🟢' },
  easy:     { label: 'Easy',     color: '#10b981', bg: 'rgba(16,185,129,0.1)', emoji: '🟢' },
  medium:   { label: 'Medium',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', emoji: '🟡' },
  hard:     { label: 'Hard',     color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  emoji: '🔴' },
}

function CaseSkeleton() {
  return (
    <div style={{
      background: 'var(--c-shadow)',
      border: '1px solid var(--c-border)',
      borderRadius: 'var(--r-lg)',
      padding: '1.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      <div className="skeleton" style={{ height: 20, width: '65%' }} />
      <div className="skeleton" style={{ height: 14, width: '90%' }} />
      <div className="skeleton" style={{ height: 14, width: '75%' }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 'var(--r-full)' }} />
        <div className="skeleton" style={{ height: 24, width: 50, borderRadius: 'var(--r-full)' }} />
      </div>
    </div>
  )
}

export default function ChallengeList() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/challenges/')
      .then(r => { if (!r.ok) throw new Error('Failed to load cases'); return r.json() })
      .then(data => { setCases(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="skeleton" style={{ height: 12, width: 120, marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ height: 32, width: 280 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1,2,3].map(i => <CaseSkeleton key={i} />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="verdict-banner verdict-error">
      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700 }}>CASE FILES UNAVAILABLE</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 400, marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>{error}</div>
      </div>
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      {/* Page header */}
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
          <span>🔍</span> Programming Cases
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--c-text)',
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
        }}>
          Active Case Files
        </h2>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>
          Each case contains multiple investigation stages. Solve them to earn XP and unlock the truth.
        </p>
      </div>

      {/* Case list */}
      {cases.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--c-shadow)',
          borderRadius: 'var(--r-lg)',
          border: '1px solid var(--c-border)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            color: 'var(--c-text-muted)',
            marginBottom: '0.5rem',
          }}>
            No case files assigned yet
          </div>
          <p style={{ color: 'var(--c-text-faint)', fontSize: '0.875rem' }}>
            Check back soon for new assignments.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cases.map((c, index) => {
            const diff = c.difficulty ? DIFFICULTY_CONFIG[c.difficulty] ?? DIFFICULTY_CONFIG.easy : null
            const stageCount = c.stages?.length ?? 0
            return (
              <Link
                key={c.id}
                to={`/case/${c.id}`}
                className="case-card"
                style={{
                  animationDelay: `${index * 60}ms`,
                  opacity: 0,
                  animation: `slideInUp 400ms ease forwards`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Case number */}
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      color: 'var(--c-text-faint)',
                      letterSpacing: '0.1em',
                      marginBottom: '0.4rem',
                      textTransform: 'uppercase',
                    }}>
                      Case #{String(index + 1).padStart(3, '0')}
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      color: 'var(--c-text)',
                      marginBottom: '0.6rem',
                      letterSpacing: '-0.01em',
                    }}>
                      {c.title}
                    </h3>

                    {/* Summary */}
                    {c.summary && (
                      <p style={{
                        color: 'var(--c-text-muted)',
                        fontSize: '0.875rem',
                        lineHeight: 1.55,
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {c.summary}
                      </p>
                    )}

                    {/* Meta tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      {diff && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.6rem',
                          background: diff.bg,
                          borderRadius: 'var(--r-sm)',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: diff.color,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}>
                          {diff.emoji} {diff.label}
                        </span>
                      )}
                      {stageCount > 0 && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.6rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--c-border)',
                          borderRadius: 'var(--r-sm)',
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--c-text-muted)',
                          letterSpacing: '0.04em',
                        }}>
                          📋 {stageCount} stage{stageCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    width: 40,
                    height: 40,
                    background: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.15)',
                    borderRadius: 'var(--r-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--c-amber)',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    transition: 'all 200ms ease',
                  }}>
                    →
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
