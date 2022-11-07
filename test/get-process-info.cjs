const t = require('tap')
const mockUUID = {
  i: 0,
  v4: () => `uuid-${mockUUID.i++}`,
}

t.formatSnapshot = obj => {
  if (typeof obj === 'string') {
    return obj
      .split(process.cwd())
      .join('{CWD}')
      .split(process.execPath)
      .join('{NODE}')
      .replace(/\\/g, '/')
  } else if (!obj || typeof obj !== 'object') {
    return obj
  } else if (Array.isArray(obj)) {
    return obj.map(o => t.formatSnapshot(o))
  } else {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) =>
        k === 'hrstart'
          ? [k, [Array.isArray(v), v.length]]
          : k === 'NODE_OPTIONS'
          ? [k, '']
          : k === 'date'
          ? [k, typeof k]
          : k === 'execArgv'
          ? [k, []]
          : k === 'pid'
          ? [k, v === process.pid]
          : k === 'ppid'
          ? [k, v === process.ppid]
          : [k, t.formatSnapshot(v)]
      )
    )
  }
}

const requireGetProcessInfo = t =>
  t.mock('../lib/get-process-info.cjs', {
    uuid: mockUUID,
    '../lib/register-env.cjs': {},
    '../lib/register-coverage.cjs': {},
    '../lib/register-process-end.cjs': {},
  })

const getEnvs = () =>
  Object.fromEntries(
    Object.entries(process.env).filter(([k, v]) =>
      /^_TAPJS_PROCESSINFO_/.test(k)
    )
  )
const saveEnvs = getEnvs()

const clearEnv = () => {
  Object.keys(process.env)
    .filter(k => /^_TAPJS_PROCESSINFO_/.test(k))
    .forEach(k => delete process.env[k])
  return process.env
}

clearEnv(process.env)
t.teardown(() => Object.assign(clearEnv(process.env), saveEnvs))

const { argv } = process
t.teardown(() => (process.argv = argv))

t.test('get the process info', t => {
  let root, child, eid

  const { getProcessInfo } = requireGetProcessInfo(t)
  const processInfo = (root = getProcessInfo())
  t.matchSnapshot(processInfo, 'root process info')
  t.equal(getProcessInfo(), processInfo, 'returns same object second time')

  t.test('child process info', t => {
    process.argv = [process.execPath, __filename, 'child process']
    const { getProcessInfo } = requireGetProcessInfo(t)
    const processInfo = (child = getProcessInfo())
    t.equal(child.parent, root.uuid, 'root is parent of child')
    t.equal(child.root, root.uuid, 'root is root of child')
    t.matchSnapshot(processInfo, 'child process info')
    t.end()
  })

  t.test('external id process', t => {
    process.argv = [process.execPath, __filename, 'eid process']
    const externalID = 'external id'
    process.env._TAPJS_PROCESSINFO_EXTERNAL_ID_ = externalID
    const { getProcessInfo } = requireGetProcessInfo(t)
    const processInfo = (eid = getProcessInfo())
    t.equal(eid.parent, child.uuid, 'child is parent of eid')
    t.equal(eid.root, root.uuid, 'root is root of eid')
    t.matchSnapshot(processInfo, 'process with external ID')
    t.end()
  })

  t.end()
})
