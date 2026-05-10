import fg from 'fast-glob'
import path from 'path'

export async function scanFiles(
  root: string,
  include: string[],
  exclude: string[],
): Promise<string[]> {
  const files = await fg(include, {
    cwd: root,
    ignore: exclude,
    absolute: true,
    onlyFiles: true,
  })
  return files.sort((a, b) => a.localeCompare(b))
}

export function getRelativePath(root: string, filePath: string): string {
  return path.relative(root, filePath)
}
