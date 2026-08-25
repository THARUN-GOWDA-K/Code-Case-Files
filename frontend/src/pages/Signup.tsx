import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'var(--c-error)', 'var(--c-warn)', '#a3e635', 'var(--c-success)'][strength]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name: displayName || undefined }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.detail || 'Signup failed')
      }

      // Auto-login
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)
      const loginRes = await fetch('/api/auth/login', { method: 'POST', body: formData })
      if (!loginRes.ok) throw new Error('Auto-login failed')
      const loginData = await loginRes.json()
      await login(loginData.access_token)
      showToast('Your badge has been issued, Detective.', 'success')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--c-void)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(251,191,36,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 70% 70%, rgba(16,185,129,0.03) 0%, transparent 60%)',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 480,
        position: 'relative',
        animation: 'scaleIn 350ms ease forwards',
      }}>
        {/* Card */}
        <div style={{
          background: 'linear-gradient(160deg, var(--c-shadow) 0%, var(--c-abyss) 100%)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative corner */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0,
            width: 100, height: 100,
            background: 'radial-gradient(circle at top right, rgba(251,191,36,0.08) 0%, transparent 70%)',
            borderRadius: '0 var(--r-xl) 0 0',
            pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.75rem',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 'var(--r-full)',
              marginBottom: '1.25rem',
            }}>
              <span style={{ fontSize: '0.7rem' }}>🪪</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--c-success)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                New Badge Registration
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--c-text)',
              marginBottom: '0.4rem',
              letterSpacing: '-0.02em',
            }}>
              Join the Force
            </h1>
            <p style={{ color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>
              Create your detective profile and start solving cases.
            </p>
          </div>

          {error && (
            <div className="notice notice-error" style={{ marginBottom: '1.5rem', animation: 'slideInDown 200ms ease' }}>
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Detective Name</label>
              <input
                type="text"
                id="signup-displayname"
                className="form-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Sherlock"
                autoComplete="nickname"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                id="signup-email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@agency.gov"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="signup-password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="min. 6 characters"
                  required
                  autoComplete="new-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: 'var(--c-text-faint)', cursor: 'pointer',
                    fontSize: '1rem', padding: 0, lineHeight: 1,
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{
                      width: `${(strength / 4) * 100}%`,
                      background: strengthColor,
                    }} />
                  </div>
                  <div style={{
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: strengthColor,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}>
                    {strengthLabel}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                id="signup-confirm"
                className="form-input"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                style={{
                  borderColor: confirm && confirm !== password ? 'var(--c-error)' : undefined,
                }}
              />
              {confirm && confirm !== password && (
                <div style={{ marginTop: '0.35rem', color: 'var(--c-error)', fontSize: '0.8rem' }}>
                  Passwords don't match
                </div>
              )}
            </div>

            <button
              type="submit"
              id="signup-submit"
              disabled={loading}
              className="btn btn-success btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: '2px' }} /> Creating badge…</>
              ) : (
                <>🪪 Issue My Badge</>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--c-text-muted)', fontSize: '0.875rem' }}>
            Already have a badge?{' '}
            <Link to="/login" style={{ color: 'var(--c-amber)', fontWeight: 600 }}>
              Log in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
