import type { ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500,
    fontFamily: 'inherit',
    opacity: disabled ? 0.5 : 1,
    transition: 'background 0.15s',
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '4px 10px', fontSize: 12 },
    md: { padding: '8px 16px', fontSize: 14 },
    lg: { padding: '12px 24px', fontSize: 16 },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: '#6366f1', color: 'white' },
    secondary: { background: '#e2e8f0', color: '#1e293b' },
    ghost: { background: 'transparent', color: '#6366f1', border: '1px solid #6366f1' },
  }

  return (
    <button
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant] }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
