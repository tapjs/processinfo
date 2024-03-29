// start tracking coverage, unless disabled explicltly
// export so that we know to collect at the end of the process
const p = process
const enabled = p.env._TAPJS_PROCESSINFO_COVERAGE_ !== '0'
import { mkdirSync, writeFileSync } from 'node:fs'
import { Session } from 'node:inspector'
import { SourceMapPayload } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalSource } from './canonical-source.js'
import { findSourceMapSafe } from './find-source-map-safe.js'
import { getExclude } from './get-exclude.js'
import { getLineLengths } from './line-lengths.js'
import { lookupSources } from './lookup-sources.js'
import { ProcessInfoNodeData } from './process-info-node.js'

export let SESSION: Session | undefined = undefined

// This is a \n delimited list of files to show coverage for
// If not set, or empty, then coverage is included for all files
// that pass the exclusion RegExp filter. If included in this list,
// then coverage will be recorded, even if it matches exclude.
const cfEnv = p.env._TAPJS_PROCESSINFO_COV_FILES_ || ''
const coveredFiles: string[] = cfEnv
  .trim()
  .split('\n')
  .filter(f => !!f)

// NB: coverage exclusion is in addition to processinfo
// exclusion.  Only show coverage for a file we care
// about at least somewhat, but coverage is a subset.
const cxEnv = p.env._TAPJS_PROCESSINFO_COV_EXCLUDE_FILES_ || ''
const uncoveredFiles: string[] = cxEnv
  .trim()
  .split('\n')
  .filter(f => !!f)

const exclude = p.env._TAPJS_PROCESSINFO_COV_EXCLUDE_
  ? getExclude('_TAPJS_PROCESSINFO_COV_EXCLUDE_', false)
  : /[\\\/]node_modules[\\\/]/
const fileEx = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_', false)

const fileCovered = (
  f: string,
  sources: string[] = [],
  files: string[] = []
) => {
  const testFiles = [f]
  for (const src of sources || []) {
    testFiles.push(
      resolve(src.startsWith('file://') ? fileURLToPath(src) : src)
    )
  }

  // never include coverage if the file is fully ignored.
  if (!testFiles.some(f => files.includes(f))) {
    // just in case it was missed somehow, make sure it *should* be excluded
    for (const f of testFiles) {
      if (fileEx.test(f)) {
        return false
      }
    }
    // otherwise, it was missed by the loader recording somehow
    // this can happen with commonjs transpilations in some cases
    files.push(f)
  }

  // if at least one of them are explicitly covered, then include it,
  // otherwise omit if we explicitly listed
  if (coveredFiles.length) {
    return testFiles.some(f => coveredFiles.includes(f))
  }

  // if any of the filenames are explicitly excluded, no coverage
  // otherwise, it is covered
  return !testFiles.some(
    f => uncoveredFiles.includes(f) || exclude?.test(f)
  )
}

// C8 can't see that this function runs, best theory is that it
// collides with what it's doing with the coverage it's collecting
// This ignore can possibly be removed once this is being tested
// with a version of tap that uses this library, but it might just
// be an unresolveable bootstrap problem.
// The test does verify that it ran, because otherwise, there would
// be no coverage, and it verifies that it gets the expected coverage.
/* c8 ignore start */
export const register = () => {
  if (!enabled) return
  p.env._TAPJS_PROCESSINFO_COVERAGE_ = '1'

  SESSION = new Session()
  SESSION.connect()
  SESSION.post('Profiler.enable')
  SESSION.post('Runtime.enable')
  SESSION.post('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: true,
  })
}
/* c8 ignore stop */

export const coverageOnProcessEnd = (
  cwd: string,
  processInfo: ProcessInfoNodeData
) => {
  // Similar to the coverage tracking bootstrap problem above, c8
  // doesn't see that this function runs, even though it DOES see
  // that the function defined below runs, which is weird.
  /* c8 ignore start */
  if (!SESSION) return
  const session = SESSION

  const f = `${cwd}/.tap/coverage/${processInfo.uuid}.json`
  mkdirSync(`${cwd}/.tap/coverage`, { recursive: true })

  session.post('Profiler.takePreciseCoverage', (er, cov) => {
    session.post('Profiler.stopPreciseCoverage')
    /* c8 ignore stop */

    // something very strange and bad happened
    /* c8 ignore start */
    if (er) {
      throw er
    }
    /* c8 ignore stop */

    // Create a source-map-cache that c8 uses in report generation
    const sourceMapCache: {
      [k: string]: {
        lineLengths: number[]
        data: SourceMapPayload
      }
    } = {}
    Object.assign(cov, {
      'source-map-cache': sourceMapCache,
    })

    cov.result = cov.result.filter(obj => {
      if (!/^file:/.test(obj.url)) {
        return false
      }
      obj.url = canonicalSource(obj.url)
      const f = fileURLToPath(obj.url)
      // see if it has a source map
      // need to look up via the url, not the file path, because mocks
      // attach a tapmock search param, which is in node's internal key.
      const sources = lookupSources(obj.url, true)
      if (!fileCovered(f, sources, processInfo.files)) {
        return false
      }
      // Most of the time this will be cached at the time of recording, but
      // if it's the last module loaded, or transpiled in-place by ts-node,
      // the sourcemap won't be pre-loaded and will have to be looked up.
      const s = findSourceMapSafe(obj.url)
      const { payload } = s || { payload: null }
      if (payload) {
        sourceMapCache[obj.url] = Object.assign(Object.create(null), {
          /* c8 ignore start */
          // node's SourceMap objects provide this as of 20.5.0
          //@ts-ignore
          lineLengths: s?.lineLengths || getLineLengths(f),
          /* c8 ignore stop */
          data: {
            ...payload,
            sources: payload.sources?.map(s => canonicalSource(s)),
          },
        })
      }
      return true
    })

    writeFileSync(f, JSON.stringify(cov, null, 2) + '\n', 'utf8')
    /* c8 ignore start */
  })
}
/* c8 ignore stop */
