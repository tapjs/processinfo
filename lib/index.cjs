const {
  spawn,
  spawnSync,
  exec,
  execSync,
  execFile,
  execFileSync,
} = require('./child_process.cjs')

const { resolve, basename } = require('path')

const { ProcessInfoNode } = require('./process-info-node.cjs')

const {
  writeFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  mkdirSync,
} = require('fs')
const { writeFile, readdir, rm, rmdir, mkdir } = require('fs/promises')

const { safeJSONSync, safeJSON } = require('./json-file.cjs')

class ProcessInfo {
  constructor({
    dir = resolve(process.cwd(), '.tap/processinfo'),
    exclude = /(^|\\|\/)node_modules(\\|\/|$)/,
  } = {}) {
    this.dir = dir
    this.exclude = exclude
    this.roots = new Set()
    this.files = new Map()
    this.uuids = new Map()
    this.pendingRoot = new Map()
    this.pendingParent = new Map()
    this.externalIDs = new Map()
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
    /* istanbul ignore next - node version compat */
    try {
      await rm(this.dir, { recursive: true })
    } catch (e) {
      await rmdir(this.dir, { recursive: true })
    }
  }

  eraseSync() {
    this.clear()
    /* istanbul ignore next - node version compat */
    try {
      rmSync(this.dir, { recursive: true })
    } catch (e) {
      rmdirSync(this.dir, { recursive: true })
    }
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
    let entries
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
}

module.exports = ProcessInfo
