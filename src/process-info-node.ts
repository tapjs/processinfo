import type { ProcessInfo } from './index.js'

export interface ProcessInfoNodeData {
  // set initially, but deleted before it is written
  hrstart?: [number, number]

  // always set
  date: string
  argv: string[]
  execArgv: string[]
  NODE_OPTIONS?: string
  cwd: string
  pid: number
  ppid: number
  parent: string | null
  uuid: string
  files: string[]
  sources: Record<string, string[]>

  // fields that are only set when the process completes
  root?: string | null
  externalID?: string | null
  code?: number | null
  signal?: NodeJS.Signals | null
  runtime?: number
  globalsAdded?: string[]
}

export class ProcessInfoNode {
  date!: string
  argv!: string[]
  execArgv!: string[]
  NODE_OPTIONS?: string
  cwd!: string
  pid!: number
  ppid!: number
  uuid!: string
  code?: number | null
  signal?: NodeJS.Signals | null
  runtime?: number
  globalsAdded?: string[]
  files: string[] = []
  sources: Record<string, string[]> = Object.create(null)
  parent?: ProcessInfoNode | null = null
  root?: ProcessInfoNode | null = null
  children?: Set<ProcessInfoNode> | null = null
  descendants: Set<ProcessInfoNode> | null = null
  externalID: string | null = null

  #data: ProcessInfoNodeData

  constructor(data: ProcessInfoNodeData) {
    this.#data = data
    Object.assign(this, data)
  }

  toJSON() {
    return Object.fromEntries(
      Object.entries(this)
        .filter(([_, val]) => val !== null && val !== undefined)
        .map(([key, val]) =>
          val instanceof ProcessInfoNode ? [key, val.uuid]
          : key === 'children' || key === 'descendants' ?
            [key, [...val].map(c => c.uuid)]
          : [key, val],
        ),
    )
  }

  link(db: ProcessInfo) {
    db.uuids.set(this.uuid, this)
    if (this.#data.parent) {
      this.parent = db.uuids.get(this.#data.parent) || this.parent
    }
    if (this.#data.root) {
      this.root = db.uuids.get(this.#data.root) ?? this.root
    }

    if (this.parent === null) {
      this.root = this
      const pendingRoot = db.pendingRoot.get(this.uuid)
      if (pendingRoot) {
        this.descendants = pendingRoot
        for (const n of pendingRoot) {
          n.root = this
        }
        db.pendingRoot.delete(this.uuid)
      }
      db.roots.add(this)
    } else if (typeof this.root === 'string') {
      const pendingRoot = db.pendingRoot.get(this.root)
      if (pendingRoot) {
        pendingRoot.add(this)
      } else {
        db.pendingRoot.set(this.root, new Set([this]))
      }
    } else if (this.root) {
      this.root.descendants ??= new Set()
      this.root.descendants.add(this)
    }

    if (typeof this.parent === 'string') {
      const pendingParent = db.pendingParent.get(this.parent)
      if (pendingParent) {
        pendingParent.add(this)
      } else {
        db.pendingParent.set(this.parent, new Set([this]))
      }
    } else if (this.parent) {
      if (!this.parent.children) {
        this.parent.children = new Set([this])
      } else {
        this.parent.children.add(this)
      }
    }

    const pendingParent = db.pendingParent.get(this.uuid)
    if (pendingParent) {
      this.children = pendingParent
      for (const n of this.children) {
        n.parent = this
      }
      db.pendingParent.delete(this.uuid)
    }

    for (const f of this.files as string[]) {
      const files = db.files.get(f)
      if (!files) {
        db.files.set(f, new Set<ProcessInfoNode>([this]))
      } else {
        files.add(this)
      }
    }

    if (this.externalID) {
      // newer tagged entry wins
      const e = db.externalIDs.get(this.externalID)
      if (e && Date.parse(e.date) > Date.parse(this.date)) {
        return
      }
      db.externalIDs.set(this.externalID, this)
    }
  }
}
