const {
  spawn,
  spawnSync,
  exec,
  execSync,
  execFile,
  execFileSync,
} = require('child_process')

const {spawnOpts} = require('./spawn-opts.cjs')

const { resolve, basename } = require('path')

const {ProcessInfoNode} = require('./process-info-node.cjs')

const {
  readdir,
  readdirSync,
  readFile,
  readFileSync,
  rm,
  rmdir,
  rmSync,
  rmdirSync,
} = require('fs/promises')

const safeJSON = str => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}

class ProcessInfo {
  constructor ({
    dir = resolve(process.cwd(), '.tap/processinfo'),
    exclude = /(^|\\|\/)node_modules(\\|\/)/,
  } = {}) {
    this.dir = dir
    this.exclude = exclude
    this.roots = new Set()
    this.files = new Map()
    this.uuids = new Map()
    this.externalIDs = new Map()
  }

  clear () {
    this.roots.clear()
    this.files.clear()
    this.uuids.clear()
    this.externalIDs.clear()
  }

  async erase () {
    this.clear()
    try {
      await rm(this.dir, { recursive: true })
    } catch (e) {
      await rmdir(this.dir, { recursive: true })
    }
  }

  eraseSync () {
    this.clear()
    try {
      rmSync(this.dir, { recursive: true })
    } catch (e) {
      rmdirSync(this.dir, { recursive: true })
    }
  }

  async load () {
    const newNodes = []
    for (const entry of await readdir(this.dir).catch(() => [])) {
      const f = resolve(this.dir, entry)
      const data = safeJSON(await readFile(f, 'utf8').catch(() => '{}'))
      if (!data.uuid || data.uuid !== basename(f, '.json')) {
        continue
      }
      if (this.uuids.has(data.uuid)) {
        // loaded previously
        continue
      } else {
        this.uuids.set(data.uuid, new ProcessInfoNode(data))
      }
      newNodes.push(this.uuids.get(data.uuid))
    }

    for (const node of newNodes) {
      node.link(this)
    }

    return this
  }

  loadSync () {
    const newNodes = []
    for (const entry of readdirSync(this.dir).catch(() => [])) {
      const f = resolve(this.dir, entry)
      const data = safeJSON(readFileSync(f, 'utf8').catch(() => '{}'))
      if (!data.uuid || data.uuid !== basename(f, '.json')) {
        continue
      }
      if (this.uuids.has(data.uuid)) {
        // loaded previously
        continue
      } else {
        this.uuids.set(data.uuid, new ProcessInfoNode(data))
      }
      newNodes.push(this.uuids.get(data.uuid))
    }

    for (const node of newNodes) {
      node.link(this)
    }

    return this
  }

  static get Node () {
    return ProcessInfoNode
  }

  static get ProcessInfo () {
    return ProcessInfo
  }

  static spawn (cmd, args, options) {
    return spawn(cmd, args, spawnOpts(options, this.exclude))
  }

  static spawnSync (cmd, args, options) {
    return spawnSync(cmd, args, spawnOpts(options, this.exclude))
  }

  static exec (cmd, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    return exec(cmd, spawnOpts(options, this.exclude), callback)
  }

  static execSync (cmd, options) {
    return execSync(cmd, spawnOpts(options, this.exclude))
  }

  static execFile (cmd, ...execFileArgs) {
    let args = []
    let options = {}
    let callback = undefined
    for (const arg of execFileArgs) {
      if (Array.isArray(arg)) {
        args = arg
      } else if (arg && typeof arg === 'object') {
        options = arg
      } else if (typeof arg === 'function') {
        callback = arg
      }
    }
    return execFile(cmd, args, spawnOpts(options, this.exclude), callback)
  }

  static execFileSync (cmd, ...execFileArgs) {
    let args = []
    let options = {}
    for (const arg of execFileArgs) {
      if (Array.isArray(arg)) {
        args = arg
      } else if (arg && typeof arg === 'object') {
        options = arg
      }
    }
    return execFileSync(cmd, args, spawnOpts(options, this.exclude))
  }
}

module.exports = ProcessInfo
