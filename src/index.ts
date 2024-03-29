import {
  exec,
  execFile,
  execFileSync,
  execSync,
  fork,
  spawn,
  spawnSync,
} from './child_process.js'

export * from './child_process.js'
export * from './process-info-node.js'
export { WithExternalID } from './spawn-opts.js'

import { mkdirSync, readdirSync, rmSync, Stats, writeFileSync } from 'fs'
import { mkdir, readdir, rm, stat, writeFile } from 'fs/promises'
import { basename, resolve } from 'path'
import { getExclude } from './get-exclude.js'
import { safeJSON, safeJSONSync } from './json-file.js'
import { ProcessInfoNode } from './process-info-node.js'

const p = process
const tryStat = async (f: string, stats: Map<string, Stats | null>) => {
  stats.set(f, await stat(f).catch(() => null))
}

export class ProcessInfo {
  dir: string
  exclude: RegExp
  roots: Set<ProcessInfoNode> = new Set()
  uuids: Map<string, ProcessInfoNode> = new Map()
  files: Map<string, Set<ProcessInfoNode>> = new Map()
  pendingRoot: Map<string, Set<ProcessInfoNode>> = new Map()
  pendingParent: Map<string, Set<ProcessInfoNode>> = new Map()
  externalIDs: Map<string, ProcessInfoNode> = new Map()

  static async load({
    dir = resolve(p.cwd(), '.tap/processinfo'),
    exclude = /(^|\\|\/)node_modules(\\|\/|$)/,
  }): Promise<ProcessInfo> {
    const pi = new ProcessInfo({ dir, exclude })
    await pi.load()
    return pi
  }

  static loadSync({
    dir = resolve(p.cwd(), '.tap/processinfo'),
    exclude = /(^|\\|\/)node_modules(\\|\/|$)/,
  }): ProcessInfo {
    const pi = new ProcessInfo({ dir, exclude })
    pi.loadSync()
    return pi
  }

  constructor({
    dir = resolve(p.cwd(), '.tap/processinfo'),
    exclude = /(^|\\|\/)node_modules(\\|\/|$)/,
  } = {}) {
    this.dir = dir
    this.exclude = exclude
  }

  clear() {
    this.roots.clear()
    this.files.clear()
    this.uuids.clear()
    this.externalIDs.clear()
  }

  async save() {
    await mkdir(this.dir, { recursive: true })
    const writes = []
    for (const [uuid, info] of this.uuids.entries()) {
      const f = `${this.dir}/${uuid}.json`
      writes.push(writeFile(f, JSON.stringify(info) + '\n', 'utf8'))
    }
    await Promise.all(writes)
  }

  async saveSync() {
    mkdirSync(this.dir, { recursive: true })
    for (const [uuid, info] of this.uuids.entries()) {
      const f = `${this.dir}/${uuid}.json`
      writeFileSync(f, JSON.stringify(info) + '\n', 'utf8')
    }
  }

  async erase() {
    this.clear()
    await rm(this.dir, { recursive: true })
  }

  eraseSync() {
    this.clear()
    rmSync(this.dir, { recursive: true })
  }

  async load() {
    const promises = []
    for (const entry of await readdir(this.dir).catch(() => [])) {
      const uuid = basename(entry, '.json')
      if (this.uuids.has(uuid)) {
        continue
      }
      const f = resolve(this.dir, entry)
      promises.push(
        safeJSON(f).then(data => {
          if (!data.uuid || data.uuid !== uuid) {
            return
          }
          new ProcessInfoNode(data).link(this)
        })
      )
    }
    await Promise.all(promises)

    return this
  }

  loadSync() {
    let entries: string[]
    try {
      entries = readdirSync(this.dir)
    } catch (_) {
      entries = []
    }
    for (const entry of entries) {
      const uuid = basename(entry, '.json')
      if (this.uuids.has(uuid)) {
        continue
      }
      const f = resolve(this.dir, entry)
      const data = safeJSONSync(f)
      if (!data.uuid || data.uuid !== uuid) {
        continue
      }
      new ProcessInfoNode(data).link(this)
    }

    return this
  }

  #statFiles(
    node: ProcessInfoNode,
    stats: Map<string, Stats | null>,
    exclude: RegExp
  ) {
    const promises: Promise<void>[] = []

    for (const f of node.files) {
      if (exclude.test(f)) continue
      // race
      /* c8 ignore start */
      if (stats.has(f)) continue
      /* c8 ignore stop */
      promises.push(tryStat(f, stats))
      const src = node.sources[f]
      if (src) {
        for (const s of src) {
          /* c8 ignore start */
          if (stats.has(s)) continue
          /* c8 ignore stop */
          promises.push(tryStat(s, stats))
        }
      }
    }
    for (const c of node.descendants ?? []) {
      promises.push(...this.#statFiles(c, stats, exclude))
    }
    return promises
  }

  // if any files are newer than the date, or null, then add it
  // if a file has changed, but its sources haven't, then assume
  // it's still the same content, and not "changed"
  #hasNewerFiles(
    node: ProcessInfoNode,
    stats: Map<string, Stats | null>,
    exclude: RegExp
  ) {
    const p = Date.parse(node.date)
    for (const f of node.files) {
      if (exclude.test(f)) continue
      const st = stats.get(f)
      if (!st) {
        return true
      }
      let c = Number(st.mtime) > p
      if (!c) continue
      const src = node.sources[f]
      if (!src?.length) return true
      else {
        for (const s of src) {
          const sst = stats.get(s)
          if (!sst || Number(sst.mtime) > p) {
            return true
          }
        }
      }
    }
    // no direct files are newer, check descendants
    // if one of them have a changed file, then that's a yes
    for (const c of node.descendants ?? []) {
      if (this.#hasNewerFiles(c, stats, exclude)) {
        return true
      }
    }
    return false
  }

  /**
   * Get a subset of this.externalIDs where one or more of the
   * files have changed since the date on the node.
   */
  async externalIDsChanged(
    filter: (p: string, node: ProcessInfoNode) => boolean = () => true
  ) {
    const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_', false)
    const changed = new Map<string, ProcessInfoNode>()
    const promises: Promise<void>[] = []
    const stats = new Map<string, Stats | null>()
    for (const [id, node] of this.externalIDs.entries()) {
      if (!filter(id, node)) continue
      promises.push(...this.#statFiles(node, stats, exclude))
    }
    // consider limiting with promise-call-limit?
    await Promise.all(promises)

    for (const [id, node] of this.externalIDs.entries()) {
      if (filter(id, node) && this.#hasNewerFiles(node, stats, exclude)) {
        changed.set(id, node)
      }
    }
    return changed
  }

  static get Node() {
    return ProcessInfoNode
  }

  static get ProcessInfo() {
    return ProcessInfo
  }

  static get spawn() {
    return spawn
  }

  static get spawnSync() {
    return spawnSync
  }

  static get exec() {
    return exec
  }

  static get execSync() {
    return execSync
  }

  static get execFile() {
    return execFile
  }

  static get execFileSync() {
    return execFileSync
  }

  static get fork() {
    return fork
  }
}
