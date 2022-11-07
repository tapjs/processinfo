const t = require('tap')

// mocks
const exitHandlers = []
const onExit = (handler, opts) => {
  exitHandlers.push(handler)
  t.same(opts, { alwaysLast: true }, 'should get alwaysLast flag set')
}
const doExit = (code, signal) => {
  for (const fn of exitHandlers) {
    fn(code, signal)
  }
}

const registerCoverage = {
  called: false,
  coverageOnProcessEnd: () => (registerCoverage.called = true),
}

const { hrtime } = process
process.hrtime = ([s, ns] = [0, 0]) => [1 - s, 1 - ns]
t.teardown(() => Object.assign(process, { hrtime }))

const processInfo = {
  uuid: 'uuid',
  hrstart: process.hrtime(),
  files: ['foo.js', 'foo.js'],
}
const getProcessInfo = () => processInfo

const mkdirCalls = []
const writeFileCalls = []
const fsMock = {
  mkdirSync: (path, opt) => mkdirCalls.push([path, opt]),
  writeFileSync: (path, data, opt) => writeFileCalls.push([path, data, opt]),
}

const mocks = {
  'signal-exit': onExit,
  fs: { ...require('fs'), ...fsMock },
  '../lib/register-coverage.cjs': registerCoverage,
  '../lib/get-process-info.cjs': { getProcessInfo },
}

t.mock('../lib/register-process-end.cjs', mocks)
doExit(0, null)

t.equal(registerCoverage.called, true, 'called register coverage process end')
t.same(processInfo, {
  uuid: 'uuid',
  files: ['foo.js'],
  code: 0,
  signal: null,
  runtime: 0,
})

const { resolve } = require('path')
t.same(mkdirCalls, [
  [resolve(process.cwd(), '.tap/processinfo'), { recursive: true }],
])
t.same(writeFileCalls, [
  [
    resolve(process.cwd(), '.tap/processinfo/uuid.json'),
    JSON.stringify(processInfo) + '\n',
    'utf8',
  ],
])

global.foo = 'bar'

doExit(1, 'sigblerp')
t.same(processInfo, {
  uuid: 'uuid',
  files: ['foo.js'],
  code: 1,
  signal: 'sigblerp',
  runtime: 1000.000001,
  globalsAdded: ['foo'],
})
