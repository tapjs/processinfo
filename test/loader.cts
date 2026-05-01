import t from 'tap'
import('../dist/esm/loader.mjs').then(e => {
  const keys = Object.keys(e).filter(k => k !== 'default')
  t.strictSame(keys, ['initialize', 'load'])
  t.match(e, { initialize: Function, load: Function })
})
