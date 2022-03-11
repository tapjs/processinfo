// commonjs style loader hook
const original = require.extensions['.js']
const {getProcessInfo} = require('./get-process-info.cjs')
const {getExclude} = require('./get-exclude.cjs')

// have to make this a module-local, otherwise it reloads the info
const processInfo = getProcessInfo()
const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_')

// export the function so it's easier to test.
const cjsWrapper = (module, filename) => {
  if (!exclude.test(filename)) {
    processInfo.files.push(filename)
  }
  return original(module, filename)
}
module.exports = {cjsWrapper, original}
require.extensions['.js'] = cjsWrapper
