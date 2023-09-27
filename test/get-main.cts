import { pathToFileURL } from 'node:url'
import t from 'tap'

const argv1 = String(process.argv[1])
const macro =
  (arg: string | undefined, expect: string) => (t: Tap.Test) => {
    //@ts-ignore
    process.argv[1] = arg
    t.equal(t.mock('../dist/commonjs/get-main.js', {}).getMain(), expect)
    process.argv[1] = t.context.argv1
    t.end()
  }
t.afterEach(() => (process.argv[1] = argv1))

t.test('path', macro(__filename, __filename))
t.test('file://', macro(String(pathToFileURL(__filename)), __filename))
t.test('unknown', macro(undefined, '<unknown>'))
t.test('repl', t => {
  //@ts-ignore
  globalThis.repl = {}
  macro(undefined, '<repl>')(t)
  //@ts-ignore
  delete globalThis.repl
})
t.test('eval', t => {
  //@ts-ignore
  process._eval = 'hello'
  macro(undefined, '<eval>')(t)
  //@ts-ignore
  process._eval = undefined
})
