const t = require('tap')
t.formatSnapshot = o =>
  !o || typeof o !== 'object'
    ? o
    : Array.isArray(o)
    ? o.map(el => t.formatSnapshot(el))
    : o instanceof Map
    ? new Map(t.formatSnapshot([...o.entries()]))
    : o instanceof Set
    ? new Set(t.formatSnapshot([...o]))
    : Object.fromEntries(
        Object.entries(o).map(([k, v]) =>
          k === 'env' ? [k, filterEnv(v)] : [k, v]
        )
      )

const removePath = require('./fixtures/remove-path.cjs')

// Also remove the home directory where the fixtures happened to be generated,
// since that's '{CWD}' in the snapshots, also generated on that same dir.
const cwds = [
  process.cwd(),
  '/Users/isaacs/dev/tapjs/processinfo',
  '/' + process.cwd().replace(/\\/g, '/'),
  process.cwd().replace(/\\/g, '/'),
]

const filterCWD = o => cwds.reduce((o, cwd) => removePath(o, cwd, '{CWD}'), o)

const filterEnv = e => {
  e = filterCWD(
    Object.fromEntries(
      Object.entries(e).filter(
        ([k]) => /PROCESSINFO/.test(k) || /NODE_OPTIONS/.test(k)
      )
    )
  )
  // also remove the --node-preload that nyc adds
  if (e.NODE_OPTIONS) {
    e.NODE_OPTIONS = e.NODE_OPTIONS.replace(/"--require" "[^"]*node-preload.js" */g, '')
  }
  return e
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
t.matchSnapshot(
  cp.spawn('cmd', ['args'], { stdio: 'ignore' }),
  'spawn, options'
)
t.matchSnapshot(
  cp.spawn('cmd', { stdio: 'ignore' }),
  'spawn, no args, options'
)
t.matchSnapshot(cp.spawnSync('cmd', ['args']), 'spawnSync no options')
t.matchSnapshot(
  cp.spawnSync('cmd', ['args'], { stdio: 'ignore' }),
  'spawnSync options'
)
t.matchSnapshot(
  cp.spawnSync('cmd', { stdio: 'ignore' }),
  'spawnSync, no args, options'
)
t.matchSnapshot(
  cp.exec('cmd args', () => {}),
  'exec, no options'
)
t.matchSnapshot(
  cp.exec('cmd args', { stdio: 'ignore' }, () => {}),
  'exec options'
)
t.matchSnapshot(cp.execSync('cmd args'), 'execSync no options')
t.matchSnapshot(
  cp.execSync('cmd args', { stdio: 'ignore' }),
  'execSync options'
)
t.matchSnapshot(
  cp.execFile('cmd', ['args'], () => {}),
  'execFile no options'
)
t.matchSnapshot(
  cp.execFile('cmd', ['args'], { stdio: 'ignore' }, () => {}),
  'execFile options'
)
t.matchSnapshot(
  cp.execFile('cmd', ['args'], null, () => {}),
  'execFile, null arg, no options'
)
t.matchSnapshot(
  cp.execFile('cmd', ['args'], null, { stdio: 'ignore' }, () => {}),
  'execFile, null arg, options'
)
t.matchSnapshot(cp.execFileSync('cmd', ['args']), 'execFileSync, no options')
t.matchSnapshot(
  cp.execFileSync('cmd', ['args'], { stdio: 'ignore' }),
  'execFileSync, options'
)
t.matchSnapshot(
  cp.execFileSync('cmd', ['args'], null),
  'execFileSync null arg no options'
)
t.matchSnapshot(
  cp.execFileSync('cmd', ['args'], null, { stdio: 'ignore' }),
  'execFileSync null arg options'
)
