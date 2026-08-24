import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Nav() {
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      <style>{`
        .desktop-nav {
          display: none;
        }
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
          }
        }
        .mobile-menu-btn {
          display: block;
        }
        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none;
          }
        }
        .mobile-menu {
          display: none;
        }
        @media (max-width: 767px) {
          .mobile-menu {
            display: flex;
          }
        }
      `}</style>
      <header style={{
        borderBottom: '2px solid var(--color-redacted)',
        padding: '1.5rem 2rem',
        backgroundColor: 'var(--color-evidence)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            color: 'var(--color-typewriter)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
          }}>
            CODE CASE FILES
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{
          gap: '1.5rem',
        }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ 
              color: 'var(--color-redacted)', 
              fontSize: '0.8rem', 
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Programming:
            </span>
            <Link 
              to="/" 
              style={{
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                color: isActive('/') ? 'var(--color-clue)' : 'var(--color-redacted)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
              Cases
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ 
              color: 'var(--color-redacted)', 
              fontSize: '0.8rem', 
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Database:
            </span>
            <Link 
              to="/sql-cases" 
              style={{
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                color: isActive('/sql-cases') ? 'var(--color-clue)' : 'var(--color-redacted)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
            >
              SQL Cases
            </Link>
          </div>

          {loading ? (
            <span style={{ color: 'var(--color-redacted)', fontSize: '0.9rem' }}>Loading...</span>
          ) : isAuthenticated ? (
            <>
              <Link 
                to="/profile" 
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  letterSpacing: '1px',
                  color: isActive('/profile') ? 'var(--color-clue)' : 'var(--color-redacted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
              >
                Profile
              </Link>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderLeft: '1px solid var(--color-redacted)',
                paddingLeft: '1rem',
                marginLeft: '0.5rem',
              }}>
                <span style={{
                  color: 'var(--color-clue)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)',
                }}>
                  Detective {user?.display_name}
                </span>
                <span style={{
                  color: 'var(--color-verified)',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-display)',
                }}>
                  {user?.xp || 0} XP
                </span>
                <button
                  onClick={logout}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-classified)',
                    color: 'var(--color-classified)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-classified)'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--color-classified)'
                  }}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  letterSpacing: '1px',
                  color: isActive('/login') ? 'var(--color-clue)' : 'var(--color-redacted)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                style={{
                  fontFamily: 'var(--font-display)',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  letterSpacing: '1px',
                  color: 'var(--color-clue)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                  fontWeight: 'bold',
                }}
              >
                Signup
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-typewriter)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--color-evidence)',
            borderBottom: '2px solid var(--color-redacted)',
            padding: '1rem',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ borderBottom: '1px solid var(--color-redacted)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ 
                color: 'var(--color-redacted)', 
                fontSize: '0.8rem', 
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                Programming
              </span>
            </div>
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                color: isActive('/') ? 'var(--color-clue)' : 'var(--color-redacted)',
                textDecoration: 'none',
                padding: '0.5rem',
              }}
            >
              Cases
            </Link>
            <div style={{ borderBottom: '1px solid var(--color-redacted)', paddingBottom: '0.5rem', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ 
                color: 'var(--color-redacted)', 
                fontSize: '0.8rem', 
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                Database
              </span>
            </div>
            <Link 
              to="/sql-cases" 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                letterSpacing: '1px',
                color: isActive('/sql-cases') ? 'var(--color-clue)' : 'var(--color-redacted)',
                textDecoration: 'none',
                padding: '0.5rem',
              }}
            >
              SQL Cases
            </Link>

            {loading ? (
              <span style={{ color: 'var(--color-redacted)', fontSize: '0.9rem', padding: '0.5rem' }}>Loading...</span>
            ) : isAuthenticated ? (
              <>
                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    letterSpacing: '1px',
                    color: isActive('/profile') ? 'var(--color-clue)' : 'var(--color-redacted)',
                    textDecoration: 'none',
                    padding: '0.5rem',
                  }}
                >
                  Profile
                </Link>
                <div style={{
                  borderTop: '1px solid var(--color-redacted)',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                }}>
                  <div style={{ marginBottom: '0.5rem', color: 'var(--color-clue)', fontSize: '0.85rem' }}>
                    Detective {user?.display_name}
                  </div>
                  <div style={{ marginBottom: '0.5rem', color: 'var(--color-verified)', fontSize: '0.85rem' }}>
                    {user?.xp || 0} XP
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: '1px solid var(--color-classified)',
                      color: 'var(--color-classified)',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-display)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    letterSpacing: '1px',
                    color: isActive('/login') ? 'var(--color-clue)' : 'var(--color-redacted)',
                    textDecoration: 'none',
                    padding: '0.5rem',
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    letterSpacing: '1px',
                    color: 'var(--color-clue)',
                    textDecoration: 'none',
                    padding: '0.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  )
}
