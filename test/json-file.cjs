const t = require('tap')
const {safeJSON, safeJSONSync} = require('../lib/json-file.cjs')

const dir = t.testdir({
  'j.json': JSON.stringify({"foo":1}),
  notjson: 'just a file, not json at all',
})

t.test('sync', t => {
  t.strictSame(safeJSONSync(dir+'/j.json'), { foo: 1 })
  t.strictSame(safeJSONSync(dir+'/notjson'), {})
  t.strictSame(safeJSONSync(dir+'/notfound'), {})
  t.end()
})

t.test('async', async t => {
  t.strictSame(await safeJSON(dir+'/j.json'), { foo: 1 })
  t.strictSame(await safeJSON(dir+'/notjson'), {})
  t.strictSame(await safeJSON(dir+'/notfound'), {})
  t.end()
})
