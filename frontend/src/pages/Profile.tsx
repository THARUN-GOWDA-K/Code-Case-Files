import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAttemptsMe } from '../lib/api'
import { getMySqlSubmissions } from '../lib/sqlCases'

export default function Profile() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState<any[]>([])
  const [sqlSubmissions, setSqlSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    
    Promise.all([
      getAttemptsMe(),
      getMySqlSubmissions()
    ])
      .then(([programmingAttempts, sqlData]) => {
        setAttempts(programmingAttempts)
        setSqlSubmissions(sqlData)
      })
      .catch((err) => {
        console.error('Failed to fetch attempts:', err)
        setError('Failed to load investigation history')
        setAttempts([])
        setSqlSubmissions([])
      })
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-redacted)' }}>
        Loading case file...
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '2rem',
        color: 'var(--color-typewriter)',
        marginBottom: '2rem',
        letterSpacing: '1px',
      }}>
        DETECTIVE PROFILE
      </h2>
      
      {user ? (
        <div className="dossier-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-clue)',
            marginBottom: '1rem',
            fontSize: '1.3rem',
          }}>
            {user.display_name}
          </h3>
          <p style={{ color: 'var(--color-redacted)', marginBottom: '0.5rem' }}>
            <strong style={{ color: 'var(--color-typewriter)' }}>Email:</strong> {user.email}
          </p>
          <p style={{ color: 'var(--color-redacted)' }}>
            <strong style={{ color: 'var(--color-typewriter)' }}>Experience Points:</strong>{' '}
            <span style={{ 
              color: 'var(--color-verified)', 
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
            }}>
              {user.xp || 0} XP
            </span>
          </p>
        </div>
      ) : (
        <div className="dossier-card" style={{ marginBottom: '2rem' }}>
          <p style={{ color: 'var(--color-redacted)' }}>Not signed in</p>
        </div>
      )}

      <h3 style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--color-typewriter)',
        marginBottom: '1.5rem',
        fontSize: '1.5rem',
      }}>
        PROGRAMMING INVESTIGATION HISTORY
      </h3>
      
      {error ? (
        <div className="verdict-banner verdict-error">
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>HISTORY UNAVAILABLE</div>
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{error}</div>
          </div>
        </div>
      ) : attempts.length === 0 ? (
        <div className="dossier-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
          }}>
            🔍 No programming investigation history yet
          </p>
          <p style={{ color: 'var(--color-redacted)' }}>
            Start your first programming case to track your progress
          </p>
        </div>
      ) : (
        <div className="dossier-card">
          <table className="results-table">
            <thead>
              <tr>
                <th>Stage ID</th>
                <th>Status</th>
                <th>Score</th>
                <th>Tests Passed</th>
                <th>Total Tests</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.stage_id}</td>
                  <td>
                    <span className={`badge-stamp ${a.status === 'passed' ? 'stamp-easy' : a.status === 'failed' ? 'stamp-hard' : 'stamp-medium'}`}>
                      {a.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{a.score || 0}</td>
                  <td>{a.tests_passed || 0}</td>
                  <td>{a.total_tests || 0}</td>
                  <td>{a.submitted_at ? new Date(a.submitted_at).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{
        fontFamily: 'var(--font-display)',
        color: 'var(--color-typewriter)',
        marginBottom: '1.5rem',
        marginTop: '3rem',
        fontSize: '1.5rem',
      }}>
        SQL INVESTIGATION HISTORY
      </h3>
      
      {sqlSubmissions.length === 0 ? (
        <div className="dossier-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ 
            color: 'var(--color-redacted)', 
            fontSize: '1.1rem', 
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
          }}>
            🔍 No SQL investigation history yet
          </p>
          <p style={{ color: 'var(--color-redacted)' }}>
            Start your first SQL case to track your progress
          </p>
        </div>
      ) : (
        <div className="dossier-card">
          <table className="results-table">
            <thead>
              <tr>
                <th>Stage ID</th>
                <th>Status</th>
                <th>XP Awarded</th>
                <th>Feedback</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {sqlSubmissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.stage_id}</td>
                  <td>
                    <span className={`badge-stamp ${s.correct ? 'stamp-easy' : 'stamp-hard'}`}>
                      {s.correct ? 'SOLVED' : 'INCORRECT'}
                    </span>
                  </td>
                  <td>{s.xp_awarded || 0} XP</td>
                  <td>{s.feedback || 'No feedback'}</td>
                  <td>{s.submitted_at ? new Date(s.submitted_at).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
