'use client'

import type { ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  children,
  onClick,
}: ButtonProps) {
  const styles: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    fontWeight: 500,
    fontSize: 14,
    cursor: 'pointer',
    ...(variant === 'primary'
      ? { background: '#6366f1', color: 'white' }
      : { background: '#e2e8f0', color: '#1e293b' }),
  }

  return (
    <button style={styles} onClick={onClick}>
      {children}
    </button>
  )
}
