// usage: node '--loader=@tapjs/processinfo/esm' foo.mjs
import { parse } from 'path'
import { fileURLToPath } from 'url'
import type { Serializable } from 'worker_threads'
import { getExclude } from './get-exclude.js'
import { getProcessInfo } from './get-process-info.js'
import { saveLineLengths } from './line-lengths.js'
import { resolve } from './require-resolve.js'

// copy main module so that we can --loader=@tapjs/processinfo and use
// this as the entry point as well.
export * from './index.js'

// on Node v20, loaders are executed in a separate isolated environment
// As a result, to register coverage and track files, we need to act in
// the globalPreload function. The load() method posts a message with the
// filename being loaded, because any registrations that happen in the
// loader thread will not have any effect.
// The check for the 'port' being undefined is to allow for support back to
// 16.12, which had a globalPreload method, but did not have a sendMessage
// port in that environment.
type GPPort = {
  postMessage: (x: Serializable) => any
}
let PORT: undefined | GPPort = undefined
export const globalPreload = (context: { port?: GPPort }) => {
  // this will be something like path/to/dist/mjs/lib/esm.mjs
  // but we need path/to/dist/cjs/cjs.js
  const base = resolve('../cjs/cjs.js')
  const { port } = context || {}
  PORT = port
  return `
if (typeof port !== 'undefined') {
  const { createRequire, findSourceMap } = getBuiltin('module')
  const { fileURLToPath } = getBuiltin('url')
  const require = createRequire(${JSON.stringify(base)})
  const { getProcessInfo } = require('./get-process-info.js')
  const { saveLineLengths } = require('./line-lengths.js')
  // must be called eagerly here.
  // this does all the registration as well.
  const processInfo = getProcessInfo()
  port.onmessage = (e) => {
    const { filename, content } = e.data
    processInfo.files.push(filename)
    saveLineLengths(filename, content)
  }
  port.unref()
}
`
}

const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_', false)
const record = (url: string, content?: string) => {
  const filename = url.startsWith('file://') ? fileURLToPath(url) : url
  if (exclude.test(filename)) return
  if (PORT) {
    PORT.postMessage({ filename, content })
  } else {
    // call lazily so we don't double-register
    getProcessInfo().files.push(filename)
    if (content) saveLineLengths(filename, content)
  }
}

export const load = async (
  url: string,
  context: any,
  nextLoad: Function
) => {
  if (url.startsWith('file://')) {
    const filename = fileURLToPath(url)
    const { ext } = parse(filename)
    // Package bins will sometimes have an extensionless bin script
    // instead of just naming their extensioned file and letting npm
    // symlink it for them. Don't blow up when this happens, just tell
    // node that it's commonjs.
    if (!ext) {
      record(url)
      return {
        format: 'commonjs',
        shortCircuit: true,
      }
    }
  }

  const ret = await nextLoad(url, context)
  record(url, String(ret.source))
  return ret
}
