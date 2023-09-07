// disable all registration, otherwise it confuses c8's coverage here
process.env.__TAPJS_PROCESSINFO_TESTING_NO_REGISTER__ = String(process.pid)
// use a known exclude pattern
process.env._TAPJS_PROCESSINFO_EXCLUDE_ =
  '/.*[\\/\\\\]test-processinfo-exclude.js$/'

import { MessageChannel } from 'node:worker_threads'
import { getProcessInfo } from '../dist/mjs/get-process-info.js'
import {
  globalPreload,
  initialize,
  load,
  reset,
} from '../dist/mjs/hooks.mjs'

import { fileURLToPath } from 'node:url'
import t from 'tap'

t.afterEach(reset)

t.test('simulate --import', t => {
  t.plan(3)
  const { port1, port2 } = new MessageChannel()
  initialize({ port: port2 })
  port1.on('message', msg => {
    t.strictSame(msg, { filename: fileURLToPath(u), content: 'src' })
    port1.unref()
    port2.unref()
  })
  const ctx = {}
  const u = 'file:///test/initialize/url.js'
  load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: 'src' }
  })
})

t.test('simulate global preload', t => {
  t.plan(4)
  const { port1, port2 } = new MessageChannel()
  t.equal(typeof globalPreload({ port: port2 }), 'string')
  port1.on('message', msg => {
    t.strictSame(msg, { filename: fileURLToPath(u), content: 'src' })
    port1.unref()
    port2.unref()
  })
  const ctx = {}
  const u = 'file:///test/globalPreload/url.js'
  load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: 'src' }
  })
})

t.test('run on main thread, no port', async t => {
  const pi = getProcessInfo()
  const ctx = {}
  const u = 'file:///test/mainThread/url.js'
  await load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: 'src' }
  })
  t.strictSame(pi.files, [
    fileURLToPath(import.meta.url),
    '/test/mainThread/url.js',
  ])
})

t.test('excluded file, no recording', async t => {
  const pi = getProcessInfo()
  const ctx = {}
  const u = 'file:///test/exclude/test-processinfo-exclude.js'
  await load(u, ctx, async (url, c) => {
    t.equal(c, ctx, 'got context in nextLoad')
    t.equal(url, u)
    return { source: 'src' }
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
    return { source: 'src' }
  })
  t.strictSame(pi.files, [fileURLToPath(import.meta.url)])
})

t.test('no extension, treat as commonjs', async t => {
  const pi = getProcessInfo()
  const ctx = {}
  const u = 'file:///test/extensionless/file'
  t.equal(typeof globalPreload(), 'string', 'call gp without port')
  const res = await load(u, ctx, async () => {
    throw new Error('should not call nextLoad')
  })
  t.strictSame(res, { format: 'commonjs', shortCircuit: true })
  t.strictSame(pi.files, [
    fileURLToPath(import.meta.url),
    '/test/extensionless/file',
  ])
})
