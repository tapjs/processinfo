import t from 'tap'

import {
  getSources,
  likelyHasSourceMap,
  lookupSources,
} from '../dist/commonjs/lookup-sources.js'

t.test('loading modules and sources', async t => {
  const missingSM = require.resolve('./fixtures/missing-sm.min.mjs')
  const hasSM = require.resolve('./fixtures/y.min.mjs')
  const noSM = require.resolve('./fixtures/y.mjs')

  // none of these will find a source map, because they're not loaded yet
  likelyHasSourceMap(missingSM)
  likelyHasSourceMap(hasSM)
  likelyHasSourceMap(noSM)
  likelyHasSourceMap(missingSM)

  await import(missingSM)
  await import(hasSM)
  await import(noSM)

  const expect = getSources()
  const smMap = new Map(
    [missingSM, hasSM, noSM].map(m => [m, lookupSources(m)]),
  )
  // do the final lookup attempt, for coverage
  const smMapProcessEnd = new Map(
    [missingSM, hasSM, noSM].map(m => [m, lookupSources(m, true)]),
  )
  t.match(smMap, expect)
  t.match(smMapProcessEnd, expect)
})
