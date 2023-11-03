import { resolve, win32 } from 'path'
import t from 'tap'
import { pathToFileURL } from 'url'
import { canonicalSource } from '../dist/commonjs/canonical-source.js'

t.test('canonicalize source urls and paths', t => {
  const sources = ['file://' + resolve('x'), resolve('x'), 'x']
  const expect = String(pathToFileURL(resolve('x')))
  for (const s of sources) {
    t.equal(canonicalSource(s), expect)
  }
  t.end()
})

t.test('canonical path win32', t => {
  const { canonicalPath } = t.mock(
    '../dist/commonjs/canonical-source.js',
    {
      path: win32,
    }
  )
  const sources: [string, string][] = [
    ['c:/a/b/c', 'C:\\a\\b\\c'],
    ['c:\\a\\b\\c', 'C:\\a\\b\\c'],
    ['\\\\hOSt\\Share\\some\\path', '\\\\HOST\\SHARE\\some\\path'],
    ['//?/C:/a/b/c/x.ts', '\\\\?\\C:\\a\\b\\c\\x.ts'],
  ]
  for (const [s, expect] of sources) {
    t.equal(canonicalPath(s), expect)
  }

  t.end()
})
