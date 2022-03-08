const {
  spawn,
  spawnSync,
  exec,
  execSync,
  execFile,
  execFileSync,
} = require('child_process')
const {nodeOptionsEnv} = require('./node-options-env.cjs')

const spawnOpts = (options = {}) => {
  const {externalID} = options
  const env = {...(options.env || process.env) }
  env.NODE_OPTIONS = nodeOptionsEnv(env, [])
  if (externalID) {
    env._TAPJS_PROCESSINFO_EXTERNAL_ID_ = externalID
  }
  return { ...options, env }
}

const { resolve, basename } = require('path')

class ProcessInfoNode {
  constructor (data) {
    this.parent = null
    this.children = []
    this.files = []
    Object.assign(this, data)
  }

  toJSON () {
    return {
      ...this,
      root: this.root && this.root.uuid,
      parent: this.parent && this.parent.uuid,
      children: this.children.map(c => c.uuid),
    }
  }

  link (db) {
    this.parent = db.uuids.get(this.parent) || this.parent || null
    this.root = db.uuids.get(this.root) || this.root
    this.children = this.children.map(c => db.uuids.get(c) || c)
    if (this.parent === null) {
      db.roots.add(this)
    }
    for (const f of this.files) {
      if (!db.files.has(f)) {
        db.files.set(f, new Set())
      }
      db.files.get(f).add(this)
    }
    if (this.externalID) {
      db.externalIDs.set(this.externalID, this)
    }
  }
}

const {
  readdir,
  readdirSync,
  readFile,
  readFileSync,
  rm,
  rmdir,
} = require('fs/promises')

const safeJSON = str => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}

class ProcessInfo {
  constructor ({ dir = resolve(process.cwd(), '.tap/processinfo') }) {
    this.dir = dir
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

  static spawn (cmd, args, options) {
    return spawn(cmd, args, spawnOpts(options))
  }

  static spawnSync (cmd, args, options) {
    return spawnSync(cmd, args, spawnOpts(options))
  }

  static exec (cmd, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    return exec(cmd, spawnOpts(options), callback)
  }

  static execSync (cmd, options) {
    return execSync(cmd, spawnOpts(options))
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
    return execFile(cmd, args, spawnOpts(options), callback)
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
    return execFileSync(cmd, args, spawnOpts(options))
  }
}

module.exports = ProcessInfo
