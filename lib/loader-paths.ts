import { resolve } from './require-resolve.js'
import { resolve as pathResolve } from 'path'

import { fileURLToPath, pathToFileURL } from 'url'

export const cjsLoader = resolve('../cjs/cjs.js')
const esmLoaderPath = resolve('../mjs/esm.mjs')
export const esmLoader = pathToFileURL(esmLoaderPath)

const res = (p: string) =>
  /^\.?\.[\\/]/.test(p) ? resolve(pathResolve(p)) : resolve(p)


// functions to test if a given path is the loader path
// we care about.
export const cjsMatch = (p: string): boolean => {
  try {
    return (
      p === '@tapjs/processinfo/cjs' ||
      res(p) === cjsLoader
    )
  } catch {
    return false
  }
}

export const esmMatch = (p: string): boolean => {
  const d = p.startsWith('file://')
    ? fileURLToPath(p)
    : decodeURIComponent(p)
  try {
    return d === '@tapjs/processinfo' || res(d) === esmLoaderPath
  } catch {
    return false
  }
}
