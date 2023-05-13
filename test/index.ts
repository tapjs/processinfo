import { readdir } from 'fs/promises'
import { resolve } from 'path'
import t from 'tap'
import * as cp from '../dist/cjs/child_process.js'
import { ProcessInfo } from '../dist/cjs/index.js'
import { ProcessInfoNode } from '../dist/cjs/process-info-node.js'
import { removePath } from './fixtures/remove-path'
const fixtures = resolve(__dirname, 'fixtures')

t.formatSnapshot = o =>
  removePath(
    removePath(o, process.cwd(), '{CWD}'),
    '/Users/isaacs/dev/tapjs/processinfo',
    '{CWD}'
  )

t.test('basic instantiation and usage', async t => {
  t.equal(
    ProcessInfo,
    ProcessInfo.ProcessInfo,
    'exported as default and named'
  )
  t.equal(ProcessInfo.Node, ProcessInfoNode, 'Node class exported')
  {
    const pi = new ProcessInfo()
    t.matchSnapshot(pi, 'defaults')
  }
  const pi = await ProcessInfo.load({
    dir: resolve(fixtures, 'processinfo'),
  })
  // verify that all roots are roots
  for (const r of pi.roots) {
    t.equal(r.root, r)
  }
  t.equal(pi.roots.size, 62)
  t.equal(pi.uuids.size, 64)
  for (const [uuid, node] of pi.uuids) {
    t.ok(
      node.root && pi.roots.has(node.root),
      'root found in roots for uuid ' + uuid
    )
  }
  t.notOk(
    pi.uuids.has('not-a-processinfo-file-just-some-json'),
    'does not load non-pi jsons'
  )
  t.notOk(
    pi.uuids.has('not-a-processinfo-file-not-even-json'),
    'does not load non-json files'
  )
  const r = pi.uuids.get('eb967f55-a436-4542-aba2-efd8cb82b471')
  t.matchSnapshot(
    {
      ...r,
      children: new Set(
        [...(r?.children || [])].sort((a, b) =>
          a.uuid.localeCompare(b.uuid, 'en')
        )
      ),
    },
    'root node'
  )

  const piSync = ProcessInfo.loadSync({
    dir: resolve(fixtures, 'processinfo'),
  })
  t.match(piSync, pi, 'sync load has same data')

  await pi.load()
  t.match(piSync, pi, 'loading second time has no effect')
  piSync.loadSync()
  t.match(piSync, pi, 'loading second time has no effect (sync)')

  pi.clear()
  t.matchSnapshot(pi, 'cleared')
  await pi.load()

  const dir = t.testdir({ sync: {}, async: {} })
  piSync.dir = `${dir}/sync`
  pi.dir = `${dir}/async`
  piSync.saveSync()
  await pi.save()
  const pi2 = new ProcessInfo({ dir: pi.dir })
  await pi2.load()
  const piSync2 = new ProcessInfo({ dir: piSync.dir })
  piSync2.loadSync()
  t.match(pi2, pi)
  t.match(piSync2, piSync)
  await pi.erase()
  piSync.eraseSync()
  await t.rejects(readdir(pi.dir))

  const piEmpty = new ProcessInfo({
    dir: resolve(fixtures, 'asdfasdfasdfas'),
  })
  await piEmpty.load()
  t.matchSnapshot(piEmpty, 'missing dir is just empty')
  const piEmptySync = new ProcessInfo({
    dir: resolve(fixtures, 'asdfasdfasdfas'),
  })
  piEmptySync.loadSync()
  t.matchSnapshot(piEmptySync, 'missing dir is just empty (sync)')
})

t.test('re-export spawn methods', t => {
  for (const [name, method] of Object.entries(cp)) {
    t.equal(ProcessInfo[name as keyof typeof ProcessInfo], method)
  }
  t.end()
})
