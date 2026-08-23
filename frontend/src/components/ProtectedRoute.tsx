import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-redacted)' }}>Loading...</div>
  }

  // Check token validity by ensuring user data exists
  if (!isAuthenticated || !user) {
    // Redirect to login with return URL as query param
    const returnUrl = location.pathname + location.search + location.hash
    return <Navigate to={`/login?return=${encodeURIComponent(returnUrl)}`} replace />
  }

  return <>{children}</>
}
