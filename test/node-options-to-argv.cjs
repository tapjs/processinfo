const t = require('tap')
const {nodeOptionsToArgv} = require('../lib/node-options-to-argv.cjs')
const cases = [
  [['--loader', 'has " quotes'], '"--loader" "has \\" quotes"'],
  [['--loader', 'has \\" escape'], '"--loader" "has \\\\" escape"'],
  [['--loader=has " quotes'], '"--loader=has \\" quotes"'],
  [['--x', '--y', '"asdf" foo'], '"--x" "--y" "\\"asdf\\" foo"'],
  [[], ''],
  // this isn't _quite_ right, but Node would throw it out anyway
  [['--x', '--y \\asdf" foo'], '--x --y" "\\"asdf\\" foo"'],
  [[], '--invalid "unfinished quote'],
]

t.plan(cases.length)
for (const [expect, options] of cases) {
  t.same(nodeOptionsToArgv(options), expect, { options })
}