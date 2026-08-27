import React, { useEffect, useState } from 'react'
import { getLeaderboard } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

type Leader = { rank: number; display_name: string; xp: number; rank_title: string; streak: number }

export default function Leaderboard() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState<Leader[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard().then(setLeaders).finally(() => setLoading(false))
  }, [])

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--c-amber)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>🏆</span> Hall of Fame
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--c-text)', letterSpacing: '-0.02em' }}>
          Top Detectives
        </h2>
        <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', marginTop: '0.3rem' }}>
          The ten finest minds in the Agency, ranked by total XP earned.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--r-md)' }} />)}
        </div>
      ) : leaders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--c-shadow)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏆</div>
          <div style={{ fontFamily: 'var(--font-display)', color: 'var(--c-text-muted)' }}>No one on the leaderboard yet. Solve cases to be first!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaders.map((leader, i) => {
            const isMe = leader.display_name === user?.display_name
            const medal = MEDALS[i] ?? null
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                background: isMe ? 'rgba(251,191,36,0.04)' : 'var(--c-shadow)',
                border: '1px solid ' + (isMe ? 'rgba(251,191,36,0.25)' : 'var(--c-border)'),
                borderLeft: '3px solid ' + (i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--c-border)'),
                borderRadius: 'var(--r-md)',
                opacity: 0, animation: 'slideInUp 350ms ease ' + (i * 60) + 'ms forwards',
              }}>
                {/* Rank */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: i < 3 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                  border: '1.5px solid ' + (i < 3 ? 'rgba(251,191,36,0.3)' : 'var(--c-border)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
                  color: i < 3 ? 'var(--c-amber)' : 'var(--c-text-muted)',
                }}>
                  {medal ?? leader.rank}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isMe ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.06)',
                  border: '1.5px solid ' + (isMe ? 'rgba(251,191,36,0.4)' : 'var(--c-border)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem',
                  color: isMe ? 'var(--c-amber)' : 'var(--c-text-muted)',
                }}>
                  {leader.display_name[0]?.toUpperCase() ?? '?'}
                </div>

                {/* Name + rank */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem',
                    color: 'var(--c-text)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}>
                    {leader.display_name}
                    {isMe && (
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, color: 'var(--c-amber)', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 4, padding: '0.1rem 0.35rem' }}>YOU</span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--c-text-faint)', letterSpacing: '0.04em' }}>
                    {leader.rank_title}
                    {leader.streak > 1 && (
                      <span style={{ marginLeft: '0.5rem', color: '#f97316' }}>🔥 {leader.streak}-day streak</span>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
                  color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : 'var(--c-amber)',
                }}>
                  ⚡ {leader.xp.toLocaleString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
