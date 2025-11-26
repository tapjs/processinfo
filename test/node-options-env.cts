import t from 'tap'
import { removePath } from './fixtures/remove-path'

import Module from 'module'
import { argvToNodeOptions } from 'node-options-to-argv'

import { relative, resolve, sep } from 'path'
import { pathToFileURL } from 'url'

t.formatSnapshot = o =>
  removePath(
    removePath(o, process.cwd(), '{CWD}'),
    '/Users/isaacs/dev/tapjs/processinfo',
    '{CWD}',
  )

const legacyAbs = resolve(__dirname, '../dist/esm/loader-legacy.mjs')
const legacyRel = './' + relative(process.cwd(), legacyAbs)
const legacyURL = String(pathToFileURL(legacyAbs))
const importAbs = resolve(__dirname, '../dist/esm/import.mjs')
const importRel = '.' + sep + relative(process.cwd(), importAbs)
const importURL = String(pathToFileURL(importAbs))

const cwdEnc = encodeURIComponent(process.cwd().replace(/\\/g, '/'))

t.cleanSnapshot = s =>
  s
    .split(legacyURL)
    .join('{LOADER URL}')
    .split(legacyRel.replace(/"/g, '\\"'))
    .join('{LOADER REL}')
    .split(legacyAbs.replace(/"/g, '\\"'))
    .join('{LOADER ABS}')
    .split(importURL)
    .join('{IMPORT URL}')
    .split(importAbs.replace(/"/g, '\\"'))
    .join('{IMPORT ABS}')
    .split(importRel.replace(/"/g, '\\"'))
    .join('{IMPORT REL}')
    .split(cwdEnc.replace(/"/g, '\\"'))
    .join('{CWD}')

const cases: Record<string, string | undefined | string[]> = {
  empty: undefined,
  'empty no-warnings': '--no-warnings',
  'empty no-warnings=ExperimentalLoader':
    '--no-warnings=ExperimentalLoader',
  'some random stuff': '--x y -z',
  'legacy loader url with no-warnings': [
    '--loader',
    legacyURL,
    '--no-warnings',
  ],
  'legacy loader url with no-warnings=ExperimentalLoader': [
    '--loader',
    legacyURL,
    '--no-warnings=ExperimentalLoader',
  ],

  'legacy loader url': ['--loader', legacyURL],
  'args has legacy loader url =': [`--loader=${legacyURL}`],
  'args has legacy loader relative': [`--loader=${legacyRel}`],
  'args has esm absolute': ['--loader', legacyAbs],
  'esm url': ['--loader', legacyURL],
  'esm url =': `--loader=${legacyURL}`,
  'esm url = no warning': `--loader=${legacyURL} --no-warnings`,
  'esm url = no warning=exploader': `--loader=${legacyURL} --no-warnings=ExperimentalLoader`,

  'esm relative': `--loader=${legacyRel}`,
  'esm absolute': ['--loader', legacyAbs],

  'exp args esm url': ['--experimental-loader', legacyURL],
  'exp args esm url =': [`--experimental-loader=${legacyURL}`],
  'exp args esm relative': `--experimental-loader=${legacyRel}`,
  'exp args esm absolute': ['--experimental-loader', legacyAbs],

  'import relative': [`--import=${importRel}`],
  'import absolute': ['--import', importAbs],

  'has both': ['--import', importRel, '--loader=' + legacyURL],
  'other loader': ['--loader', 'some-file.ts'],
  'multiple loaders': [
    '--loader',
    'some-file.ts',
    '--loader',
    '/some/path/to/index.import',
  ],

  'other import': ['--import', 'some-file.ts'],
  'multiple import': [
    '--import',
    'some-file.ts',
    '--import',
    '/some/path/to/index.import',
  ],

  'loader not found': ['--loader', 'not foud'],
  'loader value missing': ['--loader'],
  'import not found': ['--import', 'not foud'],
  'import value missing': ['--import'],
  'import multiple times': [
    '--import',
    importURL,
    `--import=${importRel}`,
    `--import=${importAbs}`,
    '--import',
    importURL,
    `--import=${importRel}`,
    `--import=${importAbs}`,
  ],
  'loader multiple times': [
    '--loader',
    legacyURL,
    `--loader=${legacyRel}`,
    `--loader=${legacyAbs}`,
    '--loader',
    legacyURL,
    `--loader=${legacyRel}`,
    `--loader=${legacyAbs}`,
  ],

  doubledash: ['--import=whatever', '--', `--loader=${legacyURL}`],
}

const run = (
  nodeOptionsEnv: (typeof import('../dist/commonjs/node-options-env'))['nodeOptionsEnv'],
  t: Tap.Test,
) => {
  for (const [name, opt] of Object.entries(cases)) {
    const v: string | undefined =
      opt === undefined || typeof opt === 'string' ?
        opt
      : argvToNodeOptions(opt)
    t.test(name, t => {
      t.plan(7)
      t.matchSnapshot(nodeOptionsEnv({ NODE_OPTIONS: v }, []), name)
      t.matchSnapshot(
        nodeOptionsEnv({ NODE_OPTIONS: v }, [`--loader=${legacyURL}`]),
        name + ' with legacy loader',
      )
      t.matchSnapshot(
        nodeOptionsEnv({ NODE_OPTIONS: v }, [`--import=${importURL}`]),
        name + ' with import',
      )
      t.matchSnapshot(
        nodeOptionsEnv({ NODE_OPTIONS: v }, ['--loader', legacyURL]),
        name + ' with legacy loader no =',
      )
      t.matchSnapshot(
        nodeOptionsEnv({ NODE_OPTIONS: v }, ['--import', importURL]),
        name + ' with import no =',
      )
      t.matchSnapshot(
        nodeOptionsEnv({ NODE_OPTIONS: v }, ['--xyz']),
        name + ' with trailing flag',
      )
      t.matchSnapshot(
        nodeOptionsEnv({ NODE_OPTIONS: v }, [
          '--',
          `--import=${importURL}`,
        ]),
        name + ' with --',
      )
    })
  }
  t.end()
}

t.test('no require.register available', t => {
  const { nodeOptionsEnv } = t.mock(
    '../dist/commonjs/node-options-env.js',
    {
      module: Object.assign(Module, { register: undefined }),
    },
  )
  run(nodeOptionsEnv, t)
})

t.test('with require.register available', t => {
  const { nodeOptionsEnv } = t.mock(
    '../dist/commonjs/node-options-env.js',
    {
      module: Object.assign(Module, { register: () => {} }),
    },
  )
  run(nodeOptionsEnv, t)
})
