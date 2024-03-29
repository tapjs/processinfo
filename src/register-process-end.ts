import { onExit } from 'signal-exit'
import { getProcessInfo } from './get-process-info.js'

import { mkdirSync, writeFileSync } from 'fs'
import { coverageOnProcessEnd } from './register-coverage.js'
import { setSources } from './set-sources.js'

const proc = process

const cwd = proc.env._TAPJS_PROCESSINFO_CWD_ || proc.cwd()
proc.env._TAPJS_PROCESSINFO_CWD_ = cwd
const globals = new Set(Object.keys(global))

export const register = () => {
  onExit(
    (code, signal) => {
      const processInfo = getProcessInfo()
      processInfo.code = code
      processInfo.signal = signal
      const runtime = proc.hrtime(processInfo.hrstart)
      delete processInfo.hrstart
      processInfo.files = [...new Set(processInfo.files)]
      // try to find the actual sources of the files we loaded
      // This can't be done up front, because the sourcemap isn't
      // present during the load phase, since it's in the contents.
      setSources(processInfo)
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
