import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '../components/Editor'
import { submitCode, unlockHint } from '../lib/api'

export default function ChallengeView() {
  const { caseId } = useParams()
  const [caseData, setCaseData] = useState<any>(null)
  const [code, setCode] = useState<string>("# Write Python code here\n")
  const [result, setResult] = useState<any>(null)
  const [hints, setHints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!caseId) return
    fetch(`/api/challenges/${caseId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Case not found')
        return r.json()
      })
      .then(setCaseData)
      .catch(() => setCaseData(null))
      .finally(() => setLoading(false))
    
    // load hints for stage 1
    fetch(`/api/hints/stage/1`)
      .then((r) => r.json())
      .then(setHints)
      .catch(console.error)
  }, [caseId])

  async function handleSubmit(final = true) {
    setResult(null)
    setSubmitting(true)
    try {
      const payload = { stage_id: 1, language: 'python', source: code, final }
      const body = await submitCode(1, 'python', code, final)
      setResult(body)
    } catch (error) {
      setResult({ error: 'Submission failed' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUnlockHint(hintId: number) {
    try {
      const body = await unlockHint(hintId)
      alert('Unlocked: ' + body.text)
    } catch (error) {
      alert('Failed to unlock hint')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            height: '2rem',
            background: 'var(--color-evidence)',
            borderRadius: '4px',
            marginBottom: '1rem',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        </div>
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
    )
  }

  if (!caseData) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="verdict-banner verdict-error">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>CASE NOT FOUND</div>
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>The case file you requested does not exist.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          to="/" 
          style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '0.85rem', 
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            textDecoration: 'none',
          }}
        >
          ← RETURN TO CASE FILES
        </Link>
      </div>

      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        color: 'var(--color-typewriter)',
        marginBottom: '1rem',
        letterSpacing: '1px',
      }}>
        CASE #{caseId}: {caseData.title}
      </h2>

      {caseData.summary && (
        <div className="official-memo" style={{ marginBottom: '2rem' }}>
          {caseData.summary}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Left Panel: Editor */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h4 style={{ 
            margin: '0 0 1rem 0', 
            color: 'var(--color-redacted)', 
            fontSize: '0.9rem', 
            letterSpacing: '1px' 
          }}>
            CODE TERMINAL
          </h4>
          <div style={{ 
            border: '1px solid var(--color-redacted)', 
            borderRadius: '4px', 
            overflow: 'hidden', 
            padding: '2px', 
            background: '#1e1e1e' 
          }}>
            <Editor value={code} language="python" onChange={setCode} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              style={{
                background: submitting ? 'var(--color-evidence)' : 'var(--color-verified)',
                color: submitting ? 'var(--color-redacted)' : '#fff',
                border: submitting ? '1px solid var(--color-redacted)' : 'none',
                borderRadius: '4px',
                padding: '0.75rem 1.5rem',
                cursor: submitting ? 'default' : 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.5px',
                marginRight: '0.5rem',
              }}
            >
              {submitting ? 'RUNNING...' : 'RUN TESTS'}
            </button>
            <button
              onClick={() => handleSubmit(true)}
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
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.5px',
              }}
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>

          {result && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--color-redacted)', 
                fontSize: '0.9rem', 
                letterSpacing: '1px' 
              }}>
                EXECUTION RESULT
              </h4>
              <pre style={{
                background: 'var(--color-evidence)',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid var(--color-redacted)',
                color: 'var(--color-typewriter)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                overflowX: 'auto',
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Panel: Hints */}
        <div style={{ flex: '0 0 300px', minWidth: '250px' }}>
          <h4 style={{ 
            margin: '0 0 1rem 0', 
            color: 'var(--color-redacted)', 
            fontSize: '0.9rem', 
            letterSpacing: '1px' 
          }}>
            CLASSIFIED HINTS
          </h4>
          <div className="dossier-card">
            {hints.length === 0 ? (
              <p style={{ color: 'var(--color-redacted)', fontSize: '0.9rem' }}>
                No hints available for this case.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {hints.map((h) => (
                  <li key={h.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-redacted)' }}>
                    <div style={{ 
                      color: 'var(--color-clue)', 
                      fontSize: '0.85rem', 
                      fontFamily: 'var(--font-display)',
                      marginBottom: '0.5rem',
                    }}>
                      HINT #{h.id}
                    </div>
                    <div style={{ color: 'var(--color-redacted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <span className="redacted-text">Locked evidence</span>
                    </div>
                    <button
                      onClick={() => handleUnlockHint(h.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--color-clue)',
                        color: 'var(--color-clue)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      UNLOCK ({h.cost_points || 0} XP)
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
