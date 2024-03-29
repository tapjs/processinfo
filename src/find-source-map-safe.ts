import { findSourceMap, SourceMap } from 'module'
import { pathToURL } from './path-to-url.js'

const sourceMaps = new Map<string, SourceMap>()

export const findSourceMapSafe = (
  s: string | URL
): false | undefined | SourceMap => {
  // Have to look up by URL, because the ?tapmock param will be in
  // the internal key used by node, as those are "different" modules.
  const mod = pathToURL(s)
  const c = sourceMaps.get(mod)
  if (c) return c

  // this can throw in some cases, eg if the sourcemap file is missing
  try {
    const sm = findSourceMap(mod)
    if (sm) sourceMaps.set(mod, sm)
    return sm
    // only throws on node 20
    /* c8 ignore start */
  } catch {
    return false
  }
  /* c8 ignore stop */
}
