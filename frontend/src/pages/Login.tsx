import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const TYPEWRITER_TEXTS = [
  'Crack the code. Solve the case.',
  'Every clue leads somewhere.',
  'The evidence doesn\'t lie.',
  'A good detective reads between the lines.',
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [typeIndex, setTypeIndex] = useState(0)
  const [typeText, setTypeText] = useState('')
  const [typing, setTyping] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { showToast } = useToast()

  const from = new URLSearchParams(location.search).get('return') || '/'

  // Typewriter effect
  useEffect(() => {
    const target = TYPEWRITER_TEXTS[typeIndex]
    let i = typeText.length
    if (typing) {
      if (i < target.length) {
        const t = setTimeout(() => setTypeText(target.slice(0, i + 1)), 60)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setTyping(false), 2000)
        return () => clearTimeout(t)
      }
    } else {
      if (i > 0) {
        const t = setTimeout(() => setTypeText(target.slice(0, i - 1)), 30)
        return () => clearTimeout(t)
      } else {
        setTypeIndex((prev) => (prev + 1) % TYPEWRITER_TEXTS.length)
        setTyping(true)
      }
    }
  }, [typeText, typing, typeIndex])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const res = await fetch('/api/auth/login', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Login failed')
      }
      const data = await res.json()
      await login(data.access_token)
      showToast('Welcome back, Detective.', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--c-void)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Left Atmospheric Panel */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '3rem',
        background: 'linear-gradient(160deg, #0a0e1a 0%, #050810 100%)',
        borderRight: '1px solid var(--c-border)',
        overflow: 'hidden',
      }}
      className="hide-mobile">
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Decorative grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        {/* Case file decorations */}
        {[
          { top: '12%', left: '8%',  rot: '-8deg',  scale: 0.9 },
          { top: '28%', right: '5%', rot:  '5deg',  scale: 0.75 },
          { top: '50%', left: '5%',  rot: '-4deg',  scale: 0.8 },
        ].map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...({ top: s.top, left: (s as any).left, right: (s as any).right }),
            width: 200,
            height: 140,
            background: 'rgba(21,29,53,0.6)',
            border: '1px solid rgba(148,163,184,0.08)',
            borderRadius: 8,
            transform: `rotate(${s.rot}) scale(${s.scale})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
            animation: `float ${4 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'rgba(148,163,184,0.3)',
              textAlign: 'center',
              padding: '0.5rem',
              letterSpacing: '0.05em',
            }}>
              {['EVIDENCE FILE\n#CCF-{i+1}', 'CASE DOSSIER\nCONFIDENTIAL', 'CLASSIFIED\nFILE ACCESS'][i]}
            </div>
          </div>
        ))}

        {/* Bottom copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            fontWeight: 700,
            fontStyle: 'italic',
            color: 'var(--c-text)',
            marginBottom: '1rem',
            lineHeight: 1.2,
          }}>
            Code Case<br />Files
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            color: 'var(--c-amber)',
            height: '1.4em',
            letterSpacing: '0.03em',
          }}>
            {typeText}<span style={{ animation: 'pulse 1s infinite', opacity: 0.7 }}>▌</span>
          </div>
          <div style={{
            marginTop: '1.5rem',
            display: 'flex',
            gap: '1rem',
          }}>
            {['🔍 Investigate', '💡 Solve', '⚡ Earn XP'].map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--c-text-muted)',
                letterSpacing: '0.06em',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--c-abyss)',
        position: 'relative',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          animation: 'scaleIn 400ms ease forwards',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.15)',
              borderRadius: 'var(--r-full)',
              marginBottom: '1.25rem',
            }}>
              <span style={{ fontSize: '0.7rem' }}>🔐</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--c-amber)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Secure Access Portal
              </span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--c-text)',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em',
            }}>
              Detective Login
            </h1>
            <p style={{
              color: 'var(--c-text-muted)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}>
              Enter your credentials to access the case files.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="notice notice-error" style={{ marginBottom: '1.5rem', animation: 'slideInDown 200ms ease' }}>
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                id="login-email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="detective@agency.gov"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  id="login-password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--c-text-faint)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: 0,
                    lineHeight: 1,
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: '2px' }} /> Authenticating…</>
              ) : (
                <>🔎 Access Case Files</>
              )}
            </button>
          </form>

          <div className="divider-text" style={{ margin: '1.75rem 0' }}>or</div>

          <p style={{ textAlign: 'center', color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>
            New to the force?{' '}
            <Link to="/signup" style={{ color: 'var(--c-amber)', fontWeight: 600 }}>
              Create your badge →
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
