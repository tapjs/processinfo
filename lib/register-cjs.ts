// commonjs style loader hook, modifying require.extensions
import { addHook } from 'pirates'
import { getExclude } from './get-exclude.js'
import { getProcessInfo } from './get-process-info.js'
import { saveLineLengths } from './line-lengths.js'

const kRegisterCJS = Symbol.for('@tapjs/processinfo.registerCJS')
const g = global as typeof globalThis & {
  [kRegisterCJS]?: boolean
}

export const register = () => {
  if (g[kRegisterCJS]) return
  g[kRegisterCJS] = true
  // by default we include everything in processInfo.files
  const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_', false)
  addHook(
    (code, filename) => {
      getProcessInfo().files.push(filename)
      saveLineLengths(filename, code)
      return code
    },
    {
      exts: ['.js', '.cjs', '.ts', '.cts', '.jsx', '.tsx'],
      matcher: filename => !exclude.test(filename),
    }
  )
}
