import type { Plugin } from 'vite'
import { createVitePlugin } from './node/vite-plugin.js'
import { resolveConfig } from './index.js'
import type { CompoViewerConfig } from './types.js'

export function compoviewer(config: CompoViewerConfig = {}): Plugin {
  const resolved = resolveConfig(config)
  return createVitePlugin(resolved)
}
