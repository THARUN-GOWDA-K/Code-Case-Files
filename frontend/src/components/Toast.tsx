import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
  index?: number
}

export default function Toast({ message, type = 'info', onClose, index = 0 }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Slight delay before appearing for stagger effect
    const enterTimer = setTimeout(() => setVisible(true), 10)
    const exitTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(onClose, 350)
    }, 4000)
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer) }
  }, [onClose])

  const handleClose = () => {
    setExiting(true)
    setTimeout(onClose, 350)
  }

  const config = {
    error:   { bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.35)',   color: '#f43f5e', icon: '✕', label: 'ERROR' },
    success: { bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.35)',  color: '#10b981', icon: '✓', label: 'SUCCESS' },
    info:    { bg: 'rgba(56,189,248,0.10)',   border: 'rgba(56,189,248,0.3)',   color: '#38bdf8', icon: 'ℹ', label: 'NOTICE' },
  }[type]

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: `${20 + index * 70}px`,
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        minWidth: '280px',
        maxWidth: '400px',
        padding: '12px 14px',
        background: `linear-gradient(135deg, ${config.bg}, rgba(10,14,26,0.95))`,
        border: `1px solid ${config.border}`,
        borderLeft: `3px solid ${config.color}`,
        borderRadius: '10px',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
        cursor: 'pointer',
        transform: visible && !exiting ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: visible && !exiting ? 1 : 0,
        transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Icon circle */}
      <div style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: `${config.bg}`,
        border: `1px solid ${config.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: config.color,
        fontSize: '0.85rem',
        fontWeight: 'bold',
        flexShrink: 0,
      }}>
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: config.color,
          marginBottom: '2px',
          textTransform: 'uppercase',
        }}>
          {config.label}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--c-text)',
          lineHeight: 1.4,
        }}>
          {message}
        </div>
      </div>

      {/* Close hint */}
      <div style={{
        color: 'var(--c-text-faint)',
        fontSize: '0.7rem',
        flexShrink: 0,
        marginTop: 2,
      }}>
        ✕
      </div>

      {/* Progress line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        borderRadius: '0 0 10px 10px',
        background: `linear-gradient(90deg, ${config.color} 0%, transparent 100%)`,
        animation: 'toastTimer 4s linear forwards',
      }} />

      <style>{`
        @keyframes toastTimer {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
