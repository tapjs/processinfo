const { v4: uuid } = require('uuid')

const envKey = k => `_TAPJS_PROCESSINFO_${k.toUpperCase()}_`
const getEnv = k => process.env[envKey(k)]
const setEnv = (k, v) => process.env[envKey(k)] = v
const delEnv = k => delete process.env[envKey(k)]

let processInfo = null
exports.getProcessInfo = () => {
  if (!processInfo) {
    require('./register-env.cjs')
    require('./register-process-end.cjs')
    processInfo = {
      hrstart: process.hrtime(),
      date: new Date().toISOString(),
      argv: process.argv,
      execArgv: process.execArgv,
      NODE_OPTIONS: process.env.NODE_OPTIONS,
      cwd: process.cwd(),
      pid: process.pid,
      ppid: process.ppid,
      parent: getEnv('parent') || null,
      uuid: uuid(),
      files: [],
    }
    console.error('CREATED', processInfo)
    if (!processInfo.parent) {
      processInfo.root = processInfo.uuid
      setEnv('root', processInfo.uuid)
    } else {
      processInfo.root = getEnv('root')
    }
    // this is the parent of any further child processes
    setEnv('parent', processInfo.uuid)
    const externalID = getEnv('external_id')
    if (externalID) {
      processInfo.externalID = externalID
      // externalID only applies to ONE process, not all its children.
      delEnv('external_id')
    }
  }
  return processInfo
}
