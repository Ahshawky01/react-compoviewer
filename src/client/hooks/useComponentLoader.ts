import { useState, useCallback, useRef } from 'react'
import type React from 'react'

type LoadFn = () => Promise<React.ComponentType<Record<string, unknown>>>

interface LoaderState {
  Component: React.ComponentType<Record<string, unknown>> | null
  loading: boolean
  error: string | null
}

const moduleCache = new Map<
  string,
  React.ComponentType<Record<string, unknown>>
>()

export function useComponentLoader() {
  const [state, setState] = useState<LoaderState>({
    Component: null,
    loading: false,
    error: null,
  })

  const activeRef = useRef(0)

  const load = useCallback(async (name: string, loadFn: LoadFn) => {
    const id = ++activeRef.current

    const cached = moduleCache.get(name)
    if (cached) {
      setState({ Component: cached, loading: false, error: null })
      return
    }

    setState({ Component: null, loading: true, error: null })

    try {
      const Component = await loadFn()
      if (activeRef.current !== id) return

      moduleCache.set(name, Component)
      setState({ Component, loading: false, error: null })
    } catch (err) {
      if (activeRef.current !== id) return
      setState({
        Component: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load component',
      })
    }
  }, [])

  const clearCache = useCallback((name?: string) => {
    if (name) {
      moduleCache.delete(name)
    } else {
      moduleCache.clear()
    }
  }, [])

  return { ...state, load, clearCache }
}
