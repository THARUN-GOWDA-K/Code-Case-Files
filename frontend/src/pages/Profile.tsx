import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getAttemptsMe } from '../lib/api'

export default function Profile() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    getAttemptsMe()
      .then(setAttempts)
      .catch(() => setAttempts([]))
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
              {user.xp} XP
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
        INVESTIGATION HISTORY
      </h3>
      
      {attempts.length === 0 ? (
        <div className="dossier-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--color-redacted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            🔍 No investigation history yet
          </p>
          <p style={{ color: 'var(--color-redacted)' }}>
            Start your first case to track your progress
          </p>
        </div>
      ) : (
        <div className="dossier-card">
          <table className="results-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Status</th>
                <th>Score</th>
                <th>Tests</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>{a.stage_id}</td>
                  <td>
                    <span className={`badge-stamp ${a.status === 'passed' ? 'stamp-easy' : 'stamp-hard'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.score}</td>
                  <td>{a.tests_passed}/{a.total_tests}</td>
                  <td>{new Date(a.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
