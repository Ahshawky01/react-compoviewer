import { createContext, useContext, useMemo, useCallback } from 'react'
import type { ComponentEntry, PanelConfig } from '../../types.js'

interface LoadableComponentEntry extends ComponentEntry {
  load: () => Promise<React.ComponentType<Record<string, unknown>>>
}

interface RegistryContextValue {
  components: LoadableComponentEntry[]
  config: { shortcut: string; panel: PanelConfig }
  Wrapper: React.ComponentType<{ children: React.ReactNode }> | null
}

export const RegistryContext = createContext<RegistryContextValue | null>(null)

export function useRegistry() {
  const ctx = useContext(RegistryContext)
  if (!ctx) throw new Error('useRegistry must be used within RegistryContext')
  return ctx
}

export function useComponentSearch(query: string) {
  const { components } = useRegistry()

  return useMemo(() => {
    if (!query.trim()) return components

    const lower = query.toLowerCase()
    return components
      .map((c) => {
        const score = fuzzyScore(c.name.toLowerCase(), lower)
        return { component: c, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.component)
  }, [components, query])
}

function fuzzyScore(target: string, query: string): number {
  let qi = 0
  let score = 0
  let consecutive = 0

  for (let ti = 0; ti < target.length && qi < query.length; ti++) {
    if (target[ti] === query[qi]) {
      qi++
      consecutive++
      score += consecutive * 2
      if (ti === 0) score += 5
    } else {
      consecutive = 0
    }
  }

  return qi === query.length ? score : 0
}
