import { resolve } from 'path'
import t from 'tap'

// mocks
const exitHandlers: ((
  code: number | null,
  signal: NodeJS.Signals | null
) => any)[] = []
const onExit = (
  handler: (code: number | null, signal: NodeJS.Signals | null) => any,
  opts: any
) => {
  exitHandlers.push(handler)
  t.same(opts, { alwaysLast: true }, 'should get alwaysLast flag set')
}
const doExit = (code: number | null, signal: NodeJS.Signals | null) => {
  for (const fn of exitHandlers) {
    fn(code, signal)
  }
}

const registerCoverage = {
  called: false,
  coverageOnProcessEnd: () => (registerCoverage.called = true),
}

const { hrtime } = process
const mockhrtime = ([s, ns] = [0, 0]): [number, number] => [1 - s, 1 - ns]
process.hrtime = Object.assign(mockhrtime, {
  bigint: (b: bigint = BigInt(0)) => 1000000001n - b
})

t.teardown(() => {
  Object.assign(process, { hrtime })
})

const processInfo = {
  uuid: 'uuid',
  hrstart: process.hrtime(),
  files: ['foo.js', 'foo.js'],
}
const getProcessInfo = () => processInfo

const mkdirCalls:[string,any][] = []
const writeFileCalls:[string,any,any][] = []
const fsMock = {
  mkdirSync: (path:string, opt:any) => mkdirCalls.push([resolve(path), opt]),
  writeFileSync: (path:string, data:any, opt:any) =>
    writeFileCalls.push([resolve(path), data, opt]),
}

const mocks = {
  'signal-exit': { onExit },
  fs: { ...require('fs'), ...fsMock },
  '../dist/cjs/register-coverage.js': registerCoverage,
  '../dist/cjs/get-process-info.js': { getProcessInfo },
}

const { register } = t.mock('../dist/cjs/register-process-end.js', mocks)
register()
doExit(0, null)

t.equal(
  registerCoverage.called,
  true,
  'called register coverage process end'
)
t.same(processInfo, {
  uuid: 'uuid',
  files: ['foo.js'],
  code: 0,
  signal: null,
  runtime: 0,
})

t.same(mkdirCalls, [
  [resolve(process.cwd(), '.tap/processinfo'), { recursive: true }],
])
t.same(writeFileCalls, [
  [
    resolve(process.cwd(), '.tap/processinfo/uuid.json'),
    JSON.stringify(processInfo, null, 2) + '\n',
    'utf8',
  ],
])

const g = global as typeof global & { foo: 'bar' }
g.foo = 'bar'

//@ts-ignore
doExit(1, 'sigblerp')
t.same(processInfo, {
  uuid: 'uuid',
  files: ['foo.js'],
  code: 1,
  signal: 'sigblerp',
  runtime: 1000.000001,
  globalsAdded: ['foo'],
})