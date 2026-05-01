import t from 'tap'
import('../dist/esm/loader-legacy.mjs').then(e => {
  const keys = Object.keys(e).filter(k => k !== 'default')
  t.strictSame(keys, ['globalPreload', 'load'])
  t.match(e, { globalPreload: Function, load: Function })
})
