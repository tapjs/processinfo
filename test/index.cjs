const t = require('tap')
const ProcessInfo = require('../lib/index.cjs')
const cp = require('../lib/child_process.cjs')
const { ProcessInfoNode } = require('../lib/process-info-node.cjs')
const { resolve } = require('path')
const fixtures = resolve(__dirname, 'fixtures')
const { readdir } = require('fs/promises')

const removePath = (o, path, replace, seen = new Map()) => {
  if (seen.has(o)) {
    return seen.get(o)
  }
  if (typeof o === 'string') {
    return o.split(path).join(replace)
  } else if (!o || typeof o !== 'object') {
    return o
  } else if (Array.isArray(o)) {
    const clean = new Array(o.length)
    seen.set(o, clean)
    for (let i = 0; i < o.length; i++) {
      clean[i] = removePath(o[i], path, replace, seen)
    }
    return clean
  } else if (o instanceof Map) {
    const clean = new Map()
    seen.set(o, clean)
    for (const [k, v] of o.entries()) {
      clean.set(
        removePath(k, path, replace, seen),
        removePath(v, path, replace, seen)
      )
    }
    return clean
  } else if (o instanceof Set) {
    const clean = new Set()
    seen.set(o, clean)
    for (const v of o) {
      clean.add(removePath(v, path, replace, seen))
    }
    return clean
  } else {
    const clean = Object.create({ prototype: o.prototype })
    seen.set(o, clean)
    for (const [k, v] of Object.entries(o)) {
      clean[k] = removePath(v, path, replace, seen)
    }
    return clean
  }
}
t.formatSnapshot = o => removePath(removePath(o, process.cwd(), '{CWD}'), '/Users/isaacs/dev/tapjs/processinfo', '{CWD}')

t.test('basic instantiation and usage', async t => {
  t.equal(ProcessInfo, ProcessInfo.ProcessInfo, 'exported as default and named')
  t.equal(ProcessInfo.Node, ProcessInfoNode, 'Node class exported')
  {
    const pi = new ProcessInfo()
    t.matchSnapshot(pi, 'defaults')
  }
  const pi = new ProcessInfo({ dir: resolve(fixtures, 'processinfo') })
  await pi.load()
  // verify that all roots are roots
  for (const r of pi.roots) {
    t.equal(r.root, r)
  }
  t.equal(pi.roots.size, 62)
  t.equal(pi.uuids.size, 64)
  for (const [uuid, node] of pi.uuids) {
    t.ok(pi.roots.has(node.root), 'root found in roots for uuid ' + uuid)
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
        [...r.children].sort((a, b) => a.uuid.localeCompare(b.uuid, 'en'))
      ),
    },
    'root node'
  )

  const piSync = new ProcessInfo({ dir: resolve(fixtures, 'processinfo') })
  piSync.loadSync()
  t.matchSnapshot(piSync, pi, 'sync load has same data')

  await pi.load()
  t.matchSnapshot(piSync, pi, 'loading second time has no effect')
  piSync.loadSync()
  t.matchSnapshot(piSync, pi, 'loading second time has no effect (sync)')

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

  const piEmpty = new ProcessInfo({ dir: resolve(fixtures, 'asdfasdfasdfas') })
  await piEmpty.load()
  t.matchSnapshot(piEmpty, pi, 'missing dir is just empty')
  const piEmptySync = new ProcessInfo({
    dir: resolve(fixtures, 'asdfasdfasdfas'),
  })
  piEmptySync.loadSync()
  t.matchSnapshot(piEmptySync, pi, 'missing dir is just empty (sync)')
})

t.test('re-export spawn methods', t => {
  for (const [name, method] of Object.entries(cp)) {
    t.equal(ProcessInfo[name], method)
  }
  t.end()
})
