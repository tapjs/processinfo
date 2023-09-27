import t from 'tap'
import { nodeOptionsToArgv } from '../dist/commonjs/node-options-to-argv.js'
const cases: [expect: string[], options: string][] = [
  [['--loader', 'has " quotes'], '"--loader" "has \\" quotes"'],
  [['--loader', 'has \\" escape'], '"--loader" "has \\\\" escape"'],
  [['--loader=has " quotes'], '"--loader=has \\" quotes"'],
  [['--x', '--y', '"asdf" foo'], '"--x" "--y" "\\"asdf\\" foo"'],
  [[], ''],
  // this isn't _quite_ right, but Node would throw it out anyway
  [['--x', '--y \\asdf" foo'], '--x --y" "\\"asdf\\" foo"'],
  [['--require=.\\asdf.js'], '"--require=.\\asdf.js"'],
  [['--require=.\\asdf.js'], '--require=.\\asdf.js'],
  [[], '--invalid "unfinished quote'],
]

t.plan(cases.length)
for (const [expect, options] of cases) {
  t.same(nodeOptionsToArgv(options), expect, options)
}
