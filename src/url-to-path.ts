import { fileURLToPath } from 'url'

export const urlToPath = (s: string | URL) =>
  typeof s === 'object' || s.startsWith('file://') ? fileURLToPath(s) : s
