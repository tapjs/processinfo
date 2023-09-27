import { resolve } from 'path'
import t from 'tap'
import { urlToPath } from '../dist/commonjs/url-to-path.js'
import { pathToFileURL } from 'url'

const u = pathToFileURL(resolve('/x/y/z.js'))
u.searchParams.set('asdf', 'foo')

t.equal(
  resolve(urlToPath(String(u))),
  resolve('/x/y/z.js')
)
t.equal(
  resolve(urlToPath(u)),
  resolve('/x/y/z.js')
)
t.equal(resolve(urlToPath(resolve('/a/b/c'))), resolve('/a/b/c'))
