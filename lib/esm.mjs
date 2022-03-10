import {fileURLToPath} from 'url'
import {getProcessInfo} from './get-process-info.cjs'
import {getExclude} from './get-exclude.cjs'

// also load the commonjs hook
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('./cjs.cjs')
const processInfo = getProcessInfo()
const exclude = getExclude()

export const load = async (url, context, defaultLoad) => {
  if (/^file:/.test(url)) {
    const filename = fileURLToPath(url)
    if (!exclude.test(filename)) {
      processInfo.files.push(filename)
    }
  }
  return defaultLoad(url, context, defaultLoad)
}
