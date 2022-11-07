// usage: node '--loader=esm.mjs?other-loader&otherotherloader' foo.mjs
import { fileURLToPath } from 'url'
import { getProcessInfo } from './get-process-info.cjs'
import { getExclude } from './get-exclude.cjs'
import './cjs.cjs'

const processInfo = getProcessInfo()
const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_')

const others = Promise.all(
  [...new URL(import.meta.url).searchParams.keys()].map(s =>
    import(s).catch(() => ({}))
  )
)
const hasLoad = (async () =>
  (await others).filter(loader => typeof loader.load === 'function'))()
const hasResolve = (async () =>
  (await others).filter(loader => typeof loader.resolve === 'function'))()

const myLoad = defaultFn => async (url, context) => {
  if (/^file:/.test(url)) {
    const filename = fileURLToPath(url)
    if (!exclude.test(filename)) {
      processInfo.files.push(filename)
    }
  }
  return defaultFn(url, context, defaultFn)
}

export const load = async (url, context, defaultFn) =>
  runAll(await hasLoad, 'load', url, context, myLoad(defaultFn))

export const resolve = async (url, context, defaultFn) =>
  runAll(await hasResolve, 'resolve', url, context, defaultFn)

const runAll = async (set, method, url, context, defaultFn, i = 0) => {
  if (i >= set.length) {
    return defaultFn(url, context, defaultFn)
  } else {
    return set[i][method](url, context, (url, context, _) =>
      runAll(set, method, url, context, defaultFn, i + 1)
    )
  }
}
