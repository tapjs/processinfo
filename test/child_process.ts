import t from 'tap'
const formatSnapshot = (o: any): any =>
  !o || typeof o !== 'object'
    ? o
    : Array.isArray(o)
    ? o.map(el => t.formatSnapshot(el))
    : o instanceof Map
    ? new Map(formatSnapshot([...o.entries()]))
    : o instanceof Set
    ? new Set(t.formatSnapshot([...o]))
    : Object.fromEntries(
        Object.entries(o).map(([k, v]) =>
          k === 'env' ? [k, filterEnv(v)] : [k, v]
        )
      )
t.formatSnapshot = formatSnapshot

import { removePath } from './fixtures/remove-path'

// Also remove the home directory where the fixtures happened to be generated,
// since that's '{CWD}' in the snapshots, also generated on that same dir.
const cwds = [
  process.cwd(),
  '/Users/isaacs/dev/tapjs/processinfo',
  '/' + process.cwd().replace(/\\/g, '/'),
  process.cwd().replace(/\\/g, '/'),
]

const filterCWD = (o: any) =>
  cwds.reduce((o, cwd) => removePath(o, cwd, '{CWD}'), o)

const filterEnv = (e: any) => {
  e = filterCWD(
    Object.fromEntries(
      Object.entries(e).filter(
        ([k]) => /PROCESSINFO/.test(k) || /NODE_OPTIONS/.test(k)
      )
    )
  )
  // also remove the --node-preload that nyc adds
  if (e.NODE_OPTIONS) {
    e.NODE_OPTIONS = e.NODE_OPTIONS.replace(
      /"--require" "[^"]*node-preload.js" */g,
      ''
    )
  }
  return e
}

const calls: [string, any[]][] = []
const track = (method: string, args: any[]) => {
  calls.push([method, args])
  return [method, args]
}
const cp = t.mock('../dist/cjs/child_process.js', {
  child_process: {
    spawn: (...args: any[]) => track('spawn', args),
    spawnSync: (...args: any[]) => track('spawnSync', args),
    exec: (...args: any[]) => track('exec', args),
    execSync: (...args: any[]) => track('execSync', args),
    execFile: (...args: any[]) => track('execFile', args),
    execFileSync: (...args: any[]) => track('execFileSync', args),
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
t.matchSnapshot(
  cp.execFileSync('cmd', ['args']),
  'execFileSync, no options'
)
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
