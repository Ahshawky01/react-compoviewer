import { scanFiles, getRelativePath } from './scanner.js'
import { parseExports, parseProps } from './parser.js'
import type { ComponentEntry, RegistryData, ResolvedConfig } from '../types.js'

export async function buildRegistry(
  root: string,
  config: ResolvedConfig,
): Promise<RegistryData> {
  const files = await scanFiles(root, config.include, config.exclude)
  const components: ComponentEntry[] = []

  for (const filePath of files) {
    try {
      const exports = await parseExports(filePath)

      for (const exp of exports) {
        const props = parseProps(filePath, exp.name)
        components.push({
          name: exp.name,
          filePath: getRelativePath(root, filePath),
          exportName: exp.name,
          exportType: exp.exportType,
          props,
        })
      }
    } catch {
      // Skip files that fail to parse
    }
  }

  return {
    components: components.sort((a, b) => a.name.localeCompare(b.name)),
    timestamp: Date.now(),
  }
}

export async function buildRegistryFast(
  root: string,
  config: ResolvedConfig,
): Promise<RegistryData> {
  const files = await scanFiles(root, config.include, config.exclude)
  const components: ComponentEntry[] = []

  for (const filePath of files) {
    try {
      const exports = await parseExports(filePath)

      for (const exp of exports) {
        components.push({
          name: exp.name,
          filePath: getRelativePath(root, filePath),
          exportName: exp.name,
          exportType: exp.exportType,
          props: [],
        })
      }
    } catch {
      // Skip files that fail to parse
    }
  }

  return {
    components: components.sort((a, b) => a.name.localeCompare(b.name)),
    timestamp: Date.now(),
  }
}
