import {
  exec,
  execFile,
  execFileSync,
  execSync,
  fork,
  spawn,
  spawnSync,
} from './child_process.js'

export { WithExternalID } from './spawn-opts.js'

export * from './child_process.js'
export { ProcessInfoNodeData } from './get-process-info.js'
export * from './process-info-node.js'

import { basename, resolve } from 'path'

import { ProcessInfoNode } from './process-info-node.js'

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { mkdir, readdir, rm, writeFile } from 'fs/promises'

import { safeJSON, safeJSONSync } from './json-file.js'

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
    dir = resolve(process.cwd(), '.tap/processinfo'),
    exclude = /(^|\\|\/)node_modules(\\|\/|$)/,
  }): Promise<ProcessInfo> {
    const pi = new ProcessInfo({ dir, exclude })
    await pi.load()
    return pi
  }

  static loadSync({
    dir = resolve(process.cwd(), '.tap/processinfo'),
    exclude = /(^|\\|\/)node_modules(\\|\/|$)/,
  }): ProcessInfo {
    const pi = new ProcessInfo({ dir, exclude })
    pi.loadSync()
    return pi
  }

  constructor({
    dir = resolve(process.cwd(), '.tap/processinfo'),
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
