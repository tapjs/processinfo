const processOnSpawn = require('process-on-spawn')
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k)

processOnSpawn.addListener(({env}) => Object.assign(env, getEnvs(env)))

const envRE = /^_TAPJS_PROCESSINFO_/

const getEnvs = env => {
  // load it here so that it isn't cached before the loader attaches
  // in self-test scenario.
  const {nodeOptionsEnv} = require('./node-options-env.cjs')
  env = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, v]) => !hasOwn(env, k) && envRE.test(k))
      .concat([['NODE_OPTIONS', nodeOptionsEnv(env, process.execArgv)]])
  )
  return env
}
