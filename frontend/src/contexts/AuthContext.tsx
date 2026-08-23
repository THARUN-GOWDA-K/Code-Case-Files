import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
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
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      getAuthMe()
        .then(setUser)
        .catch(() => {
          clearToken()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }

    // Listen for 401 events and clear user state
    const handleAuth401 = () => {
      setUser(null)
    }

    window.addEventListener('auth-401', handleAuth401)
    return () => {
      window.removeEventListener('auth-401', handleAuth401)
    }
  }, [])

  const login = async (token: string) => {
    try {
      setToken(token)
      const userData = await getAuthMe()
      setUser(userData)
      setLoading(false)
    } catch (error) {
      clearToken()
      setUser(null)
      setLoading(false)
      throw error
    }
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const authValue = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }), [user, loading])

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
