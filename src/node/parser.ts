import { withCompilerOptions } from 'react-docgen-typescript'
import ts from 'typescript'
import fs from 'fs'
import type { PropInfo, PropType } from '../types.js'

interface ExportInfo {
  name: string
  exportType: 'default' | 'named'
}

const PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/

const NAMED_EXPORT_PATTERNS = [
  /export\s+(?:async\s+)?function\s+([A-Z][a-zA-Z0-9]*)/g,
  /export\s+const\s+([A-Z][a-zA-Z0-9]*)\s*[=:]/g,
  /export\s+class\s+([A-Z][a-zA-Z0-9]*)/g,
  /export\s+(?:let|var)\s+([A-Z][a-zA-Z0-9]*)\s*[=:]/g,
]

const DEFAULT_EXPORT_PATTERNS = [
  /export\s+default\s+(?:async\s+)?function\s+([A-Z][a-zA-Z0-9]*)/,
  /export\s+default\s+class\s+([A-Z][a-zA-Z0-9]*)/,
  /export\s+default\s+([A-Z][a-zA-Z0-9]*)\s*;?\s*$/m,
]

export async function parseExports(filePath: string): Promise<ExportInfo[]> {
  const code = fs.readFileSync(filePath, 'utf-8')
  const results: ExportInfo[] = []
  const seen = new Set<string>()

  for (const pattern of NAMED_EXPORT_PATTERNS) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(code)) !== null) {
      const name = match[1]
      if (!seen.has(name) && PASCAL_CASE.test(name)) {
        seen.add(name)
        results.push({ name, exportType: 'named' })
      }
    }
  }

  for (const pattern of DEFAULT_EXPORT_PATTERNS) {
    const match = code.match(pattern)
    if (match) {
      const name = match[1]
      if (PASCAL_CASE.test(name) && !seen.has(name)) {
        seen.add(name)
        results.push({ name, exportType: 'default' })
      }
      break
    }
  }

  if (!seen.size && /export\s+default\b/.test(code)) {
    const name = inferDefaultExportName(code, filePath)
    if (name && PASCAL_CASE.test(name)) {
      results.push({ name, exportType: 'default' })
    }
  }

  return results
}

function inferDefaultExportName(code: string, filePath: string): string | null {
  const fnMatch = code.match(
    /export\s+default\s+function\s+([A-Z][a-zA-Z0-9]*)/,
  )
  if (fnMatch) return fnMatch[1]

  const classMatch = code.match(
    /export\s+default\s+class\s+([A-Z][a-zA-Z0-9]*)/,
  )
  if (classMatch) return classMatch[1]

  const identMatch = code.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/)
  if (identMatch) return identMatch[1]

  const basename = filePath.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '')
  if (basename && PASCAL_CASE.test(basename)) return basename

  return null
}

const docgenParser = withCompilerOptions(
  {
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
    strict: true,
  },
  {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) => {
      if (prop.declarations && prop.declarations.length > 0) {
        return prop.declarations.some(
          (d) => !d.fileName.includes('node_modules'),
        )
      }
      return true
    },
  },
)

export function parseProps(filePath: string, exportName: string): PropInfo[] {
  try {
    const docs = docgenParser.parse(filePath)
    const doc = docs.find(
      (d) => d.displayName === exportName || docs.length === 1,
    )
    if (!doc) return []

    return Object.entries(doc.props).map(([name, prop]) => {
      const mapped = mapPropType(prop.type.name, prop.type.value)
      return {
        name,
        type: mapped.type,
        required: prop.required,
        defaultValue: prop.defaultValue?.value,
        ...(mapped.options ? { options: mapped.options } : {}),
      }
    })
  } catch {
    return []
  }
}

function mapPropType(
  typeName: string,
  typeValue?: Array<{ value: string }>,
): { type: PropType; options?: string[] } {
  if (typeName === 'string') return { type: 'string' }
  if (typeName === 'number') return { type: 'number' }
  if (typeName === 'boolean' || typeName === 'bool') return { type: 'boolean' }
  if (typeName === 'ReactNode' || typeName === 'React.ReactNode')
    return { type: 'ReactNode' }

  if (typeName === 'enum' && typeValue) {
    const options = typeValue
      .map((v) => v.value.replace(/^["']|["']$/g, ''))
      .filter((v) => v !== 'undefined')
    if (options.length > 0) return { type: 'union', options }
  }

  if (
    typeName.includes('=>') ||
    typeName.includes('Function') ||
    typeName.startsWith('(')
  ) {
    return { type: 'function' }
  }

  return { type: 'json' }
}
