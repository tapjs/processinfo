import t from 'tap'
import { argvToNodeOptions } from '../dist/commonjs/argv-to-node-options.js'
const cases: [string[], string][] = [
  [['--loader', 'has " quotes'], '"--loader" "has \\" quotes"'],
  [['--loader', 'has \\" escape'], '"--loader" "has \\\\" escape"'],
  [['--loader=has " quotes'], '"--loader=has \\" quotes"'],
  [['--x', '--y', '"asdf" foo'], '"--x" "--y" "\\"asdf\\" foo"'],
]

t.plan(cases.length)
for (const [argv, expect] of cases) {
  t.equal(argvToNodeOptions(argv), expect, JSON.stringify(argv))
}
