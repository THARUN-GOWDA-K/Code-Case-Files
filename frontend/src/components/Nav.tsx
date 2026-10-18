import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Nav() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [prevXp, setPrevXp] = useState<number | null>(null)
  const [xpAnimating, setXpAnimating] = useState(false)
  const location = useLocation()
  const mobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Detect scroll for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animate XP on change
  useEffect(() => {
    if (user && prevXp !== null && user.xp !== prevXp) {
      setXpAnimating(true)
      setTimeout(() => setXpAnimating(false), 600)
    }
    if (user) setPrevXp(user.xp)
  }, [user?.xp])

  const isActive = (p: string) => location.pathname === p || location.pathname.startsWith(p + '/')

  const navLinks = [
    { to: '/',           label: 'Dashboard',  icon: '🗺️' },
    { to: '/sql-cases',  label: 'SQL Cases',  icon: '🗄️' },
    { to: '/cases',      label: 'Code Cases', icon: '🔍' },
    { to: '/shop',       label: 'Shop',       icon: '🏪' },
    { to: '/leaderboard',label: 'Leaders',    icon: '🏆' },
  ]

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
        borderBottom: scrolled
          ? '1px solid rgba(148,163,184,0.1)'
          : '1px solid rgba(148,163,184,0.06)',
        background: scrolled
          ? 'rgba(10,14,26,0.92)'
          : 'rgba(10,14,26,0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        transition: 'all 250ms ease',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 2rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 4px 12px rgba(251,191,36,0.3)',
                flexShrink: 0,
              }}>
                🔎
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'var(--c-text)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.1,
                }}>
                  Code Case Files
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  color: 'var(--c-text-faint)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}>
                  Detective Terminal
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hide-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            {navLinks.map(link => {
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 8,
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    color: active ? 'var(--c-amber)' : 'var(--c-text-muted)',
                    background: active ? 'rgba(251,191,36,0.08)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(251,191,36,0.2)' : 'transparent'}`,
                    textDecoration: 'none',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--c-text)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--c-text-muted)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {loading ? (
              <div className="spinner" style={{ width: 18, height: 18 }} />
            ) : isAuthenticated && user ? (
              <>
                {/* XP Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.7rem',
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.15)',
                  borderRadius: 8,
                  transition: 'all 200ms ease',
                }}>
                  <span style={{ fontSize: '0.8rem' }}>⚡</span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--c-amber)',
                    transition: 'transform 200ms ease',
                    transform: xpAnimating ? 'scale(1.25)' : 'scale(1)',
                    display: 'inline-block',
                  }}>
                    {user.xp.toLocaleString()} XP
                  </span>
                </div>

                {/* Profile link */}
                <Link
                  to="/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 8,
                    background: isActive('/profile') ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: `1px solid ${isActive('/profile') ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
                    textDecoration: 'none',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isActive('/profile') ? 'rgba(255,255,255,0.08)' : 'transparent'
                    e.currentTarget.style.border = `1px solid ${isActive('/profile') ? 'rgba(255,255,255,0.12)' : 'transparent'}`
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e3a5f, #0f2845)',
                    border: '2px solid rgba(251,191,36,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--c-amber)',
                    fontFamily: 'var(--font-display)',
                    flexShrink: 0,
                  }}>
                    {user.display_name[0].toUpperCase()}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'var(--c-text-muted)',
                  }}>
                    {user.display_name}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--c-text-faint)', fontSize: '0.8rem' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="hide-desktop"
            onClick={() => setMobileOpen(p => !p)}
            style={{
              background: 'transparent',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              color: 'var(--c-text)',
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 200ms ease',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div ref={mobileRef} style={{
            borderTop: '1px solid var(--c-border)',
            background: 'rgba(10,14,26,0.98)',
            padding: '1rem 1.5rem 1.5rem',
            animation: 'slideInDown 200ms ease forwards',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: 8,
                    color: isActive(link.to) ? 'var(--c-amber)' : 'var(--c-text)',
                    background: isActive(link.to) ? 'rgba(251,191,36,0.08)' : 'transparent',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                  }}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '1rem' }}>
              {isAuthenticated && user ? (
                <>
                  <Link to="/profile" style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem', borderRadius: 8, textDecoration: 'none',
                    marginBottom: '0.5rem',
                    color: isActive('/profile') ? 'var(--c-amber)' : 'var(--c-text)',
                    background: isActive('/profile') ? 'rgba(251,191,36,0.08)' : 'transparent',
                    fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1e3a5f, #0f2845)',
                      border: '2px solid rgba(251,191,36,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--c-amber)', fontWeight: 700, fontSize: '0.85rem',
                    }}>
                      {user.display_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.display_name}</div>
                      <div style={{ color: 'var(--c-amber)', fontSize: '0.8rem' }}>⚡ {user.xp.toLocaleString()} XP</div>
                    </div>
                  </Link>
                  <button onClick={logout} style={{
                    width: '100%', padding: '0.7rem', borderRadius: 8,
                    background: 'transparent', border: '1px solid var(--c-border)',
                    color: 'var(--c-error)', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.875rem',
                    fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to="/login" style={{
                    padding: '0.75rem', textAlign: 'center', borderRadius: 8,
                    border: '1px solid var(--c-border)', color: 'var(--c-text)',
                    textDecoration: 'none', fontFamily: 'var(--font-display)',
                    fontWeight: 500, fontSize: '0.95rem',
                  }}>Log In</Link>
                  <Link to="/signup" style={{
                    padding: '0.75rem', textAlign: 'center', borderRadius: 8,
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: '#000', textDecoration: 'none',
                    fontFamily: 'var(--font-display)', fontWeight: 700,
                    fontSize: '0.95rem',
                  }}>Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
