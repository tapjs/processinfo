import t from 'tap'
import('../dist/mjs/loader.mjs').then(e => {
  t.strictSame(Object.keys(e), ['initialize', 'load'])
  t.match(e, { initialize: Function, load: Function })
})
