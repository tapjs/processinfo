import t from 'tap'
import('../dist/esm/loader-legacy.mjs').then(e => {
  t.strictSame(Object.keys(e), ['globalPreload', 'load'])
  t.match(e, { globalPreload: Function, load: Function })
})
