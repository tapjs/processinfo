// commonjs style loader hook
const Module = require('module')
const original = require.extensions['.js']
const {getProcessInfo} = require('./get-process-info.cjs')
const {getExclude} = require('./get-exclude.cjs')

// have to make this a module-local, otherwise it reloads the info
const processInfo = getProcessInfo()
const exclude = getExclude()

require.extensions['.js'] = (module, filename) => {
  if (!exclude.test(filename)) {
    processInfo.files.push(filename)
  }
  return original(module, filename)
}
