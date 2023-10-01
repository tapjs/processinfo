import t from 'tap'
import { pathToFileURL } from 'url'

import {
  getSources,
  likelyHasSourceMap,
  lookupSources,
} from '../dist/commonjs/lookup-sources.js'

t.test('loading modules and sources', async t => {
  const missingSM = String(
    pathToFileURL(require.resolve('./fixtures/missing-sm.min.mjs'))
  )
  const hasSM = String(
    pathToFileURL(require.resolve('./fixtures/y.min.mjs'))
  )
  const noSM = String(pathToFileURL(require.resolve('./fixtures/y.mjs')))

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
    [missingSM, hasSM, noSM].map(m => [m, lookupSources(m)])
  )
  t.match(smMap, expect)
})
