// usage: node '--loader=@tapjs/processinfo/esm' foo.mjs
import { fileURLToPath } from 'url'
import { getExclude } from './get-exclude.js'
import { resolve } from './require-resolve.js'

// copy main module so that we can --loader=@tapjs/processinfo and use
// this as the entry point as well.
export * from './index.js'

import { channel } from 'diagnostics_channel'
const PORT = channel('@tapjs/processinfo.files-loaded')

// on Node v20, loaders are executed in a separate isolated environment
// As a result, to register coverage and track files, we need to act in
// the globalPreload function. The load() method posts a message with the
// filename being loaded, because any registrations that happen in the
// loader thread will not have any effect.
// Using diagnostics channel means that this will keep working in all
// the versions supported, and easily be transferrable to an --import
// argument that attaches the loaders at run-time.
export const globalPreload = () => {
  // this will be something like path/to/dist/mjs/lib/esm.mjs
  // but we need path/to/dist/cjs/cjs.js
  const base = resolve('../cjs/cjs.js')
  return `
const { createRequire } = getBuiltin('module')
const require = createRequire(${JSON.stringify(base)})
const { getProcessInfo } = require('./get-process-info.js')
const processInfo = getProcessInfo()
const { channel, subscribe } = require('diagnostics_channel')
subscribe('@tapjs/processinfo.files-loaded',
  (e) => processInfo.files.push(e)
)
`
}

const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_')
export const load = async (
  url: string,
  context: any,
  nextLoad: Function
) => {
  if (/^file:/.test(url)) {
    const filename = fileURLToPath(url)
    if (!exclude.test(filename)) {
      PORT.publish(filename)
    }
  }
  return nextLoad(url, context)
}
