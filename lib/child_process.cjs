const {
  spawn,
  spawnSync,
  exec,
  execSync,
  execFile,
  execFileSync,
} = require('child_process')
const { getExclude } = require('./get-exclude.cjs')
const { spawnOpts } = require('./spawn-opts.cjs')
const k = '_TAPJS_PROCESSINFO_EXCLUDE_'

module.exports = {
  spawn(cmd, args, options) {
    return spawn(cmd, args, spawnOpts(options, getExclude(k)))
  },

  spawnSync(cmd, args, options) {
    return spawnSync(cmd, args, spawnOpts(options, getExclude(k)))
  },

  exec(cmd, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    return exec(cmd, spawnOpts(options, getExclude(k)), callback)
  },

  execSync(cmd, options) {
    return execSync(cmd, spawnOpts(options, getExclude(k)))
  },

  execFile(cmd, ...execFileArgs) {
    let args = []
    let options = {}
    let callback = undefined
    for (const arg of execFileArgs) {
      if (Array.isArray(arg)) {
        args = arg
      } else if (arg && typeof arg === 'object') {
        options = arg
      } else if (typeof arg === 'function') {
        callback = arg
      }
    }
    return execFile(cmd, args, spawnOpts(options, getExclude(k)), callback)
  },

  execFileSync(cmd, ...execFileArgs) {
    let args = []
    let options = {}
    for (const arg of execFileArgs) {
      if (Array.isArray(arg)) {
        args = arg
      } else if (arg && typeof arg === 'object') {
        options = arg
      }
    }
    return execFileSync(cmd, args, spawnOpts(options, getExclude(k)))
  },
}
