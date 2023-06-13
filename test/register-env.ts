import t from 'tap'
import { pathToFileURL } from 'url'
import { argvToNodeOptions } from '../dist/cjs/argv-to-node-options.js'

const pos: {
  listener?: Function
  addListener: (fn: Function) => void
} = {
  addListener: fn => {
    pos.listener = fn
  },
}

const registerEnv = t.mock('../dist/cjs/register-env.js', {
  'process-on-spawn': pos,
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

const mjsLoader = argvToNodeOptions([
  `--loader=${pathToFileURL(require.resolve('../dist/mjs/esm.mjs'))}`,
])
const cjsLoader = argvToNodeOptions([
  `--require=${require.resolve('../dist/cjs/cjs.js')}`,
])

t.same(pos.listener?.({}), {
  env: {
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: mjsLoader,
  },
})

t.same(pos.listener?.({ env: {} }), {
  env: {
    NODE_OPTIONS: mjsLoader,
  },
})

t.same(pos.listener?.({ x: 1, env: {} }), {
  x: 1,
  env: {
    NODE_OPTIONS: mjsLoader,
  },
})

t.same(pos.listener?.({ env: { x: '1' } }), {
  env: {
    x: '1',
    NODE_OPTIONS: mjsLoader,
  },
})

t.same(
  pos.listener?.({
    env: {
      _TAPJS_PROCESSINFO_TESTING_REGENV_: '2',
    },
  }),
  {
    env: {
      _TAPJS_PROCESSINFO_TESTING_REGENV_: '2',
      NODE_OPTIONS: mjsLoader,
    },
  }
)

process.execArgv = ['--x', 'xyz']
t.same(pos.listener?.({}), {
  env: {
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: mjsLoader,
  },
})

process.execArgv = [`--require=${require.resolve('../dist/cjs/cjs.js')}`]
t.same(pos.listener?.({}), {
  env: {
    _TAPJS_PROCESSINFO_TESTING_REGENV_: '1',
    NODE_OPTIONS: cjsLoader,
  },
})

t.end()
