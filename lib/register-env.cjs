const processOnSpawn = require('process-on-spawn')

processOnSpawn.addListener(({env}) => Object.assign(env, getEnvs(env)))

const envRE = /^_TAPJS_PROCESSINFO_/
const {nodeOptionsEnv} = require('./node-options-env.cjs')

const getEnvs = env => {
  env = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, v]) => !hasOwn(env, k) && envRE.test(k))
      .concat(['NODE_OPTIONS', nodeOptionsEnv(env, process.execArgv)])
  )
  delete env.___PROCESS_INFO_PID
  return env
}
