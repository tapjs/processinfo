const t = require('tap')
t.formatSnapshot = o =>
  (!o || typeof o !== 'object') ? o
  : Array.isArray(o) ? o.map(el => t.formatSnapshot(el))
  : o instanceof Map ? new Map(t.formatSnapshot([...o.entries()]))
  : o instanceof Set ? new Set(t.formatSnapshot([...o]))
  : Object.fromEntries(Object.entries(o).map(([k, v]) => k === 'env' ? [k, filterEnv(v)]: [k, v]))

const filterEnv = e => removePath(Object.fromEntries(Object.entries(e).filter(([k]) => /PROCESSINFO/.test(k) || /NODE_OPTIONS/.test(k))), process.cwd(), '{CWD}')

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
const calls = []
const track = (method, args) => {
  const ret = [method, args]
  calls.push(ret)
  return ret
}
const cp = t.mock('../lib/child_process.cjs', {
  child_process: {
    spawn: (...args) => track('spawn', args),
    spawnSync: (...args) => track('spawnSync', args),
    exec: (...args) => track('exec', args),
    execSync: (...args) => track('execSync', args),
    execFile: (...args) => track('execFile', args),
    execFileSync: (...args) => track('execFileSync', args),
  },
})

t.matchSnapshot(cp.spawn('cmd', ['args']), 'spawn, no options')
t.matchSnapshot(cp.spawn('cmd', ['args'], { stdio: 'ignore' }), 'spawn, options')
t.matchSnapshot(cp.spawnSync('cmd', ['args']), 'spawnSync no options')
t.matchSnapshot(cp.spawnSync('cmd', ['args'], { stdio: 'ignore' }), 'spawnSync options')
t.matchSnapshot(cp.exec('cmd args', () => {}), 'exec, no options')
t.matchSnapshot(cp.exec('cmd args', { stdio: 'ignore' }, () => {}), 'exec options')
t.matchSnapshot(cp.execSync('cmd args'), 'execSync no options')
t.matchSnapshot(cp.execSync('cmd args', { stdio: 'ignore' }), 'execSync options')
t.matchSnapshot(cp.execFile('cmd', ['args'], () => {}), 'execFile no options')
t.matchSnapshot(cp.execFile('cmd', ['args'], { stdio: 'ignore' }, () => {}), 'execFile options')
t.matchSnapshot(cp.execFile('cmd', ['args'], null, () => {}), 'execFile, null arg, no options')
t.matchSnapshot(cp.execFile('cmd', ['args'], null, { stdio: 'ignore' }, () => {}), 'execFile, null arg, options')
t.matchSnapshot(cp.execFileSync('cmd', ['args']), 'execFileSync, no options')
t.matchSnapshot(cp.execFileSync('cmd', ['args'], { stdio: 'ignore' }), 'execFileSync, options')
t.matchSnapshot(cp.execFileSync('cmd', ['args'], null), 'execFileSync null arg no options')
t.matchSnapshot(cp.execFileSync('cmd', ['args'], null, { stdio: 'ignore' }), 'execFileSync null arg options')
