import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '../components/Editor'
import { submitCode, getSubmissionStatus, unlockHint } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

type StageItem = { id: number; order: number; title: string; prompt?: string }
type CaseItem  = { id: number; title: string; summary?: string; stages?: StageItem[] }

type GradingResult = {
  status: string
  result?: {
    score: number
    passed: number
    total: number
    details?: { test_id: number; passed: boolean; stdout?: string; expected?: string }[]
  }
}

type HintItem = { id: number; order: number; cost_points?: number; text?: string }

function StagePrompt({ prompt }: { prompt?: string }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) }, [])
  if (!prompt) return null
  return (
    <div className="official-memo" style={{
      marginBottom: '1.5rem',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(8px)',
      transition: 'all 400ms ease',
    }}>
      {prompt}
    </div>
  )
}

function VerdictPanel({ result }: { result: GradingResult }) {
  if (!result.result) return null
  const { score, passed, total, details } = result.result
  const allPassed = score >= 1.0
  const pct = Math.round(score * 100)

  return (
    <div style={{ marginTop: '1.5rem', animation: 'slideInUp 350ms ease forwards' }}>
      {/* Banner */}
      <div className={`verdict-banner ${allPassed ? 'verdict-success' : score > 0 ? 'verdict-info' : 'verdict-error'}`}>
        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
          {allPassed ? '✅' : score > 0 ? '⚡' : '❌'}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
            {allPassed ? 'CASE CRACKED — ALL TESTS PASSED' : score > 0 ? 'PARTIAL EVIDENCE — KEEP INVESTIGATING' : 'NO MATCH — REVIEW YOUR LOGIC'}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: '0.875rem',
            letterSpacing: 'normal',
            color: 'inherit',
            opacity: 0.85,
          }}>
            {passed}/{total} tests passed
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 700,
          opacity: 0.9,
          flexShrink: 0,
        }}>
          {pct}%
        </div>
      </div>

      {/* Score bar */}
      <div style={{ marginTop: '0.75rem' }}>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{
            width: `${pct}%`,
            background: allPassed
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : score > 0
              ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
              : 'linear-gradient(90deg, #f43f5e, #fb7185)',
          }} />
        </div>
      </div>

      {/* Test details */}
      {details && details.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--c-text-muted)',
            marginBottom: '0.75rem',
          }}>
            Test Results
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {details.map((d, i) => (
              <div key={d.test_id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.6rem 0.75rem',
                background: d.passed ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
                border: `1px solid ${d.passed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}`,
                borderRadius: 'var(--r-sm)',
                animation: `slideInRight ${300 + i * 60}ms ease forwards`,
                opacity: 0,
              }}>
                <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{d.passed ? '✓' : '✗'}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: d.passed ? 'var(--c-success)' : 'var(--c-error)',
                  fontWeight: 600,
                }}>
                  Test #{i + 1}
                </span>
                {!d.passed && d.expected && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--c-text-faint)',
                    marginLeft: 'auto',
                  }}>
                    expected: {d.expected.slice(0, 30)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChallengeView() {
  const { caseId, stageId: stageIdParam } = useParams()
  const { refreshUser } = useAuth()
  const { showToast } = useToast()

  const [caseData, setCaseData] = useState<CaseItem | null>(null)
  const [allCases, setAllCases] = useState<CaseItem[]>([])
  const [code, setCode] = useState('# Write your Python solution here\n\n')
  const [result, setResult] = useState<GradingResult | null>(null)
  const [hints, setHints] = useState<HintItem[]>([])
  const [revealedHints, setRevealedHints] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pollingTaskId, setPollingTaskId] = useState<string | null>(null)
  const [pollingSeconds, setPollingSeconds] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const selectedStageId = Number(stageIdParam) || caseData?.stages?.[0]?.id
  const selectedStage = caseData?.stages?.find(s => s.id === selectedStageId)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/challenges/${caseId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setCaseData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [caseId])

  useEffect(() => {
    fetch('/api/challenges/')
      .then(r => r.ok ? r.json() : [])
      .then(setAllCases)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedStageId) return
    fetch(`/api/hints/stage/${selectedStageId}`)
      .then(r => r.json()).then(setHints).catch(() => {})
    // Reset state when switching stages
    setResult(null)
    setCode('# Write your Python solution here\n\n')
    setRevealedHints({})
  }, [selectedStageId])

  // Polling for grading result
  const startPolling = useCallback((taskId: string) => {
    setPollingTaskId(taskId)
    setPollingSeconds(0)
    let elapsed = 0

    const poll = async () => {
      try {
        const data = await getSubmissionStatus(taskId)
        if (data.status === 'SUCCESS' || data.status === 'FAILURE') {
          setResult(data)
          setSubmitting(false)
          setPollingTaskId(null)
          if (data.result?.score >= 1.0) {
            showToast('🎉 Case cracked! All tests passed.', 'success')
            await refreshUser()
          } else if (data.result) {
            showToast(`${data.result.passed}/${data.result.total} tests passed. Keep going!`, 'info')
          }
          return
        }
      } catch { /* keep polling */ }

      elapsed += 2
      setPollingSeconds(elapsed)
      if (elapsed < 60) {
        pollRef.current = setTimeout(poll, 2000)
      } else {
        setSubmitting(false)
        setPollingTaskId(null)
        showToast('Grading timed out. Try again.', 'error')
      }
    }

    pollRef.current = setTimeout(poll, 1500)
  }, [refreshUser, showToast])

  useEffect(() => {
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  }, [])

  async function handleSubmit() {
    if (!selectedStageId) return
    setResult(null)
    setSubmitting(true)
    try {
      const body = await submitCode(selectedStageId, 'python', code, true)
      if (body.task_id) {
        startPolling(body.task_id)
      } else {
        // Immediate result (fallback)
        setResult(body)
        setSubmitting(false)
      }
    } catch {
      setSubmitting(false)
      showToast('Submission failed. Is the backend running?', 'error')
    }
  }

  async function handleUnlockHint(hintId: number) {
    try {
      const body = await unlockHint(hintId)
      setRevealedHints(prev => ({ ...prev, [hintId]: body.text }))
      showToast('Evidence uncovered!', 'success')
    } catch {
      showToast('Failed to unlock hint', 'error')
    }
  }

  const currentCaseIndex = allCases.findIndex(c => String(c.id) === String(caseId))
  const nextCase = currentCaseIndex >= 0 && currentCaseIndex < allCases.length - 1
    ? allCases[currentCaseIndex + 1] : null

  if (loading) return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div className="skeleton" style={{ height: 16, width: 200, marginBottom: '1rem' }} />
      <div className="skeleton" style={{ height: 36, width: 350, marginBottom: '2rem' }} />
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="skeleton" style={{ height: 300 }} />
        </div>
        <div style={{ width: 280 }}>
          <div className="skeleton" style={{ height: 200 }} />
        </div>
      </div>
    </div>
  )

  if (!caseData) return (
    <div className="verdict-banner verdict-error">
      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700 }}>CASE NOT FOUND</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 400, marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>
          The requested case file does not exist.{' '}
          <Link to="/" style={{ color: 'inherit', textDecoration: 'underline' }}>Return to files</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{
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
          ← Case Files
        </Link>
      </div>

      {/* Case header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          color: 'var(--c-text-faint)',
          marginBottom: '0.4rem',
        }}>
          CASE #{caseId}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--c-text)',
          letterSpacing: '-0.02em',
          marginBottom: '0.75rem',
        }}>
          {caseData.title}
        </h2>

        {/* Stage tabs */}
        {caseData.stages && caseData.stages.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {caseData.stages.map(s => {
              const active = s.id === selectedStageId
              return (
                <Link
                  key={s.id}
                  to={`/case/${caseId}/stage/${s.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.8rem',
                    borderRadius: 'var(--r-full)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    transition: 'all 200ms ease',
                    background: active ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(251,191,36,0.3)' : 'var(--c-border)'}`,
                    color: active ? 'var(--c-amber)' : 'var(--c-text-muted)',
                  }}
                >
                  <span>{active ? '▶' : '○'}</span>
                  Stage {s.order}: {s.title}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Main two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT: Editor + result */}
        <div>
          {/* Stage prompt */}
          {selectedStage?.prompt && <StagePrompt prompt={selectedStage.prompt} />}

          {/* Case summary as fallback */}
          {!selectedStage?.prompt && caseData.summary && (
            <div className="official-memo" style={{ marginBottom: '1.5rem' }}>
              {caseData.summary}
            </div>
          )}

          {/* Editor */}
          <div style={{
            background: 'var(--c-shadow)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            transition: 'border-color 200ms ease',
          }}>
            {/* Editor chrome */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              background: 'rgba(0,0,0,0.3)',
              borderBottom: '1px solid var(--c-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: 'var(--c-text-faint)',
                letterSpacing: '0.1em',
              }}>
                solution.py
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.7rem',
                color: 'var(--c-text-faint)',
                background: 'rgba(255,255,255,0.04)',
                padding: '0.2rem 0.5rem',
                borderRadius: 4,
              }}>
                Python 3
              </div>
            </div>
            <Editor value={code} language="python" onChange={setCode} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary"
              id="submit-btn"
            >
              {submitting ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: '2px' }} />
                  {pollingTaskId
                    ? `Grading${pollingSeconds > 0 ? ` (${pollingSeconds}s)` : '…'}`
                    : 'Submitting…'}
                </>
              ) : (
                <>⚡ Submit Solution</>
              )}
            </button>

            {nextCase && (
              <Link to={`/case/${nextCase.id}`} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
                Next Case →
              </Link>
            )}
          </div>

          {/* Result panel */}
          {result && <VerdictPanel result={result} />}
        </div>

        {/* RIGHT: Hints panel */}
        <div>
          <div style={{
            background: 'var(--c-shadow)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--c-border)',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span style={{ fontSize: '0.9rem' }}>🗂</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--c-text-muted)',
              }}>
                Evidence Files
              </span>
            </div>

            <div style={{ padding: '1rem' }}>
              {hints.length === 0 ? (
                <p style={{ color: 'var(--c-text-faint)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                  No hints available
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {hints.map((h, i) => {
                    const revealed = revealedHints[h.id]
                    return (
                      <div key={h.id} style={{
                        padding: '0.75rem',
                        background: revealed ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${revealed ? 'rgba(251,191,36,0.2)' : 'var(--c-border)'}`,
                        borderRadius: 'var(--r-sm)',
                        transition: 'all 300ms ease',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: 'var(--c-amber)',
                          letterSpacing: '0.1em',
                          marginBottom: '0.4rem',
                          textTransform: 'uppercase',
                        }}>
                          Evidence #{i + 1}
                        </div>
                        {revealed ? (
                          <p style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.85rem',
                            color: 'var(--c-text)',
                            lineHeight: 1.5,
                            animation: 'fadeIn 400ms ease',
                          }}>
                            {revealed}
                          </p>
                        ) : (
                          <>
                            <div style={{ marginBottom: '0.6rem' }}>
                              <span className="redacted-text" style={{ fontSize: '0.8rem' }}>
                                Classified — unlock to reveal
                              </span>
                            </div>
                            <button
                              onClick={() => handleUnlockHint(h.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              🔓 Unlock {h.cost_points ? `(${h.cost_points} XP)` : ''}
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 300px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
