export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'union'
  | 'ReactNode'
  | 'function'
  | 'json'

export interface PropInfo {
  name: string
  type: PropType
  required: boolean
  defaultValue?: unknown
  options?: string[]
}

export interface ComponentEntry {
  name: string
  filePath: string
  exportName: string
  exportType: 'default' | 'named'
  props: PropInfo[]
}

export interface RegistryData {
  components: ComponentEntry[]
  timestamp: number
}

export interface PanelConfig {
  position: 'right' | 'left'
  defaultWidth: number
  minWidth: number
  maxWidth: number
}

export interface CompoViewerConfig {
  include?: string[]
  exclude?: string[]
  wrapper?: string
  shortcut?: string
  panel?: Partial<PanelConfig>
}

export interface ResolvedConfig {
  include: string[]
  exclude: string[]
  wrapper: string | null
  shortcut: string
  panel: PanelConfig
}
