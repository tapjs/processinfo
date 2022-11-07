const t = require('tap')
process.env._TAPJS_PROCESSINFO_EXCLUDE_ = '/node_modules/'
const { getProcessInfo } = require('../lib/get-process-info.cjs')
const processInfo = getProcessInfo()
require('../lib/cjs.cjs')
require('../lib/json-file.cjs')
const dir = t.testdir({ 'file.js': 'module.exports = "hello"' })
t.equal(require(dir + '/file.js'), 'hello')

t.same(processInfo.files, [
  require.resolve('../lib/json-file.cjs'),
  require.resolve(dir + '/file.js'),
])
