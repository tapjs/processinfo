import { findSourceMap, SourceMap } from 'module'
import { pathToURL } from './path-to-url.js'

const sourceMaps = new Map<string, SourceMap>()

export const findSourceMapSafe = (s: string | URL) => {
  // Have to look up by URL, because the ?tapmock param will be in
  // the internal key used by node, as those are "different" modules.
  const mod = pathToURL(s)
  const c = sourceMaps.get(mod)
  if (c) return c

  // this can throw in some cases in node 19
  try {
    const sm = findSourceMap(mod)
    if (sm) sourceMaps.set(mod, sm)
    return sm
    /* c8 ignore start */
  } catch {}
  /* c8 ignore stop */
}
