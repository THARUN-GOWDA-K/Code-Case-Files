import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  // Get return URL from query param or default to '/'
  const searchParams = new URLSearchParams(location.search)
  const from = searchParams.get('return') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // First, create the account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName || undefined,
        }),
      })

      if (!signupResponse.ok) {
        const data = await signupResponse.json()
        throw new Error(data.detail || 'Signup failed')
      }

      // Then, login to get the token
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      })

      if (!loginResponse.ok) {
        throw new Error('Account created but login failed')
      }

      const loginData = await loginResponse.json()
      await login(loginData.access_token)
      showToast('Badge issued. Welcome to the force, Detective.', 'success')
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
      background: 'var(--color-case-file)',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Vignette effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        background: 'var(--color-evidence)',
        border: '1px solid var(--color-redacted)',
        borderRadius: '4px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          color: 'var(--color-typewriter)',
          marginBottom: '0.5rem',
          letterSpacing: '2px',
          textAlign: 'center',
        }}>
          NEW BADGE ISSUANCE
        </h1>
        <p style={{
          color: 'var(--color-redacted)',
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Register for detective credentials
        </p>

        {error && (
          <div style={{
            background: 'rgba(225, 29, 72, 0.1)',
            border: '1px solid var(--color-classified)',
            color: 'var(--color-classified)',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'var(--color-redacted)',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--color-redacted)',
                borderRadius: '4px',
                color: 'var(--color-typewriter)',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
              }}
              placeholder="detective@agency.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'var(--color-redacted)',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}>
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--color-redacted)',
                borderRadius: '4px',
                color: 'var(--color-typewriter)',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
              }}
              placeholder="Detective Noir (optional)"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'var(--color-redacted)',
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--color-redacted)',
                borderRadius: '4px',
                color: 'var(--color-typewriter)',
                fontSize: '1rem',
                fontFamily: 'var(--font-body)',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? 'var(--color-redacted)' : 'var(--color-clue)',
              color: loading ? 'var(--color-typewriter)' : '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            {loading ? 'ISSUING BADGE...' : 'ISSUE DETECTIVE BADGE'}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: 'var(--color-redacted)',
          fontSize: '0.9rem',
        }}>
          Already registered?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: 'var(--color-clue)',
              textDecoration: 'underline',
            }}
          >
            Access case files
          </Link>
        </p>
      </div>
    </div>
  )
}
