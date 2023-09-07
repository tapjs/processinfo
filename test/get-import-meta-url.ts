import t from 'tap'

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getImportMetaURL } from '../src/get-import-meta-url'
t.equal(
  fileURLToPath(getImportMetaURL('x')).toLowerCase(),
  resolve('x').toLowerCase()
)
