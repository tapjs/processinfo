import { pathToFileURL } from 'url'

export const pathToURL = (s: string | URL): string =>
  typeof s === 'object' ? String(s)
  : s.startsWith('file://') ? s
  : String(pathToFileURL(s))
