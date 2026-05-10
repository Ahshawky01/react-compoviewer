#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import { resolveConfig } from '../index.js'
import { generateRegistryFile } from './generate-registry.js'
import type { CompoViewerConfig } from '../types.js'

const args = process.argv.slice(2)
const watchMode = args.includes('--watch')
const rootArg = args.find((a) => a.startsWith('--root='))?.split('=')[1]
const root = path.resolve(rootArg ?? '.')

async function loadConfig(): Promise<CompoViewerConfig> {
  const configFiles = [
    'compoviewer.config.ts',
    'compoviewer.config.js',
    'compoviewer.config.mjs',
  ]

  for (const file of configFiles) {
    const configPath = path.join(root, file)
    if (fs.existsSync(configPath)) {
      try {
        const mod = await import(configPath)
        return mod.default ?? mod
      } catch {
        // Fall through to defaults
      }
    }
  }

  return {}
}

async function run() {
  const userConfig = await loadConfig()
  const config = resolveConfig(userConfig)

  console.log('[CompoViewer] Scanning for components...')
  const count = await generateRegistryFile(root, config)
  console.log(
    `[CompoViewer] Found ${count} components. Registry written to .compoviewer/registry.ts`,
  )

  if (watchMode) {
    console.log('[CompoViewer] Watching for changes...')

    const fg = await import('fast-glob')
    const files = new Set(
      await fg.default(config.include, {
        cwd: root,
        ignore: config.exclude,
        absolute: true,
      }),
    )

    const dirs = new Set<string>()
    for (const f of files) {
      dirs.add(path.dirname(f))
    }
    for (const pattern of config.include) {
      const base = pattern.split('*')[0].replace(/\/$/, '')
      if (base) dirs.add(path.resolve(root, base))
    }

    let debounce: ReturnType<typeof setTimeout> | null = null

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue

      fs.watch(dir, { recursive: true }, (_event, filename) => {
        if (!filename) return
        const ext = path.extname(filename)
        if (!['.tsx', '.jsx', '.ts', '.js'].includes(ext)) return

        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(async () => {
          try {
            const newCount = await generateRegistryFile(root, config)
            console.log(
              `[CompoViewer] Registry updated: ${newCount} components`,
            )
          } catch (err) {
            console.error('[CompoViewer] Error updating registry:', err)
          }
        }, 300)
      })
    }

    process.on('SIGINT', () => {
      console.log('\n[CompoViewer] Stopped.')
      process.exit(0)
    })
  }
}

run().catch((err) => {
  console.error('[CompoViewer] Fatal error:', err)
  process.exit(1)
})
