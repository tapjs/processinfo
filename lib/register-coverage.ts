// start tracking coverage, unless disabled explicltly
// export so that we know to collect at the end of the process
const enabled = process.env._TAPJS_PROCESSINFO_COVERAGE_ !== '0'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { Session } from 'inspector'
import { findSourceMap, SourceMapPayload } from 'module'
import { fileURLToPath } from 'url'
import { getExclude } from './get-exclude.js'
import { ProcessInfoNodeData } from './process-info-node'

export let SESSION: Session | undefined = undefined

// NB: coverage exclusion is in addition to processinfo
// exclusion.  Only show coverage for a file we care
// about at least somewhat, but coverage is a subset.
const exclude = getExclude('_TAPJS_PROCESSINFO_COV_EXCLUDE_')

export const register = () => {
  if (!enabled) return
  process.env._TAPJS_PROCESSINFO_COVERAGE_ = '1'
  const p = process as NodeJS.Process & {
    setSourceMapsEnabled(v: boolean): void
  }
  p.setSourceMapsEnabled(true)

  SESSION = new Session()
  SESSION.connect()
  SESSION.post('Profiler.enable')
  SESSION.post('Runtime.enable')
  SESSION.post('Profiler.startPreciseCoverage', {
    callCount: true,
    detailed: true,
  })
}

const lineLengths = (f: string) =>
  readFileSync(f, 'utf8')
    .split(/\n|\u2028|\u2029/)
    .map(l => l.length)

export const coverageOnProcessEnd = (
  cwd: string,
  processInfo: ProcessInfoNodeData
) => {
  if (!SESSION) return
  const session = SESSION

  const f = `${cwd}/.tap/coverage/${processInfo.uuid}.json`
  mkdirSync(`${cwd}/.tap/coverage`, { recursive: true })

  session.post('Profiler.takePreciseCoverage', (er, cov) => {
    session.post('Profiler.stopPreciseCoverage')

    /* istanbul ignore next - something very strange and bad happened */
    if (er) {
      throw er
    }
    const covsm: typeof cov & {
      'source-map-cache': {
        [k: string]: {
          lineLengths: number[]
          data: SourceMapPayload
        }
      }
    } = Object.assign(cov, {
      'source-map-cache': {},
    })
    const sourceMapCache = covsm['source-map-cache']
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
          lineLengths: lineLengths(f),
          data: payload,
        })
      }
      return true
    })

    writeFileSync(f, JSON.stringify(cov, null, 2) + '\n', 'utf8')
  })
}
