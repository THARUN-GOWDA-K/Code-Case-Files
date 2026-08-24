import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '../components/Editor'
import { getSqlStage, submitSqlQuery } from '../lib/sqlCases'
import { useAuth } from '../contexts/AuthContext'

type StageDetail = {
  id: number
  order: number
  title: string
  prompt?: string
  schema_description?: string
  xp_reward: number
  hints: string[]
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
  const { refreshUser } = useAuth()

  const [stage, setStage] = useState<StageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState<string>('SELECT * FROM suspects\nWHERE attended = 1\nORDER BY name ASC;\n')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)

  useEffect(() => {
    if (!stageId) return
    getSqlStage(stageId)
      .then(setStage)
      .catch(() => setError('Stage not found'))
      .finally(() => setLoading(false))
  }, [stageId])

  async function handleSubmit() {
    if (!stageId || !query.trim()) return
    setSubmitting(true)
    setResult(null)
    setSubmitError(null)
    try {
      const res = await submitSqlQuery(stageId, query)
      if (res.detail) {
        // FastAPI error response
        setSubmitError(res.detail)
      } else {
        setResult(res as SubmitResult)
        // Refresh user data to update XP in real-time
        if (res.correct && res.xp_awarded > 0) {
          await refreshUser()
        }
      }
    } catch {
      setSubmitError('Network error — is the backend running?')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 400px', minWidth: 320, opacity: 0.5 }}>
            <div style={{
              height: '2rem',
              background: 'var(--color-evidence)',
              borderRadius: '4px',
              marginBottom: '1rem',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{
              height: '1rem',
              width: '60%',
              background: 'var(--color-evidence)',
              borderRadius: '4px',
              marginBottom: '2rem',
              animation: 'pulse 1.5s ease-in-out infinite 0.2s',
            }} />
            <div className="dossier-card" style={{ opacity: 0.5 }}>
              <div style={{
                height: '1rem',
                background: 'var(--color-evidence)',
                borderRadius: '4px',
                marginBottom: '0.5rem',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 320, opacity: 0.5 }}>
            <div style={{
              height: '200px',
              background: 'var(--color-evidence)',
              borderRadius: '4px',
              marginBottom: '1rem',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !stage) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="verdict-banner verdict-error">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>STAGE NOT FOUND</div>
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{error ?? 'Unknown error'}</div>
          </div>
        </div>
      </div>
    )
  }

  const resultColumns =
    result && result.result_rows.length > 0 ? Object.keys(result.result_rows[0]) : []

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>

      {/* ── LEFT PANEL: prompt + schema + hints ─────────────────────────── */}
      <div style={{ flex: '0 0 400px', minWidth: 320, paddingRight: '1rem' }}>
        <p style={{ marginBottom: '2rem' }}>
          <Link to={`/sql-cases`} style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '0.85rem', 
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            textDecoration: 'none',
          }}>
            ← RETURN TO SQL CASES
          </Link>
        </p>

        <h3 style={{ 
          margin: '0 0 0.5rem 0', 
          fontSize: '1.8rem', 
          color: 'var(--color-clue)', 
          lineHeight: 1.2,
          fontFamily: 'var(--font-display)',
        }}>
          {stage.title}
        </h3>
        <div style={{ 
          fontFamily: 'var(--font-mono)', 
          fontSize: '0.85rem', 
          color: 'var(--color-redacted)', 
          marginBottom: '1.5rem',
          letterSpacing: '0.5px',
        }}>
          STAGE {stage.order.toString().padStart(2, '0')} // REWARD: +{stage.xp_reward} XP
        </div>

        {/* Prompt */}
        {stage.prompt && (
          <div className="official-memo" style={{ marginBottom: '2rem' }}>
            {stage.prompt}
          </div>
        )}

        {/* Schema viewer */}
        {stage.schema_description && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: 'var(--color-redacted)', 
              fontSize: '0.9rem', 
              letterSpacing: '1px',
              fontFamily: 'var(--font-display)',
            }}>DATABASE SCHEMA</h4>
            <pre
              style={{
                background: 'rgba(0,0,0,0.4)',
                color: '#a3a3a3',
                padding: '1rem',
                border: '1px solid var(--color-redacted)',
                borderRadius: '4px',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {stage.schema_description}
            </pre>
          </div>
        )}

        {/* Hints */}
        {stage.hints.length > 0 && (
          <div>
            <h4 style={{ 
              margin: '0 0 0.75rem 0', 
              color: 'var(--color-redacted)', 
              fontSize: '0.9rem', 
              letterSpacing: '1px',
              fontFamily: 'var(--font-display)',
            }}>CLASSIFIED HINTS</h4>
            <button
              onClick={() => setShowHints((v) => !v)}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-redacted)',
                color: 'var(--color-redacted)',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {showHints ? 'HIDE EVIDENCE' : `REVEAL EVIDENCE (${stage.hints.length})`}
            </button>
            {showHints && (
              <ol style={{ marginTop: '1rem', paddingLeft: '1.2rem', color: 'var(--color-typewriter)', fontSize: '0.95rem' }}>
                {stage.hints.map((h, i) => (
                  <li key={i} style={{ marginBottom: '0.75rem' }}>
                    <span className="redacted-text">{h}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL: editor + submit + results ──────────────────────── */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <h4 style={{ 
          margin: '0 0 1rem 0', 
          color: 'var(--color-redacted)', 
          fontSize: '0.9rem', 
          letterSpacing: '1px',
          fontFamily: 'var(--font-display)',
        }}>QUERY TERMINAL</h4>

        {/* Monaco editor — reuses existing component with language="sql" */}
        <div style={{ 
          border: '1px solid var(--color-redacted)', 
          borderRadius: '4px', 
          overflow: 'hidden', 
          padding: '2px', 
          background: '#1e1e1e' 
        }}>
          <Editor value={query} language="sql" onChange={setQuery} />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: submitting ? 'var(--color-evidence)' : 'var(--color-clue)',
              color: submitting ? 'var(--color-redacted)' : '#000',
              border: submitting ? '1px solid var(--color-redacted)' : 'none',
              borderRadius: '4px',
              padding: '0.75rem 1.5rem',
              cursor: submitting ? 'default' : 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              letterSpacing: '0.5px',
              fontFamily: 'var(--font-display)',
            }}
          >
            {submitting ? 'EXECUTING...' : 'EXECUTE QUERY'}
          </button>
        </div>

        {/* Sandbox / network error */}
        {submitError && (
          <div className="verdict-banner verdict-error">
            <span style={{ fontSize: '1.25rem' }}>⚠️</span> {submitError}
          </div>
        )}

        {/* Feedback banner */}
        {result && (
          <div className={`verdict-banner ${result.correct ? 'verdict-success' : 'verdict-error'}`}>
            <span style={{ fontSize: '1.25rem' }}>{result.correct ? '✅' : '❌'}</span> 
            <div>
              <div style={{ fontWeight: 'bold' }}>
                {result.correct ? 'CASE RESOLVED' : 'INCONCLUSIVE'}
              </div>
              <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-body)', marginTop: '4px', letterSpacing: 'normal' }}>
                {result.feedback}
                {result.correct && result.xp_awarded > 0 && (
                  <span style={{ marginLeft: 10, color: 'var(--color-redacted)' }}>
                    (+{result.xp_awarded} XP awarded)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results table */}
        {result && result.result_rows.length > 0 && (
          <div style={{ 
            marginTop: '2rem', 
            overflowX: 'auto', 
            background: 'var(--color-evidence)', 
            padding: '1rem', 
            borderRadius: '4px', 
            border: '1px solid var(--color-redacted)' 
          }}>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              color: 'var(--color-redacted)', 
              fontSize: '0.9rem', 
              letterSpacing: '1px',
              fontFamily: 'var(--font-display)',
            }}>
              DATA OUTPUT // {result.result_rows.length} RECORD{result.result_rows.length !== 1 ? 'S' : ''}
            </h4>
            <table className="results-table">
              <thead>
                <tr>
                  {resultColumns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.result_rows.map((row, i) => (
                  <tr key={i}>
                    {resultColumns.map((col) => (
                      <td key={col}>{String(row[col] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty result set notice */}
        {result && result.result_rows.length === 0 && (
          <p style={{ 
            marginTop: '1rem', 
            color: 'var(--color-redacted)', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.9rem' 
          }}>
            &gt; QUERY EXECUTED. 0 RECORDS FOUND.
          </p>
        )}
      </div>
    </div>
  )
}
