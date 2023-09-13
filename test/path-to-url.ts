import { resolve } from 'path'
import t from 'tap'
import { pathToFileURL } from 'url'
import { pathToURL } from '../dist/cjs/path-to-url.js'

t.equal(
  pathToURL('file:///x/y/z.js?asfd=foo'),
  'file:///x/y/z.js?asfd=foo'
)
t.equal(
  pathToURL(new URL('file:///x/y/z.js?asfd=foo')),
  'file:///x/y/z.js?asfd=foo'
)

t.equal(
  pathToURL(resolve('/a/b/c')),
  String(pathToFileURL(resolve('/a/b/c')))
)
