// same as the default, but do not exclude testdir paths.
const exclude = String(
  /(^|[\\/])(node_modules|\.tap|tap-snapshots|\.test\.c?js|__tests?__)([\\/]|$)/i
)

import * as t from 'tap'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'

const dir = t.testdir({
  'otherload.mjs': `
    export const load = async (url, context, defaultFn) => {
      console.log('otherload', url)
      return defaultFn(url + '?otherload', context, defaultFn)
    }
  `,
  'otherresolve.mjs': `
    export const resolve = async (url, context, defaultFn) => {
      return defaultFn(url + '?otherresolve', context, defaultFn)
    }
  `,
  'otherhook.mjs': `
    export const load = async (url, context, defaultFn) => {
      console.log('otherhook load', url)
      return defaultFn(url + '?otherhook-load', context, defaultFn)
    }
    export const resolve = async (url, context, defaultFn) => {
      return defaultFn(url + '?otherhook-resolve', context, defaultFn)
    }
  `,
  'file.mjs': 'console.log(import.meta.url)',
})

const otherHooks = [
  pathToFileURL(resolve(dir, 'otherload.mjs')),
  pathToFileURL(resolve(dir, 'otherresolve.mjs')),
  pathToFileURL(resolve(dir, 'otherhook.mjs')),
].join('&')

import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const esmLoader = pathToFileURL(resolve(__dirname, '../lib/esm.mjs'))

t.test('alone', async t => {
  const result = spawnSync(
    process.execPath,
    ['--loader', esmLoader, dir + '/file.mjs'],
    {
      env: {
        ...process.env,
        _TAPJS_PROCESSINFO_EXCLUDE_: exclude,
      },
    }
  )
  t.equal(result.status, 0)
  t.match(result.stdout.toString(), /^file:.*?\/file.mjs\n$/)
})

t.test('with others', async t => {
  const result = spawnSync(
    process.execPath,
    ['--loader', `${esmLoader}?${otherHooks}`, dir + '/file.mjs'],
    {
      env: {
        ...process.env,
        _TAPJS_PROCESSINFO_EXCLUDE_: exclude,
      },
    }
  )
  t.equal(result.status, 0)
  const lines = result.stdout.toString().trim().split('\n')
  t.match(lines, [
    /^otherload file:.*?\/file.mjs\?otherresolve\?otherhook-resolve$/,
    /^otherhook load file:.*?\/file.mjs\?otherresolve\?otherhook-resolve\?otherload$/,
    /^file:.*?\/file.mjs\?otherresolve\?otherhook-resolve\?otherload\?otherhook-load$/,
  ])
})
