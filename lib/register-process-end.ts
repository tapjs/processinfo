import { onExit } from 'signal-exit'
import { getProcessInfo } from './get-process-info.js'

import { mkdirSync, writeFileSync } from 'fs'
import { findSourceMap, SourceMap } from 'module'
import { fileURLToPath } from 'url'
import { coverageOnProcessEnd } from './register-coverage.js'

const cwd = process.env._TAPJS_PROCESSINFO_CWD_ || process.cwd()
process.env._TAPJS_PROCESSINFO_CWD_ = cwd
const globals = new Set(Object.keys(global))

const sourceMaps = new Map<string, SourceMap>()

export const register = () => {
  onExit(
    (code, signal) => {
      const processInfo = getProcessInfo()
      processInfo.code = code
      processInfo.signal = signal
      const runtime = process.hrtime(processInfo.hrstart)
      delete processInfo.hrstart
      processInfo.files = [...new Set(processInfo.files)]
      // try to find the actual sources of the files we loaded
      // This can't be done up front, because the sourcemap isn't
      // present during the load phase, since it's in the contents.
      for (const file of processInfo.files) {
        const sm = sourceMaps.get(file) || findSourceMap(file)
        if (sm && !sourceMaps.has(file)) sourceMaps.set(file, sm)
        const sources = sm?.payload.sources?.map(s =>
          // it SHOULD always start with file://, but could in theory
          // be literally any string.
          /* c8 ignore start */
          s.startsWith('file://') ? fileURLToPath(s) : s
          /* c8 ignore stop */
        )
        if (sources) processInfo.sources[file] = sources
      }
      processInfo.runtime = runtime[0] * 1e3 + runtime[1] / 1e6
      const globalsAdded = Object.keys(global).filter(k => !globals.has(k))
      if (globalsAdded.length) {
        processInfo.globalsAdded = globalsAdded
      }

      const f = `${cwd}/.tap/processinfo/${processInfo.uuid}.json`
      mkdirSync(`${cwd}/.tap/processinfo`, { recursive: true })
      writeFileSync(f, JSON.stringify(processInfo, null, 2) + '\n', 'utf8')
      coverageOnProcessEnd(cwd, processInfo)
    },
    { alwaysLast: true }
  )
}
