import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, setToken, clearToken } from '../lib/auth'
import { getAuthMe } from '../lib/api'

interface User {
  id: number
  email: string
  display_name: string
  xp: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = getToken()
    if (token) {
      getAuthMe()
        .then(setUser)
        .catch(() => { clearToken(); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    const handleAuth401 = () => { setUser(null) }
    window.addEventListener('auth-401', handleAuth401)
    return () => window.removeEventListener('auth-401', handleAuth401)
  }, [])

  const login = async (token: string) => {
    setToken(token)
    const userData = await getAuthMe()
    setUser(userData)
    setLoading(false)
  }

  const logout = () => {
    clearToken()
    setUser(null)
    navigate('/login', { replace: true })
  }

  const refreshUser = async () => {
    const token = getToken()
    if (token) {
      try {
        const userData = await getAuthMe()
        setUser(userData)
      } catch { /* silent */ }
    }
  }

  const authValue = useMemo(() => ({
    user, loading, login, logout, refreshUser,
    isAuthenticated: !!user,
  }), [user, loading])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
