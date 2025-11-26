import { findSourceMap } from 'module'
import t from 'tap'
import { findSourceMapSafe } from '../dist/commonjs/find-source-map-safe.js'
const sm = findSourceMapSafe(__filename)
t.ok(sm)
t.strictSame(sm && sm?.payload, findSourceMap(__filename)?.payload)
// run a second time to exercise cache path
t.equal(sm, findSourceMapSafe(__filename))

const [v] = process.versions.node
  .split('.', 1)
  .map(n => parseInt(n, 10)) as [number]

t.test(
  'throwing source map lookup returns false',
  { skip: v !== 19 ? 'only throws on node 19' : false },
  async t => {
    await import('./fixtures/missing-sm.min.mjs')
    t.throws(() =>
      findSourceMap(require.resolve('./fixtures/missing-sm.min.mjs')),
    )
    const missing = findSourceMapSafe(
      require.resolve('./fixtures/missing-sm.min.mjs'),
    )
    t.equal(missing, false)
  },
)
