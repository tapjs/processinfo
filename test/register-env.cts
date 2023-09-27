import { resolve } from 'path'
import t from 'tap'

const pos: {
  listener?: Function
  addListener: (fn: Function) => void
} = {
  addListener: fn => {
    pos.listener = fn
  },
}

const registerEnv = t.mock('../dist/commonjs/register-env.js', {
  'process-on-spawn': pos,
  '../dist/commonjs/node-options-env.js': {
    nodeOptionsEnv: (env: { NODE_OPTIONS?: string }) => {
      return (env.NODE_OPTIONS || '<empty>') + ' added loader'
    },
  },
})

registerEnv.register()
t.type(pos.listener, Function, 'registered handler')

{
  // start with a clean env
  const restoreEnv: { [k: string]: string | undefined } = {}
  const { execArgv } = process
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

t.same(pos.listener?.({}), {
  env: {
    ...process.env,
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: '<empty> added loader',
  },
})

t.same(pos.listener?.({ env: {} }), {
  env: {
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: '<empty> added loader',
  },
})

t.same(pos.listener?.({ x: 1, env: {} }), {
  x: 1,
  env: {
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: '<empty> added loader',
  },
})

t.same(pos.listener?.({ env: { x: '1' } }), {
  env: {
    x: '1',
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: '<empty> added loader',
  },
})

t.same(
  pos.listener?.({
    env: {
      _TAPJS_PROCESSINFO_TESTING_REGENV_: '2',
      NODE_OPTIONS: 'something',
    },
  }),
  {
    env: {
      _TAPJS_PROCESSINFO_TESTING_REGENV_: '2',
      NODE_OPTIONS: 'something added loader',
    },
  }
)

process.execArgv = ['--x', 'xyz']
t.same(pos.listener?.({}), {
  env: {
    ...process.env,
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: '<empty> added loader',
  },
})

process.execArgv = [
  `--require=${resolve(
    __dirname,
    '../dist/commonjs/register-require.js'
  )}`,
]
t.same(pos.listener?.({}), {
  env: {
    ...process.env,
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: '<empty> added loader',
  },
})

t.end()
