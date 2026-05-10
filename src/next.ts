'use client'

import { useEffect, useState } from 'react'
import type { ComponentEntry, PanelConfig } from './types.js'
import type React from 'react'

interface LoadableEntry extends ComponentEntry {
  load: () => Promise<React.ComponentType<Record<string, unknown>>>
}

interface RegistryModule {
  registry: LoadableEntry[]
  config: { shortcut: string; panel: PanelConfig }
}

interface CompoViewerProps {
  registry: RegistryModule['registry']
  config?: RegistryModule['config']
  wrapper?: React.ComponentType<{ children: React.ReactNode }>
}

export function CompoViewer({
  registry,
  config,
  wrapper,
}: CompoViewerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    setMounted(true)

    import('./client/index.js').then(({ mountCompoViewer }) => {
      mountCompoViewer({
        registry,
        config: config ?? {
          shortcut: 'ctrl+shift+v',
          panel: {
            position: 'right',
            defaultWidth: 420,
            minWidth: 320,
            maxWidth: 800,
          },
        },
        Wrapper: wrapper ?? null,
      })
    })
  }, [registry, config, wrapper])

  if (!mounted) return null
  return null
}
