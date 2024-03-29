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
import { likelyHasSourceMap } from './lookup-sources.js'

let getProcessInfo = _getProcessInfo
let PORT: undefined | MessagePort = undefined

const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_', false)
const smMagicComment = /\/[*\/]#\s+sourceMappingURL=[^\s]+/

export const globalPreload = (context: { port?: MessagePort }) => {
  // this will be something like path/to/dist/esm/lib/esm.mjs
  // but we need path/to/dist/commonjs/cjs.js
  const base = getImportMetaURL('../commonjs/[global preload].js')
  const { port } = context || {}
  PORT = port
  return `
if (typeof port !== 'undefined') {
  const { createRequire } = getBuiltin('module')
  const { fileURLToPath } = getBuiltin('url')
  const require = createRequire(${JSON.stringify(base)})
  const { getProcessInfo } = require('./get-process-info.js')
  const { saveLineLengths } = require('./line-lengths.js')
  const { likelyHasSourceMap } = require('./lookup-sources.js')
  // must be called eagerly here.
  // this does all the registration as well.
  const processInfo = getProcessInfo()
  port.onmessage = (e) => {
    const { filename, content, url } = e.data
    processInfo.files.push(filename)
    saveLineLengths(filename, content)
    if (url) likelyHasSourceMap(url)
  }
  port.unref()
}
`
}

export const initialize = ({ port }: { port: MessagePort }) => {
  PORT = port
}

const record = async (
  url: string,
  content?: string,
  originSource?: string
) => {
  const filename = url.startsWith('file://') ? fileURLToPath(url) : url
  if (exclude.test(filename)) {
    return
  }
  if (fakeMains.includes(filename)) {
    return
  }

  let maybeSM = false
  if (
    originSource !== content ||
    (content === undefined && url.startsWith('file://'))
  ) {
    // try to read the file, fall back to the content we have, or ''
    // if any source maps anywhere, flag it as possibly having one
    originSource ??=
      (await readFile(filename, 'utf8').catch(() => content)) ?? ''
  }
  maybeSM = smMagicComment.test(originSource as string)

  if (PORT) {
    PORT.postMessage({
      filename,
      content,
      ...(maybeSM && { url }),
    })
  } else {
    // call lazily so we don't double-register
    getProcessInfo().files.push(filename)
    saveLineLengths(filename, content)
    if (maybeSM) likelyHasSourceMap(url)
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
    // TODO: should we just let this fail? It fails *without* the loader,
    // after all.
    if (!ext) {
      await record(url)
      return {
        ...context,
        format: 'commonjs',
        shortCircuit: true,
      }
    }
  }

  // get line lengths from final source
  // if origin source doesn't match, check for possible source map
  const originSource = context.source
  const ret = await nextLoad(url, context)
  await record(url, ret.source, originSource)
  return ret
}

// just for testing purposes
export const reset = () => {
  PORT = undefined
  getProcessInfo = processInfoReset().getProcessInfo
}
