// usage: node '--loader=esm.mjs?other-loader&otherotherloader' foo.mjs
import { fileURLToPath } from 'url'
import { getProcessInfo } from './get-process-info.cjs'
import { getExclude } from './get-exclude.cjs'
import './cjs.cjs'

// on Node v20, loaders are executed in a separate isolated environment
// As a result, to register coverage and track files, we need to act in
// the globalPreload function. The load() method posts a message with the
// filename being loaded, because any registrations that happen in the
// loader thread will not have any effect.
// The check for the 'port' being undefined is to allow for support back to
// 16.12, which had a globalPreload method, but did not have a sendMessage
// port in that environment.
let PORT = null
export const globalPreload = context => {
  const loader = fileURLToPath(import.meta.url)
  const { port } = context || {}
  PORT = port
  return `
if (typeof port !== 'undefined') {
  const { createRequire } = getBuiltin('module')
  const {pid, ppid} = getBuiltin('process')
  const require = createRequire(${JSON.stringify(loader)})
  const { getProcessInfo } = require('./get-process-info.cjs')
  const { getExclude } = require('./get-exclude.cjs')
  require('./cjs.cjs')
  const processInfo = getProcessInfo()
  port.onmessage = (e) => processInfo.files.push(e.data)
  port.unref()
}
`
}

const processInfo = getProcessInfo()
const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_')

let others = await Promise.all(
  [...new URL(import.meta.url).searchParams.keys()].map(s =>
    import(s).catch(() => ({}))
  )
)

let hasLoad = others.filter(loader => typeof loader.load === 'function')
let hasResolve = others.filter(loader => typeof loader.resolve === 'function')

const myLoad = defaultFn => async (url, context) => {
  if (/^file:/.test(url)) {
    const filename = fileURLToPath(url)
    if (!exclude.test(filename)) {
      processInfo.files.push(filename)
      if (PORT) {
        PORT.postMessage(filename)
      }
    }
  }
  return defaultFn(url, context, defaultFn)
}

export const load = async (url, context, defaultFn) =>
  runAll(hasLoad, 'load', url, context, myLoad(defaultFn))

export const resolve = async (url, context, defaultFn) =>
  runAll(hasResolve, 'resolve', url, context, defaultFn)

const runAll = async (set, method, url, context, defaultFn, i = 0) => {
  if (i >= set.length) {
    return defaultFn(url, context, defaultFn)
  } else {
    return set[i][method](url, context, (url, context, _) =>
      runAll(set, method, url, context, defaultFn, i + 1)
    )
  }
}
