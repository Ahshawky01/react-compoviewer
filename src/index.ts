import type { CompoViewerConfig, ResolvedConfig } from './types.js'
import { DEFAULT_CONFIG } from './shared/constants.js'

export type {
  CompoViewerConfig,
  ResolvedConfig,
  ComponentEntry,
  PropInfo,
  PropType,
  RegistryData,
  PanelConfig,
} from './types.js'

export function defineConfig(config: CompoViewerConfig): CompoViewerConfig {
  return config
}

export function resolveConfig(config: CompoViewerConfig = {}): ResolvedConfig {
  return {
    include: config.include ?? DEFAULT_CONFIG.include,
    exclude: config.exclude ?? DEFAULT_CONFIG.exclude,
    wrapper: config.wrapper ?? DEFAULT_CONFIG.wrapper,
    shortcut: config.shortcut ?? DEFAULT_CONFIG.shortcut,
    panel: {
      ...DEFAULT_CONFIG.panel,
      ...config.panel,
    },
  }
}
