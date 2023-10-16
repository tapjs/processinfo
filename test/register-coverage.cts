process.env._TAPJS_PROCESSINFO_EXCLUDE_ = '/node_modules/'
process.env._TAPJS_PROCESSINFO_COV_EXCLUDE_ = '/node_modules|dist/'

import t from 'tap'

// this one we just run an integration test, because we need to catch
// when node/v8 change their API, and it's a huge amount of stuff to
// have to mock anyway.

import spawn from '@npmcli/promise-spawn'
import fs, { readFileSync } from 'fs'
import { resolve } from 'path'
import { pathToFileURL } from 'url'

const mod = require.resolve('../dist/commonjs/register-coverage.js')
const sourcesMod = require.resolve('../dist/commonjs/lookup-sources.js')
const fsmMod = require.resolve('../dist/commonjs/find-source-map-safe.js')

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
  const lineLengthMod = require.resolve('../dist/commonjs/line-lengths.js')
  const diffUrl = String(pathToFileURL(require.resolve('diff')))
  const dir = t.testdir({
    'r.js': `
      const { saveLineLengths } = require(${JSON.stringify(lineLengthMod)})
      const { readFileSync } = require('fs')
      const mods = [__filename, './x.js', 'diff'].map(m => require.resolve(m))
      for (const m of mods) {
        const content = readFileSync(m, 'utf8')
        saveLineLengths(m, content)
      }
      const {coverageOnProcessEnd, register} = require(${JSON.stringify(
        mod
      )})
      const {findSourceMapSafe} = require(${JSON.stringify(fsmMod)})
      register()
      process.on('exit', (code, signal) => {
        findSourceMapSafe(${JSON.stringify(diffUrl)})
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
  const f = String(pathToFileURL(require.resolve('diff')))
  const content = readFileSync(require.resolve('diff'), 'utf8')
  const lineLengths = content.split(/\n/).map(l => l.length)
  t.strictSame(lineLengths, cov['source-map-cache'][f].lineLengths)
})

t.test('coverage of specific files enabled', async t => {
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
        // exclude nothing
        _TAPJS_PROCESSINFO_COV_EXCLUDE_: '/$./',
        _TAPJS_PROCESSINFO_COV_FILES_: resolve(dir, 'x.js'),
      },
      stdio: 'inherit',
      cwd: dir,
    }
  )
  const cov = require(resolve(dir, '.tap/coverage/uuid-0.json'))
  // got one entries
  t.match(cov, {
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
  // no sourcemaps found
  t.same(cov['source-map-cache'], {})
})

t.test('coverage of specific files disabled', async t => {
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
        // exclude this file in particular
        _TAPJS_PROCESSINFO_COV_EXCLUDE_:
          '/^.*(node_modules|dist[\\\\/](commonjs|esm))[\\\\/].*$/',
        _TAPJS_PROCESSINFO_COV_EXCLUDE_FILES_: resolve(dir, 'r.js'),
      },
      stdio: 'inherit',
      cwd: dir,
    }
  )
  const cov = require(resolve(dir, '.tap/coverage/uuid-0.json'))
  // got one entries
  t.match(cov, {
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

t.test('coverage of specific files enabled with esm urls', async t => {
  const ysrc = resolve(__dirname, 'fixtures/y.mjs')

  // go through a sourcemap, since that's where it was falling over
  // also, include a search param on the url, for added chaos
  const y = pathToFileURL(resolve(__dirname, 'fixtures/y.min.mjs'))
  y.searchParams.set('blah', 'bloo')

  const dir = t.testdir({
    'r.cjs': `
      const {coverageOnProcessEnd, register} = require(${JSON.stringify(
        mod
      )})
      register()
      const {likelyHasSourceMap} = require(${JSON.stringify(sourcesMod)})
      const {findSourceMapSafe} = require(${JSON.stringify(fsmMod)})
      process.on('exit', (code, signal) => {
        findSourceMapSafe(${JSON.stringify(String(y))})
        likelyHasSourceMap(${JSON.stringify(String(y))})
        coverageOnProcessEnd(${JSON.stringify(t.testdirName)}, {
          uuid: 'uuid-0',
          files: { // not an actual array, everything included yolo
            includes: () => true,
          }
        })
      })
    `,
    'x.mjs': `
      import * as y from ${JSON.stringify(String(y))}
      export default y
    `,
  })

  await spawn(
    process.execPath,
    ['--enable-source-maps', `--require=${dir}/r.cjs`, `${dir}/x.mjs`],
    {
      env: {
        ...process.env,
        _TAPJS_PROCESSINFO_COVERAGE_: '1',
        // exclude nothing
        _TAPJS_PROCESSINFO_COV_EXCLUDE_: '/$./',
        _TAPJS_PROCESSINFO_COV_FILES_: ysrc,
      },
      stdio: 'inherit',
      cwd: dir,
    }
  )

  const cov = require(resolve(dir, '.tap/coverage/uuid-0.json'))
  // got one entries
  t.match(cov, {
    result: [
      {
        scriptId: /^[0-9]+$/,
        url: String(y),
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
    'source-map-cache': {
      [String(y)]: {
        data: {
          version: 3,
          sources: [String(pathToFileURL(ysrc))],
          sourcesContent: [String],
          mappings: String,
          names: ['diff'],
          sourceRoot: '',
        },
      },
    },
  })
  t.equal(cov.result.length, 1)
})
