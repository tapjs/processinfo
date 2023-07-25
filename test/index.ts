import { unlinkSync, utimesSync, writeFileSync } from 'fs'
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

t.test('externalIDsChanged', async t => {
  t.test('basic change test', async t => {
    const dir = t.testdirName
    const today = new Date()
    const MONTH = 30 * 24 * 60 * 60 * 1000
    const yesterday = new Date(today.getTime() - MONTH)
    const tomorrow = new Date(today.getTime() + MONTH)
    const future = new Date(tomorrow.getTime() + MONTH)

    const zro = {
      date: tomorrow,
      uuid: 'uuid-0',
      root: 'uuid-0',
      externalID: 'blah',
      parent: null,
      files: [resolve(dir, 'direct'), resolve(dir, 'generated')],
      sources: {
        [resolve(dir, 'generated')]: [resolve(dir, 'source')],
      },
    }

    const one = {
      date: tomorrow,
      uuid: 'uuid-1',
      root: 'uuid-0',
      parent: 'uuid-0',
      files: [
        resolve(dir, 'child'),
        resolve(dir, 'childgenerated'),
        resolve(dir, 'generated'),
      ],
      sources: {
        [resolve(dir, 'generated')]: [resolve(dir, 'source')],
        [resolve(dir, 'childgenerated')]: [resolve(dir, 'childsource')],
      },
    }

    const two = {
      date: tomorrow,
      uuid: 'uuid-2',
      parent: 'uuid-1',
      root: 'uuid-0',
      files: [
        resolve(dir, 'direct'),
        resolve(dir, 'gcdirect'),
        resolve(dir, 'gcgenerated'),
      ],
      sources: {
        [resolve(dir, 'gcgenerated')]: [resolve(dir, 'gcsource')],
      },
    }

    t.testdir({
      generated: '',
      source: '',
      child: '',
      childgenerated: '',
      childsource: '',
      direct: '',
      gcdirect: '',
      gcgenerated: '',
      gcsource: '',
      '.tap': {
        processinfo: {
          'uuid-0.json': JSON.stringify(zro),
          'uuid-1.json': JSON.stringify(one),
          'uuid-2': JSON.stringify(two),
        },
      },
    })

    // all files are older, because date is in the future
    const pi = ProcessInfo.loadSync({ dir: dir + '/.tap/processinfo' })
    t.test('everything older', async t => {
      const c = await pi.externalIDsChanged()
      t.equal(c.size, 0)
    })

    t.test('touched', async t => {
      utimesSync(resolve(dir, 'gcdirect'), future, future)
      const c = await pi.externalIDsChanged()
      t.equal(c.size, 1)
      t.strictSame([...c.keys()], ['blah'])
    })

    t.test('delete one of the files', async t => {
      unlinkSync(resolve(dir, 'gcdirect'))
      const c = await pi.externalIDsChanged()
      t.equal(c.size, 1)
      t.strictSame([...c.keys()], ['blah'])
    })

    t.test(
      'touch a generated file, but source is still older',
      async t => {
        writeFileSync(resolve(dir, 'gcdirect'), 'x')
        utimesSync(resolve(dir, 'gcdirect'), yesterday, yesterday)
        utimesSync(resolve(dir, 'childgenerated'), future, future)
        const c = await pi.externalIDsChanged()
        t.equal(c.size, 0)
      }
    )

    t.test('source change without gen change = no change', async t => {
      utimesSync(resolve(dir, 'gcsource'), future, future)
      const c = await pi.externalIDsChanged()
      t.equal(c.size, 0)
    })

    t.test('source file AND gen file = change', async t => {
      utimesSync(resolve(dir, 'childsource'), future, future)
      const c = await pi.externalIDsChanged()
      t.equal(c.size, 1)
      t.strictSame([...c.keys()], ['blah'])
    })

    t.test('missing source file is a change if gen changed', async t => {
      unlinkSync(resolve(dir, 'childsource'))
      const c = await pi.externalIDsChanged()
      t.equal(c.size, 1)
      t.strictSame([...c.keys()], ['blah'])
    })

    t.test('exclude with a filter', async t => {
      const c = await pi.externalIDsChanged(() => false)
      t.equal(c.size, 0)
    })
  })
})
