import t from 'tap'
import('../dist/mjs/loader-legacy.mjs').then(e => {
  t.strictSame(Object.keys(e), ['globalPreload', 'load'])
  t.match(e, { globalPreload: Function, load: Function })
})
