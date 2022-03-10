const t = require('tap')

const {getExclude} = require('../lib/get-exclude.cjs')

const ex = process.env._TAPJS_PROCESSINFO_EXCLUDE_
t.teardown(() => {
  if (ex === undefined)
    delete process.env._TAPJS_PROCESSINFO_EXCLUDE_
  else
    process.env._TAPJS_PROCESSINFO_EXCLUDE_ = ex
})

t.test('missing', async t => {
  delete process.env._TAPJS_PROCESSINFO_EXCLUDE_
  t.same(getExclude(), /(^|[\\/])node_modules[\\/]/)
  t.equal(process.env._TAPJS_PROCESSINFO_EXCLUDE_, '/(^|[\\\\/])node_modules[\\\\/]/')
  t.end()
})

t.test('empty', async t => {
  process.env._TAPJS_PROCESSINFO_EXCLUDE_ = ''
  t.same(getExclude(), /(^|[\\/])node_modules[\\/]/)
  t.equal(process.env._TAPJS_PROCESSINFO_EXCLUDE_, '/(^|[\\\\/])node_modules[\\\\/]/')
  t.end()
})

t.test('invalid regexp', async t => {
  process.env._TAPJS_PROCESSINFO_EXCLUDE_ = 'blerg'
  t.same(getExclude(), /(^|[\\/])node_modules[\\/]/)
  t.equal(process.env._TAPJS_PROCESSINFO_EXCLUDE_, '/(^|[\\\\/])node_modules[\\\\/]/')
  t.end()
})

t.test('valid regexp', async t => {
  process.env._TAPJS_PROCESSINFO_EXCLUDE_ = '/blerg/'
  t.same(getExclude(), /blerg/)
  t.equal(process.env._TAPJS_PROCESSINFO_EXCLUDE_, '/blerg/')
  t.end()
})

t.test('regexp with flags', async t => {
  process.env._TAPJS_PROCESSINFO_EXCLUDE_ = '/blerg/i'
  t.same(getExclude(), /blerg/i)
  t.equal(process.env._TAPJS_PROCESSINFO_EXCLUDE_, '/blerg/i')
  t.end()
})
