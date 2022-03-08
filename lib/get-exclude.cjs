const getExclude = () => {
  const src = process.env._TAPJS_PROCESSINFO_EXCLUDE_
  let exclude = /(^|\\|\/)node_modules(\\|\/)/
  if (src) {
    const parsed = src.match(/^\/(.*)\/([a-z]*)$/)
    if (parsed) {
      exclude = new RegExp(parsed[1], parsed[2])
    }
  }
  process.env._TAPJS_PROCESSINFO_EXCLUDE_ = String(exclude)
  return exclude
}

module.exports.getExclude = getExclude
