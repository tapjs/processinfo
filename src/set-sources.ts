import { fileURLToPath } from 'url'
import { ProcessInfoNodeData } from './index.js'
import { getSources } from './lookup-sources.js'
import { urlToPath } from './url-to-path.js'

let sourcesCache: Map<string, string[]>

// set the processInfo.sources for a given file, but don't clobber
// if called multiple times, or create duplicate entries.
// Should only be called *after* the file in question has been loaded.
export const setSources = (pi: ProcessInfoNodeData) => {
  sourcesCache ??= getSources()
  for (const [url, sources] of sourcesCache.entries()) {
    const file = fileURLToPath(url)
    const s = pi.sources[file] || []
    s.push(...sources.map(s => urlToPath(s)))
    pi.sources[file] = [...new Set(s)]
  }
}
