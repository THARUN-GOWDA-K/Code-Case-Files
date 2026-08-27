import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '../components/Editor'
import NpcAdvisor, { NpcCharacter, NpcHint } from '../components/NpcAdvisor'
import CaseClosedOverlay from '../components/CaseClosedOverlay'
import { getSqlStage, submitSqlQuery, listSqlCases, getSqlCase } from '../lib/sqlCases'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

type StageDetail = {
  id: number
  order: number
  title: string
  prompt?: string
  schema_description?: string
  xp_reward: number
  hints: string[]
  npc_hints?: NpcHint[]
}
type SqlCaseWithStages = {
  id: number
  slug: string
  title: string
  epilogue_text?: string
  npc_characters?: NpcCharacter[]
  stages: Array<{ id: number; order: number; title: string }>
}
type SubmitResult = {
  correct: boolean
  result_rows: Record<string, unknown>[]
  xp_awarded: number
  feedback: string
}

export default function SqlStageView() {
  const { id } = useParams<{ id: string }>()
  const stageId = Number(id)
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()

  const [stage, setStage] = useState<StageDetail | null>(null)
  const [allCases, setAllCases] = useState<SqlCaseWithStages[]>([])
  const [currentCaseFull, setCurrentCaseFull] = useState<SqlCaseWithStages | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('SELECT *\nFROM suspects\nWHERE attended = 1\nORDER BY name ASC;\n')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [showCaseClosed, setShowCaseClosed] = useState(false)

  useEffect(() => {
    if (!stageId) return
    getSqlStage(stageId)
      .then(setStage).catch(() => setError('Stage not found'))
      .finally(() => setLoading(false))
  }, [stageId])

  useEffect(() => {
    listSqlCases().then(setAllCases).catch(() => {})
  }, [])

  // Find current case
  const currentCase = allCases.find(c => c.stages.some(s => s.id === stageId))
  const sortedStages = currentCase ? [...currentCase.stages].sort((a, b) => a.order - b.order) : []
  const currentIdx = sortedStages.findIndex(s => s.id === stageId)
  const isLastStage = currentIdx === sortedStages.length - 1
  const nextStage = !isLastStage ? sortedStages[currentIdx + 1] : null
  const caseIdx = allCases.findIndex(c => c.id === currentCase?.id)
  const nextCase = caseIdx >= 0 && caseIdx < allCases.length - 1 ? allCases[caseIdx + 1] : null

  // Fetch full case to get NPC characters and epilogue
  useEffect(() => {
    if (currentCase?.slug) {
      getSqlCase(currentCase.slug).then(setCurrentCaseFull).catch(() => {})
    }
  }, [currentCase?.slug])

  async function handleSubmit() {
    if (!stageId || !query.trim()) return
    setSubmitting(true)
    setResult(null)
    setSubmitError(null)
    try {
      const res = await submitSqlQuery(stageId, query)
      if (res.detail) {
        setSubmitError(res.detail)
        showToast(res.detail, 'error')
      } else {
        setResult(res as SubmitResult)
        if (res.correct) {
          showToast(res.xp_awarded > 0 ? 'Stage solved! +' + res.xp_awarded + ' XP earned.' : 'Correct! Already solved.', 'success')
          if (res.xp_awarded > 0) await refreshUser()
          if (isLastStage) {
            setShowCaseClosed(true)
          }
        } else {
          showToast('Not quite — check your query logic.', 'info')
        }
      }
    } catch {
      setSubmitError('Network error — is the backend running?')
      showToast('Network error', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div className="skeleton" style={{ height: 14, width: 180, marginBottom: '1.5rem' }} />
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 400px', minWidth: 300 }}>
          <div className="skeleton" style={{ height: 36, marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: '2rem' }} />
          <div className="skeleton" style={{ height: 120, marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: 80 }} />
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div className="skeleton" style={{ height: 280 }} />
        </div>
      </div>
    </div>
  )

  if (error || !stage) return (
    <div className="verdict-banner verdict-error">
      <span style={{ fontSize: '1.25rem' }}>⚠️</span>
      <div>
        <div style={{ fontWeight: 700 }}>STAGE NOT FOUND</div>
        <div style={{ fontSize: '0.875rem', fontWeight: 400, marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>
          {error ?? 'Unknown error'}.{' '}
          <Link to="/sql-cases" style={{ color: 'inherit', textDecoration: 'underline' }}>Return to cases</Link>
        </div>
      </div>
    </div>
  )

  const resultColumns = result && result.result_rows.length > 0 ? Object.keys(result.result_rows[0]) : []
  const npcChars = currentCaseFull?.npc_characters || [
    { id: 'blake', name: 'Commissioner Blake', avatar: '👮', title: 'Metropolitan Police Commissioner' },
    { id: 'maya', name: 'Dr. Maya Chen', avatar: '👩‍🔬', title: 'Tech Forensics Expert' },
    { id: 'riya', name: 'Riya Sharma', avatar: '👩‍💼', title: 'Junior Detective' },
  ]

  return (
    <div style={{ animation: 'fadeIn 350ms ease' }}>
      {/* Case Closed Modal Overlay */}
      {showCaseClosed && (
        <CaseClosedOverlay
          caseTitle={currentCase?.title || 'Case Investigation'}
          epilogueText={currentCaseFull?.epilogue_text}
          xpEarned={result?.xp_awarded || 0}
          nextCaseSlug={nextCase?.slug}
          nextCaseTitle={nextCase?.title}
          commissionerMessage={nextCase ? 'Outstanding deduction on this case, Detective. But our work is never done — report to the briefing room for the next file.' : 'Spectacular work, Detective. You have solved all active cases in the docket.'}
          onClose={() => setShowCaseClosed(false)}
        />
      )}

      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/sql-cases" style={{
          fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-text-muted)', textDecoration: 'none',
        }}>
          ← SQL Cases
        </Link>
        {currentCase && (
          <>
            <span style={{ color: 'var(--c-text-faint)' }}>/</span>
            <Link to={'/sql-cases/' + currentCase.slug} style={{
              fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--c-text-muted)', textDecoration: 'none',
            }}>
              {currentCase.title.replace(/^Case #\d+ — /, '')}
            </Link>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* LEFT: Prompt + Advisors + schema + hints */}
        <div style={{ flex: '0 0 380px', minWidth: 300 }}>
          {/* Stage heading */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              color: 'var(--c-text-faint)', letterSpacing: '0.12em', marginBottom: '0.4rem',
            }}>
              STAGE {stage.order.toString().padStart(2, '0')} //
              <span style={{ color: 'var(--c-success)', marginLeft: '0.4rem' }}>+{stage.xp_reward} XP</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700,
              color: 'var(--c-text)', letterSpacing: '-0.02em',
            }}>
              {stage.title}
            </h2>
          </div>

          {/* Stage nav pills */}
          {sortedStages.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {sortedStages.map(s => {
                const active = s.id === stageId
                return (
                  <Link key={s.id} to={'/sql-stages/' + s.id} style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: 'var(--r-full)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    background: active ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid ' + (active ? 'rgba(251,191,36,0.3)' : 'var(--c-border)'),
                    color: active ? 'var(--c-amber)' : 'var(--c-text-faint)',
                    transition: 'all 200ms ease',
                  }}>
                    Stage {s.order}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Prompt */}
          {stage.prompt && (
            <div className="official-memo" style={{ marginBottom: '1.5rem' }}>
              {stage.prompt}
            </div>
          )}

          {/* NPC Advisors */}
          {stage.npc_hints && stage.npc_hints.length > 0 && (
            <NpcAdvisor
              characters={npcChars}
              npcHints={stage.npc_hints}
              userXp={user?.xp ?? 0}
            />
          )}

          {/* Schema */}
          {stage.schema_description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-text-muted)',
                marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <span>🗂</span> Database Schema
              </div>
              <pre style={{
                background: '#0d1117',
                color: '#94a3b8',
                padding: '1rem',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-md)',
                fontSize: '0.8rem',
                lineHeight: 1.7,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-mono)',
                margin: 0,
              }}>
                {stage.schema_description}
              </pre>
            </div>
          )}

          {/* Regular Hints */}
          {stage.hints && stage.hints.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => setShowHints(v => !v)}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>🔎 Clue Notes ({stage.hints.length})</span>
                <span style={{ transition: 'transform 200ms ease', transform: showHints ? 'rotate(180deg)' : 'none' }}>▼</span>
              </button>
              {showHints && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stage.hints.map((h, i) => (
                    <div key={i} style={{
                      padding: '0.75rem',
                      background: 'rgba(251,191,36,0.04)',
                      border: '1px solid rgba(251,191,36,0.12)',
                      borderRadius: 'var(--r-sm)',
                      animation: 'fadeIn 300ms ease',
                    }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--c-amber)', marginBottom: '0.3rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Clue #{i + 1}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', lineHeight: 1.5 }}>
                        {h}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {nextStage && (
              <Link to={'/sql-stages/' + nextStage.id} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                Next Stage →
              </Link>
            )}
            {isLastStage && nextCase && (
              <Link to={'/sql-cases/' + nextCase.slug} className="btn btn-success" style={{ justifyContent: 'center' }}>
                Next Case →
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT: Query terminal + results */}
        <div style={{ flex: 1, minWidth: 320 }}>
          {/* Editor */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-text-muted)',
              marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span>💻</span> Query Terminal
            </div>

            <div style={{
              background: 'var(--c-shadow)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid var(--c-border)',
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--c-text-faint)' }}>
                  evidence.sql
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.7rem', color: 'var(--c-info)',
                  background: 'rgba(56,189,248,0.08)', padding: '0.2rem 0.5rem', borderRadius: 4,
                }}>
                  SQLite
                </div>
              </div>
              <Editor value={query} language="sql" onChange={setQuery} />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
            id="execute-query-btn"
          >
            {submitting ? (
              <><div className="spinner" style={{ width: 14, height: 14, borderWidth: '2px' }} /> Executing…</>
            ) : (
              <>▶ Execute Query</>
            )}
          </button>

          {/* Error */}
          {submitError && (
            <div className="notice notice-error" style={{ marginTop: '1rem' }}>
              <span>⚠</span><span>{submitError}</span>
            </div>
          )}

          {/* Result verdict */}
          {result && (
            <div className={'verdict-banner ' + (result.correct ? 'verdict-success' : 'verdict-error')} style={{ marginTop: '1rem' }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>
                {result.correct ? '✅' : '❌'}
              </span>
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                  {result.correct ? 'STAGE COMPLETED' : 'INCONCLUSIVE'}
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontWeight: 400,
                  fontSize: '0.875rem', letterSpacing: 'normal', opacity: 0.9,
                }}>
                  {result.feedback}
                  {result.correct && result.xp_awarded > 0 && (
                    <span style={{
                      marginLeft: '0.6rem', color: 'var(--c-success)',
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                    }}>
                      +{result.xp_awarded} XP ⚡
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results table */}
          {result && result.result_rows.length > 0 && (
            <div style={{
              marginTop: '1.5rem',
              background: 'var(--c-shadow)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
              animation: 'slideInUp 350ms ease forwards',
            }}>
              <div style={{
                padding: '0.6rem 1rem',
                borderBottom: '1px solid var(--c-border)',
                background: 'rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ fontSize: '0.8rem' }}>📊</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--c-text-muted)',
                }}>
                  DATA OUTPUT — {result.result_rows.length} RECORD{result.result_rows.length !== 1 ? 'S' : ''}
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="results-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      {resultColumns.map(col => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.result_rows.map((row, i) => (
                      <tr key={i}>
                        {resultColumns.map(col => (
                          <td key={col}>{String(row[col] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && result.result_rows.length === 0 && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--c-text-faint)',
            }}>
              &gt; Query executed. 0 records returned.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="flex: 0 0 380px"] { flex: 1 !important; }
        }
      `}</style>
    </div>
  )
}
