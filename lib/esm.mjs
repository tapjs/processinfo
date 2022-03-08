import {fileURLToPath} from 'url'
import {getProcessInfo} from './get-process-info.cjs'

// also load the commonjs hook
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
require('./cjs.cjs')
// const {getProcessInfo} = require('./get-process-info.cjs')
const processInfo = getProcessInfo()

export const load = async (url, context, defaultLoad) => {
  processInfo.files.push(fileURLToPath(url))
  return defaultLoad(url, context, defaultLoad)
}
