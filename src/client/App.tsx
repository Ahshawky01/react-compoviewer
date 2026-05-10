import { useState, useCallback } from 'react'
import { Overlay } from './components/Overlay.js'
import { RegistryContext } from './hooks/useRegistry.js'
import { useShortcut } from './hooks/useShortcut.js'
import type { ComponentEntry, PanelConfig } from '../types.js'
import type React from 'react'

interface LoadableEntry extends ComponentEntry {
  load: () => Promise<React.ComponentType<Record<string, unknown>>>
}

interface AppProps {
  registry: LoadableEntry[]
  config: { shortcut: string; panel: PanelConfig }
  Wrapper: React.ComponentType<{ children: React.ReactNode }> | null
}

export function App({ registry, config, Wrapper }: AppProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  useShortcut(config.shortcut, toggle)

  return (
    <RegistryContext.Provider value={{ components: registry, config, Wrapper }}>
      <Overlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        panelConfig={config.panel}
      />
    </RegistryContext.Provider>
  )
}
