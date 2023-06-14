import t from 'tap'
process.env._TAPJS_PROCESSINFO_EXCLUDE_ = '/node_modules/'
import { getProcessInfo } from '../dist/cjs/get-process-info.js'
import { register } from '../dist/cjs/register-cjs.js'
// this one does not showup, because not registered yet
require('../dist/cjs/argv-to-node-options.js')
register()
require('../dist/cjs/json-file.js')
const dir = t.testdir({ 'file.js': 'module.exports = "hello"' })
t.equal(require(dir + '/file.js'), 'hello')

t.same(getProcessInfo().files, [
  __filename,
  require.resolve('../dist/cjs/json-file.js'),
  require.resolve(dir + '/file.js'),
])
