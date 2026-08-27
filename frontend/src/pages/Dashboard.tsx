import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSqlCases } from '../lib/sqlCases'
import { getCases } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

type SqlCase = { id: number; slug: string; title: string; difficulty?: string; stages?: { id: number }[] }
type PyCase  = { id: number; slug: string; title: string; summary?: string; stages?: { id: number }[] }

const RANK_TITLES = [
  { threshold: 2001, title: 'Master Detective',    icon: '🏆' },
  { threshold: 1001, title: 'Chief Inspector',      icon: '🌟' },
  { threshold: 601,  title: 'Senior Detective',     icon: '🔷' },
  { threshold: 301,  title: 'Senior Investigator',  icon: '🔵' },
  { threshold: 101,  title: 'Investigator',         icon: '🟣' },
  { threshold: 0,    title: 'Rookie Detective',     icon: '🟡' },
]

function getRank(xp: number) {
  return RANK_TITLES.find(r => xp >= r.threshold) ?? RANK_TITLES[RANK_TITLES.length - 1]
}

function XpProgress({ xp }: { xp: number }) {
  const thresholds = [0, 101, 301, 601, 1001, 2001, 3000]
  const currentIdx = thresholds.findLastIndex(t => xp >= t)
  const current = thresholds[currentIdx] ?? 0
  const next = thresholds[currentIdx + 1] ?? current
  const pct = next > current ? Math.min(100, ((xp - current) / (next - current)) * 100) : 100
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)' }}>{xp} XP</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)' }}>{next} XP</span>
      </div>
      <div className="progress-bar"><div className="progress-bar-fill" style={{ width: pct + '%' }} /></div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [sqlCases, setSqlCases] = useState<SqlCase[]>([])
  const [pyCases,  setPyCases]  = useState<PyCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listSqlCases(), getCases()])
      .then(([s, p]) => { setSqlCases(s); setPyCases(p) })
      .finally(() => setLoading(false))
  }, [])

  const xp = user?.xp ?? 0
  const rank = getRank(xp)

  const chapters = [
    ...(sqlCases.map((c, i) => ({ ...c, path: 'SQL', chapterNum: i + 1, link: '/sql-cases/' + c.slug }))),
    ...(pyCases.map((c, i)  => ({ ...c, path: 'Python', chapterNum: sqlCases.length + i + 1, link: '/case/' + c.id }))),
  ].slice(0, 7)

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      {/* Detective profile hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.04), rgba(56,189,248,0.04))',
        border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-lg)',
        padding: '1.75rem 2rem',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          fontSize: '8rem', opacity: 0.04, userSelect: 'none',
        }}>🕵️</div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e3a5f, #0f2845)',
            border: '2px solid rgba(251,191,36,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 700, color: 'var(--c-amber)',
            fontFamily: 'var(--font-display)', flexShrink: 0,
            boxShadow: '0 0 0 4px rgba(251,191,36,0.08)',
          }}>
            {user?.display_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              color: 'var(--c-text-faint)', letterSpacing: '0.1em', marginBottom: '0.3rem',
            }}>
              {rank.icon} {rank.title}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.5rem',
              fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-0.02em', marginBottom: '0.25rem',
            }}>
              Detective {user?.display_name}
            </h2>
            <XpProgress xp={xp} />
          </div>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total XP', value: xp.toLocaleString(), icon: '⚡', color: 'var(--c-amber)' },
              { label: 'Cases', value: chapters.length, icon: '📁', color: 'var(--c-success)' },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
              }}>
                <div style={{ fontSize: '1.1rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: s.color }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', color: 'var(--c-text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'SQL Cases', desc: 'Query evidence databases to solve crimes', link: '/sql-cases', icon: '🗄️', color: 'var(--c-info)' },
          { label: 'Code Cases', desc: 'Write algorithms to decode criminal evidence', link: '/cases', icon: '🐍', color: '#3b82f6' },
          { label: 'Detective Shop', desc: 'Spend XP on tools and boosts', link: '/shop', icon: '🏪', color: 'var(--c-amber)' },
          { label: 'Leaderboard', desc: 'Top detectives ranked by XP', link: '/leaderboard', icon: '🏆', color: 'var(--c-success)' },
        ].map(nav => (
          <Link key={nav.label} to={nav.link} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1.25rem',
            background: 'var(--c-shadow)', border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)', textDecoration: 'none',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--r-md)',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
            }}>{nav.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: nav.color, marginBottom: '0.15rem' }}>{nav.label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--c-text-muted)' }}>{nav.desc}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--c-amber)', fontSize: '1rem' }}>→</span>
          </Link>
        ))}
      </div>

      {/* Operation Dark Ledger — chapter map */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--c-amber)',
          marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span>🗺️</span> Operation Dark Ledger — Case Map
        </div>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          A connected noir investigation. Complete each chapter to unlock the next.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--r-md)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {chapters.map((ch, i) => (
            <Link key={ch.id} to={ch.link} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.1rem 1.25rem',
              background: 'var(--c-shadow)', border: '1px solid var(--c-border)',
              borderLeft: '3px solid ' + (ch.path === 'SQL' ? 'var(--c-info)' : '#3b82f6'),
              borderRadius: 'var(--r-md)', textDecoration: 'none',
              transition: 'all 200ms ease',
              animationDelay: (i * 60) + 'ms', opacity: 0,
              animation: 'slideInUp 350ms ease forwards',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: ch.path === 'SQL' ? 'rgba(56,189,248,0.1)' : 'rgba(59,130,246,0.1)',
                border: '1.5px solid ' + (ch.path === 'SQL' ? 'rgba(56,189,248,0.3)' : 'rgba(59,130,246,0.3)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem',
                color: ch.path === 'SQL' ? 'var(--c-info)' : '#3b82f6', flexShrink: 0,
              }}>
                {ch.chapterNum}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem', color: 'var(--c-text)', marginBottom: '0.2rem' }}>
                  {ch.title.replace(/^Case #\d+ — /, '')}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700,
                    padding: '0.1rem 0.4rem', borderRadius: 4,
                    background: ch.path === 'SQL' ? 'rgba(56,189,248,0.1)' : 'rgba(59,130,246,0.1)',
                    color: ch.path === 'SQL' ? 'var(--c-info)' : '#3b82f6',
                  }}>{ch.path}</span>
                </div>
              </div>
              <span style={{ color: 'var(--c-amber)', fontSize: '1.1rem' }}>→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
