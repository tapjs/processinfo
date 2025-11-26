import { resolve } from 'path'
import t from 'tap'
import { pathToFileURL } from 'url'
import {
  importLoader,
  importMatch,
  legacyLoader,
  legacyMatch,
} from '../dist/commonjs/loader-paths'

t.equal(legacyMatch('@tapjs/processinfo/loader'), true)
t.equal(
  legacyMatch(resolve(__dirname, '../dist/esm/loader-legacy.mjs')),
  true,
)
t.equal(
  legacyMatch(
    String(
      pathToFileURL(resolve(__dirname, '../dist/esm/loader-legacy.mjs')),
    ),
  ),
  true,
)
t.equal(
  legacyLoader,
  String(
    pathToFileURL(resolve(__dirname, '../dist/esm/loader-legacy.mjs')),
  ),
)

t.equal(importMatch('@tapjs/processinfo/import'), true)
t.equal(importMatch(resolve(__dirname, '../dist/esm/import.mjs')), true)
t.equal(
  importMatch(
    String(pathToFileURL(resolve(__dirname, '../dist/esm/import.mjs'))),
  ),
  true,
)
t.equal(
  importLoader,
  String(pathToFileURL(resolve(__dirname, '../dist/esm/import.mjs'))),
)
