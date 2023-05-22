import { onExit } from 'signal-exit'
import { getProcessInfo } from './get-process-info.js'

import { mkdirSync, writeFileSync } from 'fs'
import { coverageOnProcessEnd } from './register-coverage.js'

const cwd = process.env._TAPJS_PROCESSINFO_CWD_ || process.cwd()
process.env._TAPJS_PROCESSINFO_CWD_ = cwd
const globals = new Set(Object.keys(global))

export const register = () => {
  onExit(
    (code, signal) => {
      const processInfo = getProcessInfo()
      processInfo.code = code
      processInfo.signal = signal
      const runtime = process.hrtime(processInfo.hrstart)
      delete processInfo.hrstart
      processInfo.files = [...new Set(processInfo.files)]
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
