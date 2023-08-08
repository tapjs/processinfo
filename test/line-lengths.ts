// just here to explicitly hit the bit that C8 doesn't capture otherwise
import { resolve } from 'path'
import t from 'tap'
import {
  getLineLengths,
  saveLineLengths,
} from '../dist/cjs/line-lengths.js'

const contentNoSM = `#!/usr/bin/env node

console.log('hello, world')

process.exit(99)
`

const contentWithSM = `${contentNoSM}
//# sourceMappingURL=https://www.example.com/
`

t.equal(getLineLengths(resolve('/content/no-sm')), undefined)
t.equal(getLineLengths(resolve('/content/with-sm')), undefined)
saveLineLengths(`file://${resolve('/content/no-sm')}`, contentNoSM)
saveLineLengths(resolve('/content/with-sm'), contentWithSM)
t.strictSame(getLineLengths(resolve('/content/no-sm')), undefined)
t.strictSame(
  getLineLengths(`file://${resolve('/content/with-sm')}`),
  [19, 0, 27, 0, 16, 0, 45]
)
// but then the file gets transpiled, and now has a sm
saveLineLengths(`file://${resolve('/content/no-sm')}`, contentWithSM)
t.strictSame(
  getLineLengths(`file://${resolve('/content/no-sm')}`),
  getLineLengths(`file://${resolve('/content/with-sm')}`)
)
