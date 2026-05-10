import { useEffect } from 'react'

interface ParsedShortcut {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  key: string
}

function parseShortcut(combo: string): ParsedShortcut {
  const parts = combo.toLowerCase().split('+')
  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    key: parts[parts.length - 1],
  }
}

export function useShortcut(combo: string, callback: () => void) {
  useEffect(() => {
    const parsed = parseShortcut(combo)

    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      const ctrlMatch = parsed.ctrl ? e.ctrlKey || e.metaKey : true
      const shiftMatch = parsed.shift ? e.shiftKey : true
      const altMatch = parsed.alt ? e.altKey : true
      const keyMatch = e.key.toLowerCase() === parsed.key

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [combo, callback])
}
