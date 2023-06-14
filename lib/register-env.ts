import processOnSpawn from 'process-on-spawn'
import { nodeOptionsEnv } from './node-options-env.js'

const envRE = /^_TAPJS_PROCESSINFO_/
const { hasOwnProperty } = Object.prototype

const getEnvs = (env?: NodeJS.ProcessEnv) => {
  // load it here so that it isn't cached before the loader attaches
  // in self-test scenario.
  // copy all of OUR envs, if not specifically set on the env object
  return Object.fromEntries(
    Object.entries(process.env)
      .filter(
        ([k]) => !(env && hasOwnProperty.call(env, k)) && envRE.test(k)
      )
      .concat([
        ['NODE_OPTIONS', nodeOptionsEnv(process.env, process.execArgv)],
      ])
  )
}

export const register = () => {
  processOnSpawn.addListener(obj => {
    obj.env = Object.assign(
      obj.env || { ...process.env },
      getEnvs(obj.env)
    )
    return obj
  })
}
