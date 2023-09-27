import t from 'tap'

import {
  defaultExclude,
  getExclude,
} from '../dist/commonjs/get-exclude.js'

const k = '_TESTING_TAPJS_PROCESSINFO_EXCLUDE_'
const ex = process.env[k]
t.teardown(() => {
  if (ex === undefined) delete process.env[k]
  else process.env[k] = ex
})

t.test('missing', async t => {
  delete process.env[k]
  t.same(getExclude(k), defaultExclude)
  t.equal(process.env[k], defaultExclude.toString())
  t.end()
})

t.test('empty', async t => {
  process.env[k] = ''
  t.same(getExclude(k), defaultExclude)
  t.equal(process.env[k], defaultExclude.toString())
  t.end()
})

t.test('empty, no default', async t => {
  process.env[k] = ''
  t.same(getExclude(k, false), /$./)
  t.equal(process.env[k], /$./.toString())
  t.end()
})

t.test('not a regexp', async t => {
  process.env[k] = 'blerg'
  t.same(getExclude(k), defaultExclude)
  t.equal(process.env[k], defaultExclude.toString())
  t.end()
})

t.test('invalid regexp', async t => {
  process.env[k] = '/hello (world/g'
  t.same(getExclude(k), defaultExclude)
  t.equal(process.env[k], defaultExclude.toString())
  t.end()
})

t.test('valid regexp', async t => {
  process.env[k] = '/blerg/'
  t.same(getExclude(k), /blerg/)
  t.equal(process.env[k], '/blerg/')
  t.end()
})

t.test('regexp with flags', async t => {
  process.env[k] = '/blerg/i'
  t.same(getExclude(k), /blerg/i)
  t.equal(process.env[k], '/blerg/i')
  t.end()
})
