const { nodeOptionsEnv } = require('./node-options-env.cjs')

const spawnOpts = (options = {}, exclude) => {
  const { externalID } = options
  const env = { ...(options.env || process.env) }
  env.NODE_OPTIONS = nodeOptionsEnv(env, [])
  if (externalID) {
    env._TAPJS_PROCESSINFO_EXTERNAL_ID_ = externalID
  }
  if (exclude) {
    env._TAPJS_PROCESSINFO_EXCLUDE_ = String(exclude)
  }
  return { ...options, env }
}

module.exports = { spawnOpts }
