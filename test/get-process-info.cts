delete process.env.__TAPJS_PROCESSINFO_TESTING_NO_REGISTER__

import t from 'tap'
import type { ProcessInfoNodeData } from '../dist/commonjs/index.js'

const mockUUID = {
  i: 0,
  v4: () => `uuid-${mockUUID.i++}`,
}

t.formatSnapshot = obj => {
  if (typeof obj === 'string') {
    return obj
      .split(process.cwd())
      .join('{CWD}')
      .split('/Users/isaacs/dev/tapjs/processinfo')
      .join('{CWD}')
      .split(process.execPath)
      .join('{NODE}')
      .split('/usr/local/bin/node')
      .join('{NODE}')
      .replace(/\\/g, '/')
  } else if (!obj || typeof obj !== 'object') {
    return obj
  } else if (Array.isArray(obj)) {
    return obj.map(o => t.formatSnapshot(o))
  } else {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) =>
        k === 'hrstart' ? [k, [Array.isArray(v), (v as Array<any>).length]]
        : k === 'NODE_OPTIONS' ? [k, '']
        : k === 'date' ? [k, typeof k]
        : k === 'execArgv' ? [k, []]
        : k === 'pid' ? [k, v === process.pid]
        : k === 'ppid' ? [k, v === process.ppid]
        : [k, t.formatSnapshot(v)],
      ),
    )
  }
}

const requireGetProcessInfo = (t: Tap.Test) =>
  t
    .mock('../dist/commonjs/get-process-info.js', {
      uuid: mockUUID,
      '../dist/commonjs/register-env.js': { register: () => {} },
      '../dist/commonjs/register-coverage.js': { register: () => {} },
      '../dist/commonjs/register-process-end.js': { register: () => {} },
    })
    .reset()

const getEnvs = () =>
  Object.fromEntries(
    Object.entries(process.env).filter(([k]) =>
      /^_TAPJS_PROCESSINFO_/.test(k),
    ),
  )
const saveEnvs = getEnvs()

const clearEnv = () => {
  Object.keys(process.env)
    .filter(k => /^_TAPJS_PROCESSINFO_/.test(k))
    .forEach(k => delete process.env[k])
  return process.env
}

clearEnv()
t.teardown(() => {
  Object.assign(clearEnv(), saveEnvs)
})

const { argv } = process
t.teardown(() => {
  process.argv = argv
})

t.test('get the process info', t => {
  let root: ProcessInfoNodeData | null
  let child: ProcessInfoNodeData | null
  let eid: ProcessInfoNodeData | null

  const { getProcessInfo } = requireGetProcessInfo(t)
  const processInfo = (root = getProcessInfo())
  if (!root) {
    throw new Error('could not get root processInfo')
  }
  t.matchSnapshot(processInfo, 'root process info')
  t.equal(getProcessInfo(), processInfo, 'returns same object second time')

  t.test('child process info', t => {
    process.argv = [process.execPath, __filename, 'child process']
    const { getProcessInfo } = requireGetProcessInfo(t)
    const processInfo = (child = getProcessInfo())
    if (!root) {
      throw new Error('could not get root processInfo')
    }
    if (!child) {
      throw new Error('could not get child processInfo')
    }
    t.equal(child.parent, root.uuid, 'root is parent of child')
    t.equal(child.root, root.uuid, 'root is root of child')
    t.matchSnapshot(processInfo, 'child process info')
    t.end()
  })

  t.test('external id process', t => {
    process.argv = [process.execPath, __filename, 'eid process']
    const externalID = 'external id'
    process.env._TAPJS_PROCESSINFO_EXTERNAL_ID_ = externalID
    process.env.TAP_BEFORE = 'before'
    process.env.TAP_AFTER = 'after'
    t.teardown(() => {
      delete process.env.TAP_BEFORE
      delete process.env.TAP_AFTER
    })
    const { getProcessInfo } = requireGetProcessInfo(t)
    const processInfo = (eid = getProcessInfo())
    if (!root) {
      throw new Error('could not get root processInfo')
    }
    if (!child) {
      throw new Error('could not get child processInfo')
    }
    if (!eid) {
      throw new Error('could not get eid processInfo')
    }
    t.equal(eid.parent, child.uuid, 'child is parent of eid')
    t.equal(eid.root, root.uuid, 'root is root of eid')
    t.matchSnapshot(processInfo, 'process with external ID')
    t.end()
  })

  t.end()
})

t.test('coverage for the test switch to turn off registration', t => {
  t.teardown(() => {
    delete process.env.__TAPJS_PROCESSINFO_TESTING_NO_REGISTER__
  })
  process.env.__TAPJS_PROCESSINFO_TESTING_NO_REGISTER__ = String(
    process.pid,
  )

  const { getProcessInfo } = t.mock(
    '../dist/commonjs/get-process-info.js',
    {
      '../dist/commonjs/register-require.js': {
        registerRequire() {
          throw new Error('should not register')
        },
      },
    },
  )
  getProcessInfo()
  t.pass('did not register')
  t.end()
})
