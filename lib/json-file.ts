// read the file and json decode it, if anything fails, return {}

import { readFileSync } from 'fs'
import { readFile } from 'fs/promises'

export const safeJSONSync = (f: string) => {
  try {
    return JSON.parse(readFileSync(f, 'utf8'))
  } catch (e) {
    return {}
  }
}

export const safeJSON = (f: string) =>
  readFile(f, 'utf8')
    .then(d => JSON.parse(d))
    .catch(() => ({}))
