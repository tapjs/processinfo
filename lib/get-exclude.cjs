const defaultExclude = /(^|[\\/])node_modules[\\/]/

const parseExclude = src => {
  const parsed = src.match(/^\/(.*)\/([a-z]*)$/)
  if (parsed) {
    try {
      return new RegExp(parsed[1], parsed[2])
    } catch (e) {}
  }
}

const getExclude = () => {
  const src = process.env._TAPJS_PROCESSINFO_EXCLUDE_
  const exclude = src && parseExclude(src) || defaultExclude
  process.env._TAPJS_PROCESSINFO_EXCLUDE_ = String(exclude)
  return exclude
}

module.exports.getExclude = getExclude
