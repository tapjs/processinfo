import { findSourceMap } from 'module'
import t from 'tap'
import { findSourceMapSafe } from '../dist/commonjs/find-source-map-safe.js'
t.strictSame(
  findSourceMapSafe(__filename)?.payload,
  findSourceMap(__filename)?.payload
)
