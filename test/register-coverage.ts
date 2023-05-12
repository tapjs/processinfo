process.env._TAPJS_PROCESSINFO_EXCLUDE_ = '/node_modules/'
process.env._TAPJS_PROCESSINFO_COV_EXCLUDE_ = '/node_modules/'

import t from 'tap'

// this one we just run an integration test, because we need to catch
// when node/v8 change their API, and it's a huge amount of stuff to
// have to mock anyway.

import spawn from '@npmcli/promise-spawn'
import fs from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'

const mod = require.resolve('../dist/cjs/register-coverage.js')

t.test('coverage disabled', async t => {
  const dir = t.testdir({
    'r.js': `
      const {coverageOnProcessEnd, register} = require(${JSON.stringify(
        mod
      )})
      register()
      process.on('beforeExit', (code, signal) => {
        coverageOnProcessEnd(${JSON.stringify(t.testdirName)}, {
          uuid: 'uuid-0',
          files: [${JSON.stringify(resolve(t.testdirName, 'x.js'))}],
        })
      })
    `,
    'x.js': `
      require('diff')
    `,
  })
  await spawn(
    process.execPath,
    ['--enable-source-maps', `--require=${dir}/r.js`, `${dir}/x.js`],
    {
      env: {
        ...process.env,
        _TAPJS_PROCESSINFO_COVERAGE_: '0',
      },
      stdio: 'inherit',
      cwd: dir,
    }
  )
  t.throws(() => fs.statSync(`${dir}/.tap`))
})

t.test('coverage enabled', async t => {
  const dir = t.testdir({
    'r.js': `
      const {coverageOnProcessEnd, register} = require(${JSON.stringify(
        mod
      )})
      register()
      process.on('exit', (code, signal) => {
        coverageOnProcessEnd(${JSON.stringify(t.testdirName)}, {
          uuid: 'uuid-0',
          files: [${JSON.stringify(resolve(t.testdirName, 'x.js'))}],
        })
      })
    `,
    'x.js': `
      require('diff')
    `,
  })
  await spawn(
    process.execPath,
    ['--enable-source-maps', `--require=${dir}/r.js`, `${dir}/x.js`],
    {
      env: {
        ...process.env,
        _TAPJS_PROCESSINFO_COVERAGE_: '1',
      },
      stdio: 'inherit',
      cwd: dir,
    }
  )
  t.match(require(resolve(dir, '.tap/coverage/uuid-0.json')), {
    result: [
      {
        scriptId: /^[0-9]+$/,
        url: String(pathToFileURL(resolve(dir, 'x.js'))),
        functions: [
          {
            functionName: '',
            ranges: [
              {
                startOffset: 0,
                endOffset: Number,
                count: 1,
              },
            ],
            isBlockCoverage: true,
          },
        ],
      },
    ],
    timestamp: Number,
    'source-map-cache': {},
  })
})

t.test('coverage of diff module enabled', async t => {
  const dir = t.testdir({
    'r.js': `
      const {coverageOnProcessEnd, register} = require(${JSON.stringify(
        mod
      )})
      register()
      process.on('exit', (code, signal) => {
        coverageOnProcessEnd(${JSON.stringify(t.testdirName)}, {
          uuid: 'uuid-0',
          files: { // not an actual array, everything included yolo
            includes: () => true,
          }
        })
      })
    `,
    'x.js': `
      require('diff')
    `,
  })
  await spawn(
    process.execPath,
    ['--enable-source-maps', `--require=${dir}/r.js`, `${dir}/x.js`],
    {
      env: {
        ...process.env,
        _TAPJS_PROCESSINFO_COVERAGE_: '1',
        _TAPJS_PROCESSINFO_COV_EXCLUDE_:
          '/^(?!.*node_modules[\\\\/]diff\\b.*$).*$/',
      },
      stdio: 'inherit',
      cwd: dir,
    }
  )
  const cov = require(resolve(dir, '.tap/coverage/uuid-0.json'))
  // got multiple entries
  t.match(cov, {
    result: [{}, {}, {}],
    timestamp: Number,
    'source-map-cache': {},
  })
  // not an empty object
  t.notSame(cov['source-map-cache'], {})
})
