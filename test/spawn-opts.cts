import t from 'tap'
import { spawnOpts } from '../dist/commonjs/spawn-opts.js'
const { NODE_OPTIONS } = process.env

const getEnvs = () =>
  Object.fromEntries(
    Object.entries(process.env).filter(([k]) =>
      /^_TAPJS_PROCESSINFO_|^NODE_OPTIONS$/.test(k),
    ),
  )
const saveEnvs = getEnvs()

const clearEnv = () => {
  Object.keys(process.env)
    .filter(k => /^_TAPJS_PROCESSINFO_|^NODE_OPTIONS$/.test(k))
    .forEach(k => delete process.env[k])
  process.env.NODE_OPTIONS = NODE_OPTIONS
  return process.env
}

clearEnv()
t.teardown(() => {
  Object.assign(clearEnv(), saveEnvs)
})

// not included in @types/tap, part of the reason for porting
// tap to ts in the first place :\
const h = (
  t: Tap.Test,
): Tap.Test & {
  hasOwnProp(o: any, prop: PropertyKey, m: string): boolean
} =>
  t as Tap.Test & {
    hasOwnProp(o: any, prop: PropertyKey, m: string): boolean
  }

t.test('no args', t => {
  const opts = spawnOpts({})
  t.match(opts.env, process.env, 'env matches process.env')
  h(t).hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(
    opts.env,
    {
      _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
      _TAPJS_PROCESSINFO_EXTERNAL_ID_: undefined,
    },
    'does not have external id or exclude',
  )
  t.end()
})

t.test('has external id', t => {
  const opts = spawnOpts({ externalID: 'external ID' })
  t.match(opts.env, process.env, 'env matches process.env')
  h(t).hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(
    opts.env,
    {
      _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
      _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
    },
    'has external id, but no exclude',
  )
  t.end()
})

t.test('has exclude', t => {
  const opts = spawnOpts({ externalID: 'external ID' }, /foo/i)
  t.match(opts.env, process.env, 'env matches process.env')
  h(t).hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(
    opts.env,
    {
      _TAPJS_PROCESSINFO_EXCLUDE_: '/foo/i',
      _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
    },
    'has external id and exclude',
  )
  t.end()
})

t.test('existing env', t => {
  const opts = spawnOpts({ env: {} })
  t.notMatch(opts.env, process.env, 'env matches process.env')
  h(t).hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(
    opts.env,
    {
      _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
      _TAPJS_PROCESSINFO_EXTERNAL_ID_: undefined,
    },
    'does not have external id or exclude',
  )
  t.end()
})

t.test('existing env, has external id', t => {
  const opts = spawnOpts({ env: {}, externalID: 'external ID' })
  t.notMatch(opts.env, process.env, 'env matches process.env')
  h(t).hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(
    opts.env,
    {
      _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
      _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
    },
    'has external id, but no exclude',
  )
  t.end()
})

t.test('existing env, has exclude', t => {
  const opts = spawnOpts({ env: {}, externalID: 'external ID' }, /foo/i)
  t.notMatch(opts.env, process.env, 'env matches process.env')
  h(t).hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(
    opts.env,
    {
      _TAPJS_PROCESSINFO_EXCLUDE_: '/foo/i',
      _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
    },
    'has external id and exclude',
  )
  t.end()
})
