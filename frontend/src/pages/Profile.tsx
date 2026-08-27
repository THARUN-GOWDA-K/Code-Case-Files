import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAttemptsMe, getAchievements, getMyAchievements } from '../lib/api'
import { getMySqlSubmissions } from '../lib/sqlCases'
import { Link } from 'react-router-dom'

type Attempt = {
  id: number; stage_id: number; status: string
  score: number; tests_passed: number; total_tests: number; submitted_at?: string
}
type SqlSub = {
  id: number; stage_id: number; correct: boolean
  xp_awarded: number; feedback?: string; submitted_at?: string
}
type Achievement = {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  xp_reward: number
}
type MyAchievement = {
  id: number
  slug: string
  name: string
  description: string
  icon: string
  unlocked_at?: string
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: 'var(--c-shadow)',
      border: '1px solid var(--c-border)',
      borderRadius: 'var(--r-md)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      transition: 'all 200ms ease',
    }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--c-border)')}
    >
      <div style={{ fontSize: '1.4rem' }}>{icon}</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.5rem',
        fontWeight: 700,
        color: color || 'var(--c-text)',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--c-text-muted)',
      }}>
        {label}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [sqlSubs, setSqlSubs] = useState<SqlSub[]>([])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [myAchievements, setMyAchievements] = useState<MyAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getAttemptsMe().catch(() => []),
      getMySqlSubmissions().catch(() => []),
      getAchievements().catch(() => []),
      getMyAchievements().catch(() => []),
    ])
      .then(([a, s, ach, myAch]) => {
        setAttempts(a)
        setSqlSubs(s)
        setAllAchievements(ach)
        setMyAchievements(myAch)
      })
      .catch(() => setError('Failed to load investigation history'))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div className="skeleton" style={{ height: 40, width: 240, marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--r-md)' }} />)}
      </div>
      <div className="skeleton" style={{ height: 200, borderRadius: 'var(--r-md)' }} />
    </div>
  )

  // Stats
  const totalXp = user?.xp ?? 0
  const pyPassed = attempts.filter(a => a.status === 'passed').length
  const sqlSolved = sqlSubs.filter(s => s.correct).length
  const totalCases = pyPassed + sqlSolved
  const streak = (user as any)?.streak ?? 1
  const rankTitle = (user as any)?.rank_title ?? 'Rookie Detective'

  const unlockedSlugs = new Set(myAchievements.map(a => a.slug))

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
          <span>🪪</span> Detective Dossier
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a5f, #0f2845)',
            border: '2px solid rgba(251,191,36,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--c-amber)',
            fontFamily: 'var(--font-display)',
            flexShrink: 0,
            boxShadow: '0 0 0 4px rgba(251,191,36,0.08)',
          }}>
            {user?.display_name?.[0]?.toUpperCase() ?? '?'}
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--c-amber)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              🎖️ {rankTitle}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--c-text)',
              letterSpacing: '-0.02em',
              marginBottom: '0.25rem',
            }}>
              Detective {user?.display_name}
            </h2>
            <div style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              {user?.email}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.75rem',
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 'var(--r-full)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--c-amber)',
              }}>
                ⚡ {totalXp.toLocaleString()} XP
              </div>
              {streak > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.25)',
                  borderRadius: 'var(--r-full)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#f97316',
                }}>
                  🔥 {streak} Day Streak
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        <StatCard icon="⚡" label="Total XP" value={totalXp.toLocaleString()} color="var(--c-amber)" />
        <StatCard icon="✅" label="Cases Solved" value={totalCases} color="var(--c-success)" />
        <StatCard icon="🔥" label="Login Streak" value={streak + ' d'} color="#f97316" />
        <StatCard icon="🗄️" label="SQL Solved" value={sqlSolved} color="var(--c-info)" />
      </div>

      {/* Achievements Showcase */}
      {allAchievements.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
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
            <span>🏆</span> Detective Badges ({myAchievements.length}/{allAchievements.length})
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            {allAchievements.map(ach => {
              const unlocked = unlockedSlugs.has(ach.slug)
              return (
                <div key={ach.id} style={{
                  padding: '1rem',
                  background: unlocked ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid ' + (unlocked ? 'rgba(251,191,36,0.25)' : 'var(--c-border)'),
                  borderRadius: 'var(--r-md)',
                  opacity: unlocked ? 1 : 0.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}>
                  <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{ach.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: unlocked ? 'var(--c-text)' : 'var(--c-text-muted)' }}>
                      {ach.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', lineHeight: 1.4 }}>
                      {ach.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="notice notice-error" style={{ marginBottom: '2rem' }}>
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      {/* Python History */}
      <div style={{ marginBottom: '3rem' }}>
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
          <span>🐍</span> Python Investigation History
        </div>

        {!error && attempts.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--c-shadow)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📁</div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>
              No programming history yet
            </div>
            <Link to="/cases" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
              Start a Case →
            </Link>
          </div>
        ) : (
          <div style={{
            background: 'var(--c-shadow)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Tests</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
                        Stage #{a.stage_id}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 4,
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          background: a.status === 'passed' ? 'rgba(16,185,129,0.1)' : a.status === 'failed' ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                          color: a.status === 'passed' ? 'var(--c-success)' : a.status === 'failed' ? 'var(--c-error)' : 'var(--c-warn)',
                        }}>
                          {a.status === 'passed' ? '✓ ' : a.status === 'failed' ? '✗ ' : '○ '}
                          {a.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--c-amber)' }}>
                        {a.score}%
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--c-text-muted)' }}>
                        {a.tests_passed}/{a.total_tests}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--c-text-faint)' }}>
                        {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SQL History */}
      <div>
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
          <span>🗄️</span> SQL Investigation History
        </div>

        {sqlSubs.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'var(--c-shadow)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-lg)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗄️</div>
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text-muted)', marginBottom: '0.5rem' }}>
              No SQL history yet
            </div>
            <Link to="/sql-cases" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
              Start SQL Case →
            </Link>
          </div>
        ) : (
          <div style={{
            background: 'var(--c-shadow)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Stage</th>
                    <th>Result</th>
                    <th>XP Earned</th>
                    <th>Feedback</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sqlSubs.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>
                        Stage #{s.stage_id}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 4,
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          background: s.correct ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
                          color: s.correct ? 'var(--c-success)' : 'var(--c-error)',
                        }}>
                          {s.correct ? '✓ Solved' : '✗ Incorrect'}
                        </span>
                      </td>
                      <td style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: s.xp_awarded > 0 ? 'var(--c-success)' : 'var(--c-text-faint)',
                      }}>
                        {s.xp_awarded > 0 ? `+${s.xp_awarded}` : '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--c-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.feedback || '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--c-text-faint)' }}>
                        {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
