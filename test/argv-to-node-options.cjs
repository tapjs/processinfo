const t = require('tap')
const { argvToNodeOptions } = require('../lib/argv-to-node-options.cjs')
const cases = [
  [['--loader', 'has " quotes'], '"--loader" "has \\" quotes"'],
  [['--loader', 'has \\" escape'], '"--loader" "has \\\\" escape"'],
  [['--loader=has " quotes'], '"--loader=has \\" quotes"'],
  [['--x', '--y', '"asdf" foo'], '"--x" "--y" "\\"asdf\\" foo"'],
]

t.plan(cases.length)
for (const [argv, expect] of cases) {
  t.equal(argvToNodeOptions(argv), expect, { argv })
}
