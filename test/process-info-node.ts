import t from 'tap'
import { ProcessInfoNodeData } from '../dist/cjs/get-process-info.js'
import { ProcessInfo } from '../dist/cjs/index.js'
import { ProcessInfoNode } from '../dist/cjs/process-info-node.js'

t.test('basic instance stuff', t => {
  type N = 'root' | 'parent' | 'child' | 'child2'
  // run it in every order
  const orders: N[][] = [
    ['root', 'parent', 'child', 'child2'],
    ['root', 'child', 'parent', 'child2'],
    ['parent', 'root', 'child', 'child2'],
    ['child', 'root', 'parent', 'child2'],
    ['parent', 'child', 'root', 'child2'],
    ['child', 'parent', 'root', 'child2'],

    ['child2', 'root', 'parent', 'child'],
    ['child2', 'root', 'child', 'parent'],
    ['child2', 'parent', 'root', 'child'],
    ['child2', 'child', 'root', 'parent'],
    ['child2', 'parent', 'child', 'root'],
    ['child2', 'child', 'parent', 'root'],

    ['root', 'child2', 'parent', 'child'],
    ['root', 'child2', 'child', 'parent'],
    ['parent', 'child2', 'root', 'child'],
    ['child', 'child2', 'root', 'parent'],
    ['parent', 'child2', 'child', 'root'],
    ['child', 'child2', 'parent', 'root'],

    ['root', 'parent', 'child2', 'child'],
    ['root', 'child', 'child2', 'parent'],
    ['parent', 'root', 'child2', 'child'],
    ['child', 'root', 'child2', 'parent'],
    ['parent', 'child', 'child2', 'root'],
    ['child', 'parent', 'child2', 'root'],
  ]

  for (const order of orders) {
    t.test('order=' + order.join(','), t => {
      const db = new ProcessInfo()
      const extra = {
        date: '2020-04-20T10:00:00.000Z',
        argv: ['a'],
        execArgv: ['e'],
        cwd: '/some/path',
        pid: 12345,
        ppid: 12346,
      }

      const root = new ProcessInfoNode({
        parent: null,
        uuid: 'root',
        root: 'root',
        files: ['root.txt', 'shared.txt'],
        sources: {},
        ...extra,
      })
      const parent = new ProcessInfoNode({
        parent: 'root',
        uuid: 'parent',
        root: 'root',
        files: ['parent.txt', 'shared.txt'],
        sources: {},
        ...extra,
      })
      const child = new ProcessInfoNode({
        parent: 'parent',
        root: 'root',
        uuid: 'child',
        files: ['child.txt', 'shared.txt'],
        sources: {},
        ...extra,
      })
      const child2 = new ProcessInfoNode({
        parent: 'parent',
        root: 'root',
        uuid: 'child2',
        files: ['child2.txt', 'parent.txt'],
        sources: {},
        externalID: 'child2-eid',
        ...extra,
      })

      const nodes = { root, parent, child, child2 }
      t.matchSnapshot(JSON.stringify(nodes), 'before linking')

      for (const o of order) {
        const node = nodes[o]
        t.equal(db.uuids.has(node.uuid), false)
        node.link(db)
        t.equal(db.uuids.get(node.uuid), node)
      }

      t.equal(child.parent, parent)
      t.equal(parent.parent, root)
      t.equal(child.root, root)
      t.equal(db.files.get('shared.txt')?.has(root), true)
      t.equal(db.files.get('shared.txt')?.has(parent), true)
      t.equal(db.files.get('shared.txt')?.has(child), true)
      t.equal(db.files.get('shared.txt')?.has(child2), false)
      t.equal(db.files.get('root.txt')?.has(root), true)
      t.equal(db.files.get('root.txt')?.has(parent), false)
      t.equal(db.files.get('root.txt')?.has(child), false)
      t.equal(db.files.get('root.txt')?.has(child2), false)
      t.equal(db.files.get('parent.txt')?.has(root), false)
      t.equal(db.files.get('parent.txt')?.has(parent), true)
      t.equal(db.files.get('parent.txt')?.has(child), false)
      t.equal(db.files.get('parent.txt')?.has(child2), true)
      t.equal(db.files.get('child.txt')?.has(root), false)
      t.equal(db.files.get('child.txt')?.has(parent), false)
      t.equal(db.files.get('child.txt')?.has(child), true)
      t.equal(db.files.get('child.txt')?.has(child2), false)
      t.equal(db.externalIDs.get('child2-eid'), child2)

      t.matchSnapshot(JSON.stringify(nodes), 'after linking')
      t.end()
    })
  }
  t.end()
})

t.test('newer externalID clobbers older one', t => {
  const db = new ProcessInfo()
  const one = new ProcessInfoNode({
    uuid: 'one',
    externalID: 'test',
    date: '2010-10-10T10:10:10.101Z',
  } as ProcessInfoNodeData)
  const two = new ProcessInfoNode({
    uuid: 'two',
    externalID: 'test',
    date: '2022-02-02T22:22:22.222Z',
  } as ProcessInfoNodeData)
  const tre = new ProcessInfoNode({
    uuid: 'tre',
    externalID: 'test',
    date: '2023-03-03T03:33:33.333Z',
  } as ProcessInfoNodeData)

  two.link(db)
  t.equal(db.externalIDs.get('test'), two)

  // newer one clobbers it
  tre.link(db)
  t.equal(db.externalIDs.get('test'), tre)

  // older one does not
  one.link(db)
  t.equal(db.externalIDs.get('test'), tre)

  t.end()
})
