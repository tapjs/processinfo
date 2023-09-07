import { resolve } from 'path'
import { getImportMetaURL } from './get-import-meta-url.js'

import { fileURLToPath } from 'url'

export const legacyLoader = getImportMetaURL('../mjs/loader-legacy.mjs')
export const importLoader = getImportMetaURL('../mjs/import.mjs')
const legacyLoaderPath = fileURLToPath(legacyLoader)
const importLoaderPath = fileURLToPath(importLoader)

export const legacyMatch = (p: string): boolean => {
  const d = p.startsWith('file://')
    ? fileURLToPath(p)
    : decodeURIComponent(p)
  return (
    d === '@tapjs/processinfo/loader' ||
    p === legacyLoader ||
    resolve(d) === legacyLoaderPath
  )
}

export const importMatch = (p: string): boolean => {
  const d = p.startsWith('file://')
    ? fileURLToPath(p)
    : decodeURIComponent(p)
  return (
    d === '@tapjs/processinfo/import' ||
    p === importLoader ||
    resolve(d) === importLoaderPath
  )
}
