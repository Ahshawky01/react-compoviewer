import { useRef, useEffect } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onEscape: () => void
  onArrowDown: () => void
  isOpen: boolean
}

export function SearchBar({
  value,
  onChange,
  onEscape,
  onArrowDown,
  isOpen,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  return (
    <div className="cv-search">
      <svg
        className="cv-search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        className="cv-search-input"
        type="text"
        placeholder="Search components..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onEscape()
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            onArrowDown()
          }
        }}
      />
      {value && (
        <button
          className="cv-search-clear"
          onClick={() => onChange('')}
          type="button"
        >
          &times;
        </button>
      )}
    </div>
  )
}
