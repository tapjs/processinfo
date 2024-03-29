// The sources reported in sourcemaps can be fickle,
// and istanbul's reporting doesn't handle it so well.
// So, we canonicalize all entries in sources to a file://
// url with consistent capitalization.

import { relative, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
const cwd = process.cwd()

export const canonicalSource = (s: string): string => {
  // convert to a path
  if (s.startsWith('file://')) {
    const u = new URL(s)
    const hash = u.hash
    const search = u.search
    return String(pathToFileURL(canonicalPath(fileURLToPath(s)))) +
      hash + search
  }
  // re-resolve it relative to the cwd
  // back to a file: url
  return String(pathToFileURL(canonicalPath(s)))
}

export const canonicalPath = (s: string): string => {
  const rel = relative(cwd, s)
  s = resolve(cwd, rel)
  // capitalize drive letters
  if (/^[a-z]:/.test(s)) s = s.charAt(0).toUpperCase() + s.substring(1)
  // capitalize UNC paths
  if (s.startsWith('\\\\')) {
    s = s.replace(/\\\\[^\\]+\\[^\\]+\\/, _0 => _0.toUpperCase())
  }
  return s
}
