import t from 'tap'

import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import('../dist/esm/get-import-meta-url.js').then(({ getImportMetaURL }) =>
  t.equal(
    fileURLToPath(getImportMetaURL('x')).toLowerCase(),
    resolve(__dirname, '../dist/esm/x').toLowerCase()
  )
)
