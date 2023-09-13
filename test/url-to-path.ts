import { resolve } from 'path'
import t from 'tap'
import { urlToPath } from '../dist/cjs/url-to-path.js'

t.equal(
  resolve(urlToPath('file:///x/y/z.js?asfd=foo')),
  resolve('/x/y/z.js')
)
t.equal(
  resolve(urlToPath(new URL('file:///x/y/z.js?asfd=foo'))),
  resolve('/x/y/z.js')
)
t.equal(resolve(urlToPath(resolve('/a/b/c'))), resolve('/a/b/c'))
