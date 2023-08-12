import { findSourceMap } from 'module'
import t from 'tap'
import { findSourceMapSafe } from '../dist/cjs/find-source-map-safe.js'
t.strictSame(
  findSourceMapSafe(__filename)?.payload,
  findSourceMap(__filename)?.payload
)
