interface InputProps {
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number'
  disabled?: boolean
}

export function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
}: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#475569',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontSize: 14,
          fontFamily: 'inherit',
          outline: 'none',
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  )
}
