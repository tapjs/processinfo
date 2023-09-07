import t from 'tap'
import { promisify } from 'util'
import Module from 'module'

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

const psym = Symbol.for('nodejs.util.promisify.custom')
delete process.env._TAPJS_PROCESSINFO_EXCLUDE_
for (const loader of ['--import', '--loader']) {
  t.test(loader, t => {
    const cp = t.mock('../dist/cjs/child_process.js', {
      child_process: {
        spawn: (...args: any[]) => ['spawn', args],
        spawnSync: (...args: any[]) => ['spawnSync', args],
        exec: Object.assign((...args: any[]) => ['exec', args], {
          [psym]: async (...args: any[]) => ['p exec', args],
        }),
        execSync: (...args: any[]) => ['execSync', args],
        execFile: Object.assign((...args: any[]) => ['execFile', args], {
          [psym]: async (...args: any[]) => ['p execFile', args],
        }),
        execFileSync: (...args: any[]) => ['execFileSync', args],
        fork: (...args: any[]) => ['fork', args],
      },
      module: Object.assign(Module, {
        register: loader === '--import' ? () => {} : undefined
      }),
    })

    t.test('spawn', t => {
      t.matchSnapshot(cp.spawn('cmd'), 'spawn, no args, no options')
      t.matchSnapshot(cp.spawn('cmd', ['args']), 'spawn, no options')
      t.matchSnapshot(
        cp.spawn('cmd', ['args'], { stdio: 'ignore' }),
        'spawn, options'
      )
      t.matchSnapshot(
        cp.spawn('cmd', { stdio: 'ignore' }),
        'spawn, no args, options'
      )
      t.matchSnapshot(cp.spawnSync('cmd'), 'spawnSync no args no options')
      t.matchSnapshot(cp.spawnSync('cmd', ['args']), 'spawnSync no options')
      t.matchSnapshot(
        cp.spawnSync('cmd', ['args'], { stdio: 'ignore' }),
        'spawnSync options'
      )
      t.matchSnapshot(
        cp.spawnSync('cmd', { stdio: 'ignore' }),
        'spawnSync, no args, options'
      )
      t.end()
    })

    t.test('exec', async t => {
      t.matchSnapshot(
        cp.exec('cmd args', () => {}),
        'exec, no options'
      )
      t.matchSnapshot(
        cp.exec('cmd args', { stdio: 'ignore' }, () => {}),
        'exec options'
      )
      t.matchSnapshot(
        cp.exec('cmd args', null, () => {}),
        'exec null options'
      )
      t.matchSnapshot(
        await promisify(cp.exec)('cmd args', () => {}),
        'p exec, no options'
      )
      t.matchSnapshot(
        await promisify(cp.exec)('cmd args', { stdio: 'ignore' }, () => {}),
        'p exec options'
      )
      t.matchSnapshot(
        await promisify(cp.exec)('cmd args', null, () => {}),
        'p exec null options'
      )
    })

    t.test('execSync', t => {
      t.matchSnapshot(cp.execSync('cmd args'), 'execSync no options')
      t.matchSnapshot(
        cp.execSync('cmd args', { stdio: 'ignore' }),
        'execSync options'
      )
      t.end()
    })

    t.test('execFile', async t => {
      t.matchSnapshot(
        cp.execFile('cmd', () => {}),
        'execFile no args no options'
      )
      t.matchSnapshot(
        cp.execFile('cmd', ['args'], () => {}),
        'execFile no options'
      )
      t.matchSnapshot(
        cp.execFile('cmd', { stdio: 'ignore' }, () => {}),
        'execFile options no args'
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
        await promisify(cp.execFile)('cmd', ['args'], () => {}),
        'p execFile no options'
      )
      t.matchSnapshot(
        await promisify(cp.execFile)('cmd', { stdio: 'ignore' }, () => {}),
        'p execFile options no args'
      )
      t.matchSnapshot(
        await promisify(cp.execFile)(
          'cmd',
          ['args'],
          { stdio: 'ignore' },
          () => {}
        ),
        'p execFile options'
      )
      t.matchSnapshot(
        await promisify(cp.execFile)('cmd', ['args'], null, () => {}),
        'p execFile, null arg, no options'
      )
      t.matchSnapshot(
        await promisify(cp.execFile)(
          'cmd',
          ['args'],
          null,
          { stdio: 'ignore' },
          () => {}
        ),
        'p execFile, null arg, options'
      )
    })

    t.test('execFileSync', t => {
      t.matchSnapshot(
        cp.execFileSync('cmd'),
        'execFileSync, no options, no args'
      )
      t.matchSnapshot(
        cp.execFileSync('cmd', ['args']),
        'execFileSync, no options'
      )
      t.matchSnapshot(
        cp.execFileSync('cmd', { stdio: 'ignore' }),
        'execFileSync, options'
      )
      t.matchSnapshot(
        cp.execFileSync('cmd', ['args'], { stdio: 'ignore' }),
        'execFileSync, args and options'
      )
      t.matchSnapshot(
        cp.execFileSync('cmd', ['args'], null),
        'execFileSync null arg no options'
      )
      t.matchSnapshot(
        cp.execFileSync('cmd', ['args'], null, { stdio: 'ignore' }),
        'execFileSync null arg options'
      )
      t.end()
    })

    t.test('fork', t => {
      t.matchSnapshot(cp.fork('module'))
      t.matchSnapshot(cp.fork('module', ['args']))
      t.matchSnapshot(cp.fork('module', { stdio: 'ignore' }))
      t.matchSnapshot(cp.fork('module', ['args'], { stdio: 'ignore' }))
      t.end()
    })
    t.end()
  })
}
