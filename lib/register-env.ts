import processOnSpawn from 'process-on-spawn'
import { nodeOptionsEnv } from './node-options-env.js'

const envRE = /^_TAPJS_PROCESSINFO_/
const { hasOwnProperty } = Object.prototype

const getEnvs = (env: NodeJS.ProcessEnv) => {
  // load it here so that it isn't cached before the loader attaches
  // in self-test scenario.
  return Object.fromEntries(
    Object.entries(process.env)
      .filter(([k]) => !hasOwnProperty.call(env, k) && envRE.test(k))
      .concat([['NODE_OPTIONS', nodeOptionsEnv(env, process.execArgv)]])
  )
}

export const register = () => {
  processOnSpawn.addListener(obj => {
    const env = obj.env || {}
    obj.env = Object.assign(env, getEnvs(env))
    return obj
  })
}
