import { findSourceMap } from 'module'
import t from 'tap'
import { findSourceMapSafe } from '../dist/commonjs/find-source-map-safe.js'
const sm = findSourceMapSafe(__filename)
t.ok(sm)
t.strictSame(sm && sm?.payload, findSourceMap(__filename)?.payload)
// run a second time to exercise cache path
t.equal(sm, findSourceMapSafe(__filename))

t.test('throwing source map lookup returns false', async t => {
  await import('./fixtures/missing-sm.min.mjs')
  t.throws(() => findSourceMap(
    require.resolve('./fixtures/missing-sm.min.mjs')
  ))
  const missing = findSourceMapSafe(
    require.resolve('./fixtures/missing-sm.min.mjs')
  )
  t.equal(missing, false)
})
