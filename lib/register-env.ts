import processOnSpawn from 'process-on-spawn'
import { nodeOptionsEnv } from './node-options-env.js'

const envRE = /^_TAPJS_PROCESSINFO_/
const { hasOwnProperty } = Object.prototype

const getEnvs = (env?: NodeJS.ProcessEnv) => {
  // load it here so that it isn't cached before the loader attaches
  // in self-test scenario.
  const e = env || process.env
  return Object.fromEntries(
    Object.entries(e)
      .filter(([k]) => !hasOwnProperty.call(env || {}, k) && envRE.test(k))
      .concat([['NODE_OPTIONS', nodeOptionsEnv(e, process.execArgv)]])
  )
}

export const register = () => {
  processOnSpawn.addListener(obj => {
    obj.env = Object.assign(obj.env || {}, getEnvs(obj.env))
    return obj
  })
}
