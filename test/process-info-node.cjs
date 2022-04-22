const t = require('tap')
const {ProcessInfoNode} = require('../lib/process-info-node.cjs')
const {ProcessInfo} = require('../lib/index.cjs')

t.test('basic instance stuff', t => {
  // run it in every order
  const orders = [
    ['root',   'parent', 'child',  'child2'],
    ['root',   'child',  'parent', 'child2'],
    ['parent', 'root',   'child',  'child2'],
    ['child',  'root',   'parent', 'child2'],
    ['parent', 'child',  'root',   'child2'],
    ['child',  'parent', 'root',   'child2'],

    ['child2', 'root',   'parent', 'child' ],
    ['child2', 'root',   'child',  'parent'],
    ['child2', 'parent', 'root',   'child' ],
    ['child2', 'child',  'root',   'parent'],
    ['child2', 'parent', 'child',  'root'  ],
    ['child2', 'child',  'parent', 'root'  ],

    ['root',   'child2', 'parent', 'child' ],
    ['root',   'child2', 'child',  'parent'],
    ['parent', 'child2', 'root',   'child' ],
    ['child',  'child2', 'root',   'parent'],
    ['parent', 'child2', 'child',  'root'  ],
    ['child',  'child2', 'parent', 'root'  ],

    ['root',   'parent', 'child2', 'child' ],
    ['root',   'child',  'child2', 'parent'],
    ['parent', 'root',   'child2', 'child' ],
    ['child',  'root',   'child2', 'parent'],
    ['parent', 'child',  'child2', 'root'  ],
    ['child',  'parent', 'child2', 'root'  ],
  ]

  for (const order of orders) {
    t.test('order=' + order.join(','), t => {
      const db = new ProcessInfo()

      const root = new ProcessInfoNode({
        parent: null,
        uuid: 'root',
        root: 'root',
        files: ['root.txt', 'shared.txt'],
      })
      const parent = new ProcessInfoNode({
        parent: 'root',
        uuid: 'parent',
        root: 'root',
        files: ['parent.txt', 'shared.txt'],
      })
      const child = new ProcessInfoNode({
        parent: 'parent',
        root: 'root',
        uuid: 'child',
        files: ['child.txt', 'shared.txt'],
      })
      const child2 = new ProcessInfoNode({
        parent: 'parent',
        root: 'root',
        uuid: 'child2',
        files: ['child2.txt', 'parent.txt'],
        externalID: 'child2-eid',
      })

      const nodes = { root, parent, child, child2 }
      t.matchSnapshot(JSON.stringify(nodes), 'before linking')

      for (const o of order) {
        const node = nodes[o]
        t.equal(db.uuids.has(node.uuid), false)
        db.uuids.set(node.uuid, node)
        t.equal(db.uuids.get(node.uuid), node)
        node.link(db)
      }

      t.equal(child.parent, parent)
      t.equal(parent.parent, root)
      t.equal(child.root, root)
      t.equal(db.files.get('shared.txt').has(root), true)
      t.equal(db.files.get('shared.txt').has(parent), true)
      t.equal(db.files.get('shared.txt').has(child), true)
      t.equal(db.files.get('shared.txt').has(child2), false)
      t.equal(db.files.get('root.txt').has(root), true)
      t.equal(db.files.get('root.txt').has(parent), false)
      t.equal(db.files.get('root.txt').has(child), false)
      t.equal(db.files.get('root.txt').has(child2), false)
      t.equal(db.files.get('parent.txt').has(root), false)
      t.equal(db.files.get('parent.txt').has(parent), true)
      t.equal(db.files.get('parent.txt').has(child), false)
      t.equal(db.files.get('parent.txt').has(child2), true)
      t.equal(db.files.get('child.txt').has(root), false)
      t.equal(db.files.get('child.txt').has(parent), false)
      t.equal(db.files.get('child.txt').has(child), true)
      t.equal(db.files.get('child.txt').has(child2), false)
      t.equal(db.externalIDs.get('child2-eid'), child2)

      t.matchSnapshot(JSON.stringify(nodes), 'after linking')
      t.end()
    })
  }
  t.end()
})
