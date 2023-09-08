// hooks used by loader-legacy.mjs and loader.mjs

import { readFile } from 'node:fs/promises'
import { parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MessagePort } from 'node:worker_threads'
import { getExclude } from './get-exclude.js'
import { getImportMetaURL } from './get-import-meta-url.js'
import { fakeMains } from './get-main.js'
import {
  getProcessInfo as _getProcessInfo,
  reset as processInfoReset,
} from './get-process-info.js'
import { saveLineLengths } from './line-lengths.js'

let getProcessInfo = _getProcessInfo

let PORT: undefined | MessagePort = undefined

export const globalPreload = (context: { port?: MessagePort }) => {
  // this will be something like path/to/dist/mjs/lib/esm.mjs
  // but we need path/to/dist/cjs/cjs.js
  const base = getImportMetaURL('../cjs/[global preload].js')
  const { port } = context || {}
  PORT = port
  return `
if (typeof port !== 'undefined') {
  const { createRequire } = getBuiltin('module')
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

export const initialize = ({ port }: { port: MessagePort }) => {
  PORT = port
}

const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_', false)

const record = async (url: string, content?: string) => {
  const filename = url.startsWith('file://') ? fileURLToPath(url) : url
  if (exclude.test(filename)) {
    return
  }
  if (fakeMains.includes(filename)) {
    return
  }

  // try to get the actual contents of the file on disk, since it has
  // likely been transpiled by the time we get at it.
  content = await readFile(filename, 'utf8').catch(() => content)

  if (PORT) {
    PORT.postMessage({ filename, content })
  } else {
    // call lazily so we don't double-register
    getProcessInfo().files.push(filename)
    saveLineLengths(filename, content)
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
      await record(url)
      return {
        format: 'commonjs',
        shortCircuit: true,
      }
    }
  }

  const ret = await nextLoad(url, context)
  await record(url, ret.source)
  return ret
}

// just for testing purposes
export const reset = () => {
  PORT = undefined
  getProcessInfo = processInfoReset().getProcessInfo
}
