import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'

export default function AuthErrorHandler() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    const handleAuth401 = (event: CustomEvent) => {
      showToast(event.detail.message, 'error')
      setTimeout(() => {
        navigate('/login', { state: { from: window.location.pathname } })
      }, 2000)
    }

    window.addEventListener('auth-401', handleAuth401 as EventListener)
    return () => {
      window.removeEventListener('auth-401', handleAuth401 as EventListener)
    }
  }, [navigate, showToast])

  return null
}
