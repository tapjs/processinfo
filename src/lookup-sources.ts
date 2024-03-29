// For some reason that is very mysterious as of the time of writing this,
// node sporadically will in rare cases hang and fail to gracefully exit if
// a sufficiently large number of findSourceMap calls are made during the
// process exit event.
//
// However, we cannot look up source maps until *after* the module load
// event is completely finished and the module is about to be executed,
// because that is when the source map is added to node's cache.
//
// To work around this, every time a module is loaded, we attempt to
// determine whether it likely has the magic sourceMappingURL comment.
// If so, then we put it in a list, and at each message, attempt to load
// the sources for all modules in the list. Then, on process exit, if
// there's anything still pending that likely has a source map, we only
// have to look up at most one module (ie, if the last module loaded had a
// source map), which seems to not trigger the hang.

import { findSourceMapSafe } from './find-source-map-safe.js'

// the list of modules that likely have source maps
const maybeSM = new Set<string>()
export const sourcesCache = new Map<string, string[]>()

export const loadPendingSourceMaps = () => {
  for (const url of maybeSM) {
    const sm = findSourceMapSafe(url)
    // only possible on node 19+
    /* c8 ignore start */
    if (sm === false) {
      // can only happen if node found the SM comment, and tried to load it,
      // but got an error creating the sourcemap, because it's invalid or
      // the file is not present. No need to keep trying.
      maybeSM.delete(url)
    } else {
      /* c8 ignore stop */
      const sources = sm?.payload?.sources
      if (sources) {
        sourcesCache.set(url, sources)
        maybeSM.delete(url)
      }
    }
  }
}

export const lookupSources = (url: string, processEnd?: boolean) =>
  getSources(processEnd).get(url)

let didFinalLookupAttempt = false
export const getSources = (processEnd: boolean = false) => {
  if (maybeSM.size && (!processEnd || !didFinalLookupAttempt)) {
    if (processEnd) didFinalLookupAttempt = true
    loadPendingSourceMaps()
  }
  return sourcesCache
}

export const likelyHasSourceMap = (url: string) => {
  if (!sourcesCache.has(url)) maybeSM.add(url)
  loadPendingSourceMaps()
}
