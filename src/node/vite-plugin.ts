import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'
import { buildRegistry } from './registry-builder.js'
import type { RegistryData, ResolvedConfig } from '../types.js'
import {
  VIRTUAL_MODULE_ID,
  VIRTUAL_RESOLVED_ID,
  VIRTUAL_CLIENT_ID,
  VIRTUAL_CLIENT_RESOLVED_ID,
} from '../shared/constants.js'

export function createVitePlugin(config: ResolvedConfig): Plugin {
  let root = ''
  let server: ViteDevServer | undefined
  let registry: RegistryData = { components: [], timestamp: 0 }

  async function scan() {
    registry = await buildRegistry(root, config)
  }

  function generateRegistryModule(): string {
    const entries = registry.components.map((c) => {
      const absPath = path.resolve(root, c.filePath)
      const importExpr =
        c.exportType === 'default'
          ? `() => import('${absPath}').then(m => m.default)`
          : `() => import('${absPath}').then(m => m['${c.exportName}'])`

      return `  {
    name: ${JSON.stringify(c.name)},
    filePath: ${JSON.stringify(c.filePath)},
    exportName: ${JSON.stringify(c.exportName)},
    exportType: ${JSON.stringify(c.exportType)},
    props: ${JSON.stringify(c.props)},
    load: ${importExpr},
  }`
    })

    const wrapperImport = config.wrapper
      ? `import Wrapper from '${path.resolve(root, config.wrapper)}';\nexport { Wrapper };`
      : `export const Wrapper = null;`

    return `${wrapperImport}
export const registry = [
${entries.join(',\n')}
];
export const config = ${JSON.stringify({
      shortcut: config.shortcut,
      panel: config.panel,
    })};
export const timestamp = ${registry.timestamp};
`
  }

  function generateClientModule(): string {
    return `import { mountCompoViewer } from 'react-compoviewer/client';
import { registry, config, Wrapper } from '${VIRTUAL_MODULE_ID}';

if (import.meta.hot) {
  import.meta.hot.on('compoviewer:registry-update', () => {
    import.meta.hot.invalidate();
  });
}

mountCompoViewer({ registry, config, Wrapper });
`
  }

  return {
    name: 'compoviewer',
    enforce: 'pre',

    configResolved(resolvedConfig) {
      root = resolvedConfig.root
    },

    configureServer(srv) {
      server = srv
    },

    async buildStart() {
      await scan()
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return VIRTUAL_RESOLVED_ID
      if (id === VIRTUAL_CLIENT_ID) return VIRTUAL_CLIENT_RESOLVED_ID
      return null
    },

    load(id) {
      if (id === VIRTUAL_RESOLVED_ID) return generateRegistryModule()
      if (id === VIRTUAL_CLIENT_RESOLVED_ID) return generateClientModule()
      return null
    },

    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module', src: `/@id/__x00__${VIRTUAL_CLIENT_ID.replace('virtual:', 'virtual:')}` },
          injectTo: 'body',
        },
      ]
    },

    async handleHotUpdate({ file }) {
      const ext = path.extname(file)
      if (!['.tsx', '.jsx', '.ts', '.js'].includes(ext)) return
      if (file.includes('node_modules')) return

      const relPath = path.relative(root, file)
      const matchesInclude = config.include.some((pattern) => {
        const simpleMatch =
          relPath.startsWith('src/') || relPath.startsWith('app/')
        return simpleMatch && (ext === '.tsx' || ext === '.jsx')
      })

      if (!matchesInclude) return

      await scan()

      server?.ws?.send({
        type: 'custom',
        event: 'compoviewer:registry-update',
        data: { timestamp: registry.timestamp },
      })
    },
  }
}
