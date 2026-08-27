import React, { useState } from 'react'

export type NpcHint = {
  character: string
  dialogue: string
  xp_cost: number
}

export type NpcCharacter = {
  id: string
  name: string
  avatar: string
  title: string
}

type Props = {
  characters: NpcCharacter[]
  npcHints: NpcHint[]
  userXp?: number
  onSpendXp?: (amount: number) => void
}

const NPC_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  blake:    { bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.2)',   accent: '#ef4444' },
  maya:     { bg: 'rgba(56,189,248,0.06)',  border: 'rgba(56,189,248,0.2)',  accent: '#38bdf8' },
  riya:     { bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.2)', accent: '#a78bfa' },
  informant:{ bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.2)',  accent: '#fbbf24' },
  hammond:  { bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.2)',   accent: '#22c55e' },
}
const DEFAULT_COLOR = { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', accent: '#94a3b8' }

export default function NpcAdvisor({ characters, npcHints, userXp = 0, onSpendXp }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())

  if (!characters || characters.length === 0) return null

  const toggle = (id: string) => setOpenId(prev => prev === id ? null : id)

  const handleUnlock = (charId: string, cost: number) => {
    if (cost > 0 && userXp < cost) return
    if (cost > 0 && onSpendXp) onSpendXp(cost)
    setUnlockedIds(prev => new Set([...prev, charId]))
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--c-amber)',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}>
        <span>🤝</span> Advisors
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {characters.map(char => {
          const hint = npcHints.find(h => h.character === char.id)
          const colors = NPC_COLORS[char.id] ?? DEFAULT_COLOR
          const isOpen = openId === char.id
          const isUnlocked = unlockedIds.has(char.id) || (hint?.xp_cost ?? 0) === 0
          const needsXp = (hint?.xp_cost ?? 0) > 0 && !unlockedIds.has(char.id)

          return (
            <div key={char.id}>
              {/* Character card */}
              <button
                onClick={() => toggle(char.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.75rem',
                  background: isOpen ? colors.bg : 'rgba(255,255,255,0.03)',
                  border: '1px solid ' + (isOpen ? colors.border : 'var(--c-border)'),
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!isOpen) {
                    e.currentTarget.style.borderColor = colors.border
                    e.currentTarget.style.background = colors.bg
                  }
                }}
                onMouseLeave={e => {
                  if (!isOpen) {
                    e.currentTarget.style.borderColor = 'var(--c-border)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: colors.bg,
                  border: '1.5px solid ' + colors.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}>
                  {char.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: isOpen ? colors.accent : 'var(--c-text)',
                  }}>
                    {char.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.7rem',
                    color: 'var(--c-text-faint)',
                    letterSpacing: '0.04em',
                  }}>
                    {char.title}
                  </div>
                </div>
                {hint?.xp_cost && hint.xp_cost > 0 && !unlockedIds.has(char.id) && (
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: 'var(--c-amber)',
                    background: 'rgba(251,191,36,0.1)',
                    border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: 'var(--r-sm)',
                    padding: '0.15rem 0.4rem',
                  }}>
                    {hint.xp_cost} XP
                  </span>
                )}
                <span style={{
                  color: colors.accent,
                  fontSize: '0.8rem',
                  transition: 'transform 200ms ease',
                  transform: isOpen ? 'rotate(90deg)' : 'none',
                }}>▶</span>
              </button>

              {/* Dialogue bubble */}
              {isOpen && hint && (
                <div style={{
                  margin: '0.25rem 0 0 0',
                  padding: '0.9rem 1rem',
                  background: colors.bg,
                  border: '1px solid ' + colors.border,
                  borderTop: 'none',
                  borderRadius: '0 0 var(--r-md) var(--r-md)',
                  animation: 'fadeIn 200ms ease',
                }}>
                  {isUnlocked ? (
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        color: colors.accent,
                        marginBottom: '0.4rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}>
                        {char.name} says:
                      </div>
                      <p style={{
                        color: 'var(--c-text-muted)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                        margin: 0,
                      }}>
                        "{hint.dialogue}"
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{
                        color: 'var(--c-text-muted)',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-display)',
                      }}>
                        🔒 Costs <strong style={{ color: 'var(--c-amber)' }}>{hint.xp_cost} XP</strong> to consult
                      </div>
                      <button
                        onClick={() => handleUnlock(char.id, hint.xp_cost)}
                        disabled={userXp < hint.xp_cost}
                        className="btn btn-primary btn-sm"
                        style={{ flexShrink: 0 }}
                      >
                        Consult ({hint.xp_cost} XP)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
