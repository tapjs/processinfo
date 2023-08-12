import { findSourceMap } from 'module'

// this can throw in some cases in node 19
/* c8 ignore start */
export const findSourceMapSafe = (s: string) => {
  try {
    return findSourceMap(s)
  } catch {}
}
/* c8 ignore stop */
