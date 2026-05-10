import type { ResolvedConfig } from '../types.js'

export const VIRTUAL_MODULE_ID = 'virtual:compoviewer/registry'
export const VIRTUAL_RESOLVED_ID = '\0virtual:compoviewer/registry'
export const VIRTUAL_CLIENT_ID = 'virtual:compoviewer/client'
export const VIRTUAL_CLIENT_RESOLVED_ID = '\0virtual:compoviewer/client'

export const DEFAULT_CONFIG: ResolvedConfig = {
  include: ['src/**/*.tsx', 'src/**/*.jsx', 'app/**/*.tsx', 'app/**/*.jsx'],
  exclude: [
    '**/*.test.*',
    '**/*.spec.*',
    '**/*.stories.*',
    '**/*.d.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/.compoviewer/**',
  ],
  wrapper: null,
  shortcut: 'ctrl+shift+v',
  panel: {
    position: 'right',
    defaultWidth: 420,
    minWidth: 320,
    maxWidth: 800,
  },
}

export const STORAGE_KEY = 'compoviewer:recent'
export const MAX_RECENT = 10
