import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import t from 'tap'

// same as the default, but do not exclude testdir paths.
export const exclude =
  /(^|[\\\/])(node_modules|\.tap|tap-snapshots|tests?|[^\\\/]+\.test\.([cm]?[jt]s|[jt]sx?)|__tests?__)([\\\/]|$)/i

const dir = t.testdir({
  'otherload.mjs': `
    export const load = async (url, context, next) => {
      console.log('otherload', url)
      return next(url + '?otherload', context, next)
    }
  `,
  'otherresolve.mjs': `
    export const resolve = async (url, context, next) => {
      return next(url + '?otherresolve', context, next)
    }
  `,
  'otherhook.mjs': `
    export const load = async (url, context, next) => {
      console.log('otherhook load', url)
      return next(url + '?otherhook-load', context, next)
    }
    export const resolve = async (url, context, next) => {
      return next(url + '?otherhook-resolve', context, next)
    }
  `,
  'file.mjs': 'console.log(import.meta.url)',
})

const otherHooks = [
  'otherload.mjs',
  'otherresolve.mjs',
  'otherhook.mjs',
].map(s => `--loader=${pathToFileURL(resolve(dir, s))}`)

const esmLoader = String(
  pathToFileURL(resolve(__dirname, '../dist/esm/loader-legacy.mjs'))
)

t.test('alone', async t => {
  const result = spawnSync(
    process.execPath,
    ['--enable-source-maps', '--loader', esmLoader, dir + '/file.mjs'],
    {
      env: Object.assign(
        {
          ...process.env,
        },
        {
          _TAPJS_PROCESSINFO_EXCLUDE_: exclude,
        }
      ),
    }
  )
  t.equal(result.status, 0)
  t.match(result.stdout.toString(), /^file:.*?\/file.mjs\n$/)
})

t.test('with others', async t => {
  const result = spawnSync(
    process.execPath,
    [
      '--enable-source-maps',
      '--loader',
      esmLoader,
      ...otherHooks,
      dir + '/file.mjs',
    ],
    {
      env: Object.assign(
        {
          ...process.env,
        },
        {
          _TAPJS_PROCESSINFO_EXCLUDE_: exclude,
        }
      ),
    }
  )
  t.equal(result.status, 0)
  const lines = result.stdout.toString().trim().split('\n')
  t.match(
    new Set(lines),
    new Set([
      /^otherhook load file:.*?\/file.mjs\?otherhook-resolve\?otherresolve$/,
      /^otherload file:.*?\/file.mjs\?otherhook-resolve\?otherresolve\?otherhook-load$/,
      /^file:.*?\/file.mjs\?otherhook-resolve\?otherresolve\?otherhook-load\?otherload$/,
    ])
  )
})

t.test('extensionless does not blow up, it is just cjs', async t => {
  const dir = t.testdir({
    program: `console.log('hello')`,
    'program.cjs': `console.log('hello')`,
    'program.mjs': `console.log('hello')`,
    'program.js': `console.log('hello')`,
  })
  for (const p of ['program', 'program.cjs']) {
    const result = spawnSync(process.execPath, [
      '--no-warnings',
      '--loader',
      esmLoader,
      resolve(dir, p),
    ])
    t.equal(result.status, 0)
    t.equal(result.stdout.toString().trim(), 'hello')
  }
})
