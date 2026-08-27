import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSqlCase, getMySqlSubmissions, listSqlCases } from '../lib/sqlCases'
import { useAuth } from '../contexts/AuthContext'

type Stage = { id: number; order: number; title: string; prompt?: string; xp_reward: number }
type NpcChar = { id: string; name: string; avatar: string; title: string }
type SqlCaseDetail = {
  id: number
  slug: string
  title: string
  story_intro?: string
  difficulty?: string
  intro_dialogue?: string
  epilogue_text?: string
  npc_characters?: NpcChar[]
  stages: Stage[]
}
type Submission = { id: number; stage_id: number; correct: boolean; xp_awarded: number }
type SqlCaseListItem = { id: number; slug: string; title: string; difficulty?: string }

const DIFF_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: 'Easy',   color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  hard:   { label: 'Hard',   color: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
}

export default function SqlCaseView() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [caseData, setCaseData] = useState<SqlCaseDetail | null>(null)
  const [allCases, setAllCases] = useState<SqlCaseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])

  useEffect(() => {
    if (!slug) return
    getSqlCase(slug).then(setCaseData).catch(() => setError('Case not found')).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!user) return
    getMySqlSubmissions().then(setSubmissions).catch(() => {})
  }, [user])

  useEffect(() => {
    listSqlCases().then(setAllCases).catch(() => {})
  }, [])

  const isCompleted = (stageId: number) => submissions.some(s => s.stage_id === stageId && s.correct)

  if (loading) return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div className="skeleton" style={{ height: 14, width: 180, marginBottom: '1.5rem' }} />
      <div className="skeleton" style={{ height: 40, width: 320, marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: 14, width: 200, marginBottom: '2rem' }} />
      <div className="skeleton" style={{ height: 120, marginBottom: '2rem' }} />
      {[1,2,3].map(i => (
        <div key={i} className="skeleton" style={{ height: 72, marginBottom: '0.75rem', borderRadius: 'var(--r-md)' }} />
      ))}
    </div>
  )

  if (error || !caseData) return (
    <div className="verdict-banner verdict-error">
      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700 }}>CASE FILE NOT FOUND</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 400, marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>
          {error ?? 'Unknown error'}.{' '}
          <Link to="/sql-cases" style={{ color: 'inherit', textDecoration: 'underline' }}>Return to cases</Link>
        </div>
      </div>
    </div>
  )

  const sortedStages = [...caseData.stages].sort((a, b) => a.order - b.order)
  const currentIdx = allCases.findIndex(c => c.slug === slug)
  const nextCase = currentIdx >= 0 && currentIdx < allCases.length - 1 ? allCases[currentIdx + 1] : null
  const completedCount = sortedStages.filter(s => isCompleted(s.id)).length
  const allSolved = completedCount === sortedStages.length && sortedStages.length > 0
  const diff = caseData.difficulty ? DIFF_CONFIG[caseData.difficulty] : null

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/sql-cases" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--c-text-muted)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}>
          ← SQL Cases
        </Link>
      </div>

      {/* Case header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              color: 'var(--c-text-faint)',
              marginBottom: '0.4rem',
            }}>
              FILE REF: CASE-{caseData.id.toString().padStart(4, '0')} // STATUS: {allSolved ? 'CLOSED' : 'ACTIVE INVESTIGATION'}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--c-text)',
              letterSpacing: '-0.02em',
            }}>
              {caseData.title}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start', flexShrink: 0 }}>
            {diff && (
              <span style={{
                padding: '0.25rem 0.7rem',
                background: diff.bg,
                borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: diff.color,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {diff.label}
              </span>
            )}
            <span style={{
              padding: '0.25rem 0.7rem',
              background: allSolved ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (allSolved ? 'rgba(16,185,129,0.3)' : 'var(--c-border)'),
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: allSolved ? 'var(--c-success)' : 'var(--c-text-muted)',
              letterSpacing: '0.06em',
            }}>
              {completedCount}/{sortedStages.length} stages solved
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {sortedStages.length > 0 && (
          <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
            <div className="progress-bar-fill" style={{
              width: ((completedCount / sortedStages.length) * 100) + '%',
              background: allSolved
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            }} />
          </div>
        )}
      </div>

      {/* Case intro briefing */}
      {caseData.intro_dialogue && (
        <div style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderLeft: '3px solid #ef4444',
          borderRadius: 'var(--r-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#ef4444',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            <span>👮</span> Commissioner Blake's Briefing
          </div>
          <p style={{
            color: 'var(--c-text-muted)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
            fontStyle: 'italic',
            margin: 0,
          }}>
            "{caseData.intro_dialogue}"
          </p>
        </div>
      )}

      {/* Story memo */}
      {caseData.story_intro && (
        <div className="official-memo" style={{ marginBottom: '2rem' }}>
          {caseData.story_intro}
        </div>
      )}

      {/* Case Epilogue if all solved */}
      {allSolved && caseData.epilogue_text && (
        <div style={{
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderLeft: '3px solid #10b981',
          borderRadius: 'var(--r-md)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          animation: 'fadeIn 400ms ease',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#10b981',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <span>🎯</span> Case Epilogue — Solved & Closed
          </div>
          <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            {caseData.epilogue_text}
          </p>
        </div>
      )}

      {/* Investigation steps */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--c-amber)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span>📋</span> Investigation Stages
      </div>

      {sortedStages.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          background: 'var(--c-shadow)', borderRadius: 'var(--r-lg)',
          border: '1px solid var(--c-border)',
          color: 'var(--c-text-muted)',
        }}>
          No investigation stages yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sortedStages.map((s, i) => {
            const done = isCompleted(s.id)
            return (
              <Link
                key={s.id}
                to={'/sql-stages/' + s.id}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: done ? 'rgba(16,185,129,0.05)' : 'var(--c-shadow)',
                  border: '1px solid ' + (done ? 'rgba(16,185,129,0.2)' : 'var(--c-border)'),
                  borderLeft: '3px solid ' + (done ? 'var(--c-success)' : 'var(--c-amber)'),
                  borderRadius: 'var(--r-md)',
                  transition: 'all 200ms ease',
                  animationDelay: (i * 60) + 'ms',
                  opacity: 0,
                  animation: 'slideInUp 350ms ease forwards',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Step number */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: done ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.1)',
                  border: '1.5px solid ' + (done ? 'rgba(16,185,129,0.4)' : 'rgba(251,191,36,0.3)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  color: done ? 'var(--c-success)' : 'var(--c-amber)',
                }}>
                  {done ? '✓' : s.order}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'var(--c-text)',
                    marginBottom: '0.2rem',
                  }}>
                    {s.title}
                    {done && (
                      <span style={{
                        marginLeft: '0.5rem',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: 4,
                        color: 'var(--c-success)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        verticalAlign: 'middle',
                      }}>
                        SOLVED
                      </span>
                    )}
                  </div>
                </div>

                {/* XP reward */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--c-success)',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--r-sm)',
                    letterSpacing: '0.04em',
                  }}>
                    +{s.xp_reward} XP
                  </span>
                  <span style={{ color: 'var(--c-amber)', fontSize: '1.1rem' }}>→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Next Case */}
      {nextCase && (
        <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--c-border)' }}>
          <Link to={/sql-cases/} className="btn btn-success">
            Next Case: {nextCase.title} →
          </Link>
        </div>
      )}
    </div>
  )
}
