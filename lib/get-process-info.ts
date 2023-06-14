// we always want this
const p = process as NodeJS.Process & {
  setSourceMapsEnabled(v: boolean): void
}
p.setSourceMapsEnabled(true)

import { fileURLToPath } from 'node:url'
import { v4 as uuid } from 'uuid'
export interface ProcessInfoNodeData {
  // set initially, but deleted before it is written
  hrstart?: [number, number]

  // always set
  date: string
  argv: string[]
  execArgv: string[]
  NODE_OPTIONS?: string
  cwd: string
  pid: number
  ppid: number
  parent: string | null
  uuid: string
  files: string[]
  sources: Record<string, string[]>

  // fields that are only set when the process completes
  root?: string | null
  externalID?: string | null
  code?: number | null
  signal?: NodeJS.Signals | null
  runtime?: number
  globalsAdded?: string[]
}

const envKey = (k: string) => `_TAPJS_PROCESSINFO_${k.toUpperCase()}_`
const getEnv = (k: string) => process.env[envKey(k)]
const setEnv = (k: string, v: string) => (process.env[envKey(k)] = v)
const delEnv = (k: string) => delete process.env[envKey(k)]

import { register as registerCJS } from './register-cjs.js'
import { register as registerCoverage } from './register-coverage.js'
import { register as registerEnv } from './register-env.js'
import { register as registerProcessEnd } from './register-process-end.js'

// this module is hybridized.  In node v20, it's the *commonjs* one that
// gets loaded, because the esm loader context can't modify the main thread
// except via communication over the port to the globalPreload env.
// So, we have to store our singleton on the global.
//
// If it later loads the esm form of this module, that's fine, because it'll
// see the global processInfo object, and not re-register anything.

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

  const argv1 = process.argv[1]
  // we only test this in CJS, but file:// only prepended in ESM
  /* c8 ignore start */
  const main = argv1.startsWith('file://') ? fileURLToPath(argv1) : argv1
  /* c8 ignore stop */

  g[kProcessInfo] = {
    hrstart: process.hrtime(),
    date: new Date().toISOString(),
    argv: process.argv,
    execArgv: process.execArgv,
    NODE_OPTIONS: process.env.NODE_OPTIONS,
    cwd: process.cwd(),
    pid: process.pid,
    ppid: process.ppid,
    parent: getEnv('parent') || null,
    uuid: uuid(),
    files: [main],
    sources: Object.create(null),
  }

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

  registerCJS()
  registerEnv()
  registerCoverage()
  registerProcessEnd()

  return g[kProcessInfo]
}
