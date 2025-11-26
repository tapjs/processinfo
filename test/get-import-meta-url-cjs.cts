import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import t from 'tap'
import { getImportMetaURL } from '../dist/commonjs/get-import-meta-url.js'

t.equal(
  fileURLToPath(getImportMetaURL('x')).toLowerCase(),
  resolve(__dirname, '../dist/commonjs/x').toLowerCase(),
)
