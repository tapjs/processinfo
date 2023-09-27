import { resolve } from 'path'
import t from 'tap'
import { pathToFileURL } from 'url'

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
  bigint: (b: bigint = BigInt(0)) => 1000000001n - b,
})

t.teardown(() => {
  Object.assign(process, { hrtime })
})

const f = resolve(__dirname, 'fixtures', 'foo.mjs')
const bm = resolve(__dirname, 'fixtures/bar.min.mjs')
const b = resolve(__dirname, 'fixtures/bar.mjs')
const processInfo = {
  uuid: 'uuid',
  hrstart: process.hrtime(),
  files: [f, f, bm],
  sources: {},
}
const getProcessInfo = () => processInfo

const mkdirCalls: [string, any][] = []
const writeFileCalls: [string, any, any][] = []
const fsMock = {
  mkdirSync: (path: string, opt: any) =>
    mkdirCalls.push([resolve(path), opt]),
  writeFileSync: (path: string, data: any, opt: any) =>
    writeFileCalls.push([resolve(path), data, opt]),
}

const mocks = {
  'signal-exit': { onExit },
  fs: { ...require('fs'), ...fsMock },
  '../dist/commonjs/register-coverage.js': registerCoverage,
  '../dist/commonjs/get-process-info.js': { getProcessInfo },
}

t.test('run the process end', async t => {
  // have to actually load the bar.min.mjs file to get its source map
  // to be loaded by node.
  await import(String(pathToFileURL(bm)))
  const { register } = t.mock(
    '../dist/commonjs/register-process-end.js',
    mocks
  )
  register()
  doExit(0, null)

  t.equal(
    registerCoverage.called,
    true,
    'called register coverage process end'
  )
  t.same(processInfo, {
    uuid: 'uuid',
    files: [f, bm],
    sources: {
      [bm]: [b],
    },
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
    files: [f, bm],
    sources: {
      [bm]: [b],
    },
    code: 1,
    signal: 'sigblerp',
    runtime: 1000.000001,
    globalsAdded: ['foo'],
  })
})
