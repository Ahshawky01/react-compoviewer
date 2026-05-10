import { useState, useCallback } from 'react'
import { STORAGE_KEY, MAX_RECENT } from '../../shared/constants.js'

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRecent(names: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
  } catch {
    // localStorage may be unavailable
  }
}

export function useRecent() {
  const [recents, setRecents] = useState<string[]>(readRecent)

  const addRecent = useCallback((name: string) => {
    setRecents((prev) => {
      const next = [name, ...prev.filter((n) => n !== name)].slice(
        0,
        MAX_RECENT,
      )
      writeRecent(next)
      return next
    })
  }, [])

  const clearRecents = useCallback(() => {
    setRecents([])
    writeRecent([])
  }, [])

  return { recents, addRecent, clearRecents }
}
