// disable all registration, otherwise it confuses c8's coverage here
process.env.__TAPJS_PROCESSINFO_TESTING_NO_REGISTER__ = String(process.pid)
// use a known exclude pattern
process.env._TAPJS_PROCESSINFO_EXCLUDE_ =
  '/.*[\\/\\\\]test-processinfo-exclude\\.js$/'

import { MessageChannel } from 'node:worker_threads'
import { getProcessInfo } from '../dist/esm/get-process-info.js'
const { globalPreload, initialize, load, reset } = await import(
  '../dist/esm/hooks.mjs'
)

import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import t from 'tap'

t.afterEach(reset)

const mockContent = `//transpiled
src
//# sourceMappingURL=not.actual.source.map
`

t.test('simulate --import', t => {
  t.plan(3)
  const { port1, port2 } = new MessageChannel()
  initialize({ port: port2 })
  port1.on('message', msg => {
    t.strictSame(msg, {
      url: u,
      filename: fileURLToPath(u),
      content: mockContent,
    })
    port1.unref()
    port2.unref()
  })
  const ctx = {}
  const u = String(pathToFileURL(resolve('/test/initialize/url.js')))
  load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return {
      source: mockContent,
    }
  })
})

t.test('simulate global preload', t => {
  t.plan(4)
  const { port1, port2 } = new MessageChannel()
  t.equal(typeof globalPreload({ port: port2 }), 'string')
  port1.on('message', msg => {
    t.strictSame(msg, {
      url: u,
      filename: fileURLToPath(u),
      content: mockContent,
    })
    port1.unref()
    port2.unref()
  })
  const ctx = {}
  const u = String(pathToFileURL(resolve('/test/globalPreload/url.js')))
  load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: mockContent }
  })
})

t.test('run on main thread, no port', async t => {
  const pi = getProcessInfo()
  const ctx = {}
  const u = String(pathToFileURL(resolve('/test/mainThread/url.js')))
  await load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: mockContent }
  })
  t.strictSame(pi.files, [
    fileURLToPath(import.meta.url),
    resolve('/test/mainThread/url.js'),
  ])
})

t.test('excluded file, no recording', async t => {
  const pi = getProcessInfo()
  const ctx = {}
  const u = String(
    pathToFileURL(resolve('/test/exclude/test-processinfo-exclude.js')),
  )
  await load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: mockContent }
  })
  t.strictSame(pi.files, [fileURLToPath(import.meta.url)])
})

t.test('fake main script, no recording', async t => {
  const pi = getProcessInfo()
  const ctx = {}
  const u = '<repl>'
  await load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: mockContent }
  })
  t.strictSame(pi.files, [fileURLToPath(import.meta.url)])
})

t.test('no extension, treat as commonjs', async t => {
  const pi = getProcessInfo()
  const ctx = {}
  const u = String(pathToFileURL(resolve('/test/extensionless/file')))
  t.equal(typeof globalPreload(), 'string', 'call gp without port')
  // must delegate to nextLoad with a commonjs format hint, so node's
  // default step supplies a valid `source` (strict sync hook validation
  // on node >= 24.13 rejects a short-circuit with no source).
  const res = await load(u, ctx, async (url, c) => {
    t.equal(url, u)
    t.equal(c.format, 'commonjs', 'forces commonjs format')
    return { source: mockContent, format: 'commonjs' }
  })
  t.strictSame(res, { source: mockContent, format: 'commonjs' })
  t.strictSame(pi.files, [
    fileURLToPath(import.meta.url),
    resolve('/test/extensionless/file'),
  ])
})
