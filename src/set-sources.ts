import { findSourceMapSafe } from './find-source-map-safe.js'
import { getProcessInfo } from './get-process-info.js'
import {urlToPath} from './url-to-path.js'

// set the processInfo.sources for a given file, but don't clobber
// if called multiple times, or create duplicate entries.
// Should only be called *after* the file in question has been loaded.
export const setSources = (file: string) => {
  const sm = findSourceMapSafe(file)
  if (!sm) return
  const pi = getProcessInfo()
  const s = pi.sources[file] || []
  s.push(...sm.payload.sources.map(s => urlToPath(s)))
  pi.sources[file] = [...new Set(s)]
}
