const defaultExclude = /(^|[\\/])node_modules[\\/]/

const parseExclude = src => {
  const parsed = src.match(/^\/(.*)\/([a-z]*)$/)
  if (parsed) {
    try {
      return new RegExp(parsed[1], parsed[2])
    } catch (e) {}
  }
}

const getExclude = k => {
  const src = process.env[k]
  const exclude = src && parseExclude(src) || defaultExclude
  process.env[k] = String(exclude)
  return exclude
}

module.exports.getExclude = getExclude
