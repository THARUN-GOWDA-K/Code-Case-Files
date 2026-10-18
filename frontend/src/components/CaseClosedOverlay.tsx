import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  caseTitle: string
  epilogueText?: string
  xpEarned: number
  nextCaseSlug?: string
  nextCaseTitle?: string
  commissionerMessage?: string
  onClose: () => void
}

export default function CaseClosedOverlay({ caseTitle, epilogueText, xpEarned, nextCaseSlug, nextCaseTitle, commissionerMessage, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5,8,16,0.96)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 400ms ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        maxWidth: 600,
        width: '100%',
        textAlign: 'center',
        animation: 'scaleIn 500ms cubic-bezier(0.175,0.885,0.32,1.275)',
      }}>
        {/* CASE CLOSED stamp */}
        <div style={{
          display: 'inline-block',
          border: '4px solid #10b981',
          borderRadius: 8,
          padding: '0.5rem 2rem',
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          fontWeight: 900,
          color: '#10b981',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          transform: 'rotate(-3deg)',
          boxShadow: '0 0 40px rgba(16,185,129,0.25)',
          marginBottom: '2rem',
          animation: 'xpPop 600ms ease 200ms both',
        }}>
          Case Closed
        </div>

        {/* Case title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--c-text)',
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
        }}>
          {caseTitle}
        </h2>

        {/* XP earned */}
        {xpEarned > 0 && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.5rem',
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 'var(--r-full)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--c-amber)',
            marginBottom: '2rem',
            animation: 'xpPop 600ms ease 400ms both',
          }}>
            ⚡ +{xpEarned} XP Earned
          </div>
        )}

        {/* Epilogue */}
        {epilogueText && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--c-border)',
            borderLeft: '3px solid var(--c-amber)',
            borderRadius: 'var(--r-md)',
            padding: '1.25rem 1.5rem',
            textAlign: 'left',
            marginBottom: '1.5rem',
            animation: 'slideInUp 500ms ease 300ms both',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--c-text-faint)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>
              Case Epilogue
            </div>
            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              {epilogueText}
            </p>
          </div>
        )}

        {/* Commissioner dispatch */}
        {commissionerMessage && (
          <div style={{
            background: 'rgba(239,68,68,0.04)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 'var(--r-md)',
            padding: '1rem 1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
            animation: 'slideInUp 500ms ease 500ms both',
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#ef4444',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              👮 Commissioner Blake — New Dispatch
            </div>
            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "{commissionerMessage}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {nextCaseSlug && (
            <Link to={"/sql-cases/" + nextCaseSlug} className="btn btn-success" onClick={onClose}>
              Next Case: {nextCaseTitle} →
            </Link>
          )}
          <button onClick={onClose} className="btn btn-ghost">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
