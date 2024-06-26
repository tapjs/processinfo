// we always want this
const p = process as NodeJS.Process & {
  setSourceMapsEnabled(v: boolean): void
  _eval?: string
}
p.setSourceMapsEnabled(true)

import { resolve } from 'path'
import { v4 as uuid } from 'uuid'
import { getMain } from './get-main.js'
import { ProcessInfoNodeData } from './process-info-node.js'

const envKey = (k: string) => `_TAPJS_PROCESSINFO_${k.toUpperCase()}_`
const getEnv = (k: string) => p.env[envKey(k)]
const setEnv = (k: string, v: string) => (p.env[envKey(k)] = v)
const delEnv = (k: string) => delete p.env[envKey(k)]

import { register as registerCoverage } from './register-coverage.js'
import { register as registerEnv } from './register-env.js'
import { register as registerProcessEnd } from './register-process-end.js'
import { register as registerRequire } from './register-require.js'

// this module is hybridized.  In node v20.0 - v20.6, it's the *commonjs* one
// that gets loaded, because the esm loader context can't modify the main
// thread except via communication over the port to the globalPreload env. So,
// we have to store our singleton on the global.
//
// If it later loads the esm form of this module, that's fine, because it'll
// see the global processInfo object, and not re-register anything.
//
// CJS registration can be removed once node < 20.6 is no longer supported.

const kProcessInfo = Symbol.for('@tapjs/processinfo.ProcessInfoNodeData')
const g = global as typeof globalThis & {
  [kProcessInfo]?: ProcessInfoNodeData
}

// only used for tests so we can simulate multiple processes
export const reset = () => {
  g[kProcessInfo] = undefined
  return { getProcessInfo }
}

export const getProcessInfo = (): ProcessInfoNodeData => {
  if (g[kProcessInfo]) return g[kProcessInfo]

  g[kProcessInfo] = {
    hrstart: p.hrtime(),
    date: new Date().toISOString(),
    argv: p.argv,
    execArgv: p.execArgv,
    NODE_OPTIONS: p.env.NODE_OPTIONS,
    cwd: p.cwd(),
    pid: p.pid,
    ppid: p.ppid,
    parent: getEnv('parent') || null,
    uuid: uuid(),
    files: [getMain()],
    sources: Object.create(null),
  }
  if (process.env.TAP_BEFORE)
    g[kProcessInfo].files.push(resolve(process.env.TAP_BEFORE))
  if (process.env.TAP_AFTER)
    g[kProcessInfo].files.push(resolve(process.env.TAP_AFTER))

  if (!g[kProcessInfo].parent) {
    g[kProcessInfo].root = g[kProcessInfo].uuid
    setEnv('root', g[kProcessInfo].uuid)
  } else {
    g[kProcessInfo].root = getEnv('root')
  }
  // this is the parent of any further child processes
  setEnv('parent', g[kProcessInfo].uuid)
  const externalID = getEnv('external_id')
  if (externalID) {
    g[kProcessInfo].externalID = externalID
    // externalID only applies to ONE process, not all its children.
    delEnv('external_id')
  }

  // switch to turn off registration for some tests.
  // excluded from coverage because that's the reason why it's here
  // in the first place, it confuses c8.
  /* c8 ignore start */
  if (
    process.env.__TAPJS_PROCESSINFO_TESTING_NO_REGISTER__ !==
    String(process.pid)
  ) {
    registerRequire()
    registerEnv()
    registerCoverage()
    registerProcessEnd()
  }
  /* c8 ignore stop */

  return g[kProcessInfo]
}
