// commonjs style loader hook, modifying require.extensions
import { addHook } from 'pirates'
import { getExclude } from './get-exclude.js'
import { getProcessInfo } from './get-process-info.js'

const kRegisterCJS = Symbol.for('@tapjs/processinfo.registerCJS')
const g = global as typeof globalThis & {
  [kRegisterCJS]?: boolean
}

export const register = () => {
  if (g[kRegisterCJS]) return
  g[kRegisterCJS] = true
  const exclude = getExclude('_TAPJS_PROCESSINFO_EXCLUDE_')
  addHook(
    (code, filename) => {
      getProcessInfo().files.push(filename)
      return code
    },
    { exts: ['.js', '.cjs'], matcher: filename => !exclude.test(filename) }
  )
}