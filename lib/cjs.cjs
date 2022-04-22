// commonjs style loader hook
const {getProcessInfo} = require('./get-process-info.cjs')
const {getExclude} = require('./get-exclude.cjs')

// have to make this a module-local, otherwise it reloads the info
const processInfo = getProcessInfo()
const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_')

const {addHook} = require('pirates')

const matcher = filename => !exclude.test(filename)
const hook = (code, filename) => {
  processInfo.files.push(filename)
  return code
}
addHook(hook, { exts: ['.js', '.cjs'], matcher })
