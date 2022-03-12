const t = require('tap')
const {spawnOpts} = require('../lib/spawn-opts.cjs')

const getEnvs = () => Object.fromEntries(Object.entries(process.env)
  .filter(([k, v]) => /^_TAPJS_PROCESSINFO_|^NODE_OPTIONS$/.test(k)))
const saveEnvs = getEnvs()

const clearEnv = () => {
  Object.keys(process.env)
    .filter(k => /^_TAPJS_PROCESSINFO_|^NODE_OPTIONS$/.test(k))
    .forEach(k => delete process.env[k])
  return process.env
}

clearEnv(process.env)
t.teardown(() => Object.assign(clearEnv(process.env), saveEnvs))

t.test('no args', t => {
  const opts = spawnOpts()
  t.match(opts.env, process.env, 'env matches process.env')
  t.hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(opts.env, {
    _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
    _TAPJS_PROCESSINFO_EXTERNAL_ID_: undefined,
  }, 'does not have external id or exclude')
  t.end()
})

t.test('has external id', t => {
  const opts = spawnOpts({ externalID: 'external ID' })
  t.match(opts.env, process.env, 'env matches process.env')
  t.hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(opts.env, {
    _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
    _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
  }, 'has external id, but no exclude')
  t.end()
})

t.test('has exclude', t => {
  const opts = spawnOpts({ externalID: 'external ID' }, /foo/i)
  t.match(opts.env, process.env, 'env matches process.env')
  t.hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(opts.env, {
    _TAPJS_PROCESSINFO_EXCLUDE_: '/foo/i',
    _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
  }, 'has external id and exclude')
  t.end()
})

t.test('existing env', t => {
  const opts = spawnOpts({ env: {} })
  t.notMatch(opts.env, process.env, 'env matches process.env')
  t.hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(opts.env, {
    _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
    _TAPJS_PROCESSINFO_EXTERNAL_ID_: undefined,
  }, 'does not have external id or exclude')
  t.end()
})

t.test('existing env, has external id', t => {
  const opts = spawnOpts({ env: {}, externalID: 'external ID' })
  t.notMatch(opts.env, process.env, 'env matches process.env')
  t.hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(opts.env, {
    _TAPJS_PROCESSINFO_EXCLUDE_: undefined,
    _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
  }, 'has external id, but no exclude')
  t.end()
})

t.test('existing env, has exclude', t => {
  const opts = spawnOpts({ env: {}, externalID: 'external ID' }, /foo/i)
  t.notMatch(opts.env, process.env, 'env matches process.env')
  t.hasOwnProp(opts.env, 'NODE_OPTIONS', 'set a node options env')
  t.match(opts.env, {
    _TAPJS_PROCESSINFO_EXCLUDE_: '/foo/i',
    _TAPJS_PROCESSINFO_EXTERNAL_ID_: 'external ID',
  }, 'has external id and exclude')
  t.end()
})
