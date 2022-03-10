const listeners = []
const pos = {
  addListener: fn => pos.listener = fn
}

const t = require('tap')

const registerEnv = t.mock('../lib/register-env.cjs', { 'process-on-spawn': pos })
t.type(pos.listener, Function, 'registered handler')

{
  // start with a clean env
  const restoreEnv = {}
  const {execArgv} = process
  process.execArgv = []
  for (const [k, v] of Object.entries(process.env)) {
    if (/^_TAPJS_PROCESSINFO_|^NODE_OPTIONS$/.test(k)) {
      restoreEnv[k] = v
      delete process.env[k]
    }
  }
  t.teardown(() => {
    Object.assign(process.env, restoreEnv)
    delete process.env._TAPJS_PROCESSINFO_TESTING_REGENV_
    process.execArgv = execArgv
  })
  process.env._TAPJS_PROCESSINFO_TESTING_REGENV_ = '1'
}

const {pathToFileURL} = require('url')
const {argvToNodeOptions} = require('../lib/argv-to-node-options.cjs')
const mjsLoader = argvToNodeOptions([
  `--loader=${pathToFileURL(require.resolve('../lib/esm.mjs'))}`
])
const cjsLoader = argvToNodeOptions([
  `--require=${require.resolve('../lib/cjs.cjs')}`
])

t.same(pos.listener({}), {
  env: { _TAPJS_PROCESSINFO_TESTING_REGENV_: '1', NODE_OPTIONS: mjsLoader },
})

t.same(pos.listener({env: {}}), {
  env: { _TAPJS_PROCESSINFO_TESTING_REGENV_: '1', NODE_OPTIONS: mjsLoader },
})

t.same(pos.listener({x: 1, env: {}}), {
  x: 1,
  env: { _TAPJS_PROCESSINFO_TESTING_REGENV_: '1', NODE_OPTIONS: mjsLoader },
})

t.same(pos.listener({env: {x: '1'}}), {
  env: { x: '1', _TAPJS_PROCESSINFO_TESTING_REGENV_: '1', NODE_OPTIONS: mjsLoader },
})

t.same(pos.listener({env: {
  _TAPJS_PROCESSINFO_TESTING_REGENV_: '2',
}}), {
  env: { _TAPJS_PROCESSINFO_TESTING_REGENV_: '2', NODE_OPTIONS: mjsLoader },
})

process.execArgv = ['--x', 'xyz']
t.same(pos.listener({}), {
  env: { _TAPJS_PROCESSINFO_TESTING_REGENV_: '1', NODE_OPTIONS: mjsLoader },
})

process.execArgv = [`--require=${require.resolve('../lib/cjs.cjs')}`]
t.same(pos.listener({}), {
  env: { _TAPJS_PROCESSINFO_TESTING_REGENV_: '1', NODE_OPTIONS: cjsLoader },
})

t.end()
