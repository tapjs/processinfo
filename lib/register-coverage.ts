// start tracking coverage, unless disabled explicltly
// export so that we know to collect at the end of the process
const enabled = process.env._TAPJS_PROCESSINFO_COVERAGE_ !== '0'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { Session } from 'inspector'
import { findSourceMap, SourceMapPayload } from 'module'
import { fileURLToPath } from 'url'
import { getExclude } from './get-exclude.js'
import { ProcessInfoNodeData } from './get-process-info.js'

export let SESSION: Session | undefined = undefined

// NB: coverage exclusion is in addition to processinfo
// exclusion.  Only show coverage for a file we care
// about at least somewhat, but coverage is a subset.
const exclude = getExclude('_TAPJS_PROCESSINFO_COV_EXCLUDE_')

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
  process.env._TAPJS_PROCESSINFO_COVERAGE_ = '1'

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

// only read the file again if we don't already have the content
// in the source map itself.
const lineLengths = (f: string, content?: string): number[] =>
  !content
    ? lineLengths(f, readFileSync(f, 'utf8'))
    : content.split(/\n|\u2028|\u2029/).map(l => l.length)

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
      const f = fileURLToPath(obj.url)
      if (!processInfo.files.includes(f) || exclude.test(f)) {
        return false
      }
      // see if it has a source map
      const s = findSourceMap(f)
      if (s) {
        const { payload } = s
        sourceMapCache[obj.url] = Object.assign(Object.create(null), {
          lineLengths: lineLengths(f, payload.sourcesContent?.join('')),
          data: payload,
        })
      }
      return true
    })

    writeFileSync(f, JSON.stringify(cov, null, 2) + '\n', 'utf8')
    /* c8 ignore start */
  })
}
/* c8 ignore stop */