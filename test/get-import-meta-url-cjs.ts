import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import t from 'tap'
import { getImportMetaURL } from '../src/get-import-meta-url-cjs'

t.equal(
  fileURLToPath(getImportMetaURL('x')).toLowerCase(),
  resolve(__dirname, '../src/x').toLowerCase()
)
