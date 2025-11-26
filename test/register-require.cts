import t from 'tap'
import { getProcessInfo } from '../dist/commonjs/get-process-info.js'
import { register } from '../dist/commonjs/register-require.js'
process.env._TAPJS_PROCESSINFO_EXCLUDE_ = '/node_modules/'
// this one does not showup, because not registered yet
require('../dist/commonjs/node-options-env.js')
register()
require('../dist/commonjs/json-file.js')
const dir = t.testdir({ 'file.js': 'module.exports = "hello"' })
t.equal(require(dir + '/file.js'), 'hello')

t.same(getProcessInfo().files, [
  __filename,
  require.resolve('../dist/commonjs/json-file.js'),
  require.resolve(dir + '/file.js'),
])
