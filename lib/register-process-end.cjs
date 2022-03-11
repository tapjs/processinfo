const onExit = require('signal-exit')
const {getProcessInfo} = require('./get-process-info.cjs')

const {mkdirSync, writeFileSync} = require('fs')
const cwd = process.cwd()
const globals = new Set(Object.keys(global))
const {coverageOnProcessEnd} = require('./register-coverage.cjs')

onExit((code, signal) => {
  const processInfo = getProcessInfo()
  processInfo.code = code
  processInfo.signal = signal
  const runtime = process.hrtime(processInfo.hrstart)
  delete processInfo.hrstart
  processInfo.files = [...new Set(processInfo.files)]
  processInfo.runtime = runtime[0] * 1e3 + runtime[1]/1e6
  const globalsAdded = Object.keys(global).filter(k => !globals.has(k))
  if (globalsAdded.length) {
    processInfo.globalsAdded = globalsAdded
  }

  const f = `${cwd}/.tap/processinfo/${processInfo.uuid}.json`
  mkdirSync(`${cwd}/.tap/processinfo`, { recursive: true })
  writeFileSync(f, JSON.stringify(processInfo) + '\n', 'utf8')
  coverageOnProcessEnd(cwd, processInfo)
}, { alwaysLast: true })
