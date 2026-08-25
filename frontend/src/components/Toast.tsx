import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    error: 'var(--color-classified)',
    success: 'var(--color-verified)',
    info: 'var(--color-clue)',
  }[type]

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: bgColor,
        color: type === 'info' ? '#000' : '#fff',
        padding: '1rem 1.5rem',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        fontFamily: 'var(--font-body)',
        fontSize: '0.95rem',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        maxWidth: '400px',
      }}
    >
      {message}
    </div>
  )
}
