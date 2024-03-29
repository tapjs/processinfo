import processOnSpawn from 'process-on-spawn'
import { nodeOptionsEnv } from './node-options-env.js'

const p = process
const envRE = /^_TAPJS_PROCESSINFO_/
const { hasOwnProperty } = Object.prototype

const getEnvs = (env?: NodeJS.ProcessEnv, args: readonly string[] = []) => {
  // load it here so that it isn't cached before the loader attaches
  // in self-test scenario.
  // copy all of OUR envs, if not specifically set on the env object
  return Object.fromEntries(
    Object.entries(p.env)
      .filter(
        ([k]) => !(env && hasOwnProperty.call(env, k)) && envRE.test(k)
      )
      .concat([
        ['NODE_OPTIONS', nodeOptionsEnv(env?.NODE_OPTIONS ? env : p.env, args)],
      ])
  )
}

export const register = () => {
  processOnSpawn.addListener(obj => {
    obj.env = {
      ...(obj.env || p.env),
      ...getEnvs(obj.env, obj.args),
    }
    return obj
  })
}
