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

// This is a \n delimited list of files to show coverage for
// If not set, or empty, then coverage is included for all files
// that pass the exclusion RegExp filter. If included in this list,
// then coverage will be recorded, even if it matches exclude.
const cfEnv = process.env._TAPJS_PROCESSINFO_COV_FILES_ || ''
const coveredFiles: string[] = cfEnv.trim().split('\n').filter(f => !!f)
const fileCovered = (
  f: string,
  s?: SourceMapPayload,
  files: string[] = []
) => {
  const testFiles = [f]
  if (s) {
    for (const src of s.sources || []) {
      testFiles.push(fileURLToPath(src))
    }
  }
  if (!testFiles.some(f => files.includes(f))) return false

  // if at least one of them are explicitly covered, then include it,
  // otherwise omit if we explicitly listed
  if (coveredFiles.length) {
    return testFiles.some(f => coveredFiles.includes(f))
  }

  for (const f of testFiles) {
    if (!exclude.test(f)) return true
  }
  return false
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

// NB: this is the *generated* line lengths, not the source
const lineLengths = (f: string): number[] => {
  try {
    const content = readFileSync(f, 'utf8')
    return content.split(/\n|\u2028|\u2029/).map(l => l.length)
  } catch {
    return []
  }
}

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
      // see if it has a source map
      const s = findSourceMap(f)
      if (!fileCovered(f, s?.payload, processInfo.files)) {
        return false
      }
      if (s) {
        const { payload } = s
        sourceMapCache[obj.url] = Object.assign(Object.create(null), {
          lineLengths: lineLengths(f),
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
