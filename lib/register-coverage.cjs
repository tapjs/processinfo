// start tracking coverage, unless disabled explicltly
// export so that we know to collect at the end of the process
const enabled = process.env._TAPJS_PROCESSINFO_COVERAGE_ !== '0'
if (enabled) {
  // TODO: separate coverage exclusion from file loading exclusion
  // For example, we might want lib/foo.js to ONLY receive coverage
  // from test/foo.js, BUT, we still want to re-run tests for
  // lib/bar.js when foo changes, if bar includes foo.

  process.env._TAPJS_PROCESSINFO_COVERAGE_ = '1'
  process.setSourceMapsEnabled(true)
  const inspector = require('inspector')
  const session = new inspector.Session()
  module.exports.session = session
  session.connect()
  session.post('Profiler.enable')
  session.post('Runtime.enable')
  session.post(
    'Profiler.startPreciseCoverage',
    {callCount: true, detailed: true}
  )

  const {fileURLToPath} = require('url')
  const {findSourceMap} = require('module')

  const { split: StringProtoSplit } = String.prototype
  const split = (s, d) => StringProtoSplit.call(s, d)
  const {
    map: ArrayProtoMap,
    filter: ArrayProtoFilter,
  } = Array.prototype
  const map = (a, f) => ArrayProtoMap.call(a, f)
  const filter = (a, f) => ArrayProtoFilter.call(a, f)
  const lineLengths = f =>
    map(split(readFileSync(f, 'utf8'), /\n|\u2028|\u2029/), l => l.length)
  const JSONStringify = JSON.stringify

  const {getProcessInfo} = require('./get-process-info.cjs')
  const {mkdirSync, writeFileSync, readFileSync} = require('fs')

  const coverageOnProcessEnd = (cwd, processInfo) => {
    const f = `${cwd}/.tap/coverage/${processInfo.uuid}.json`
    mkdirSync(`${cwd}/.tap/coverage`, { recursive: true })

    session.post('Profiler.takePreciseCoverage', (err, cov) => {
      session.post('Profiler.stopPreciseCoverage')

      const sourceMapCache = cov['source-map-cache'] = {}
      cov.result = filter(cov.result, obj => {
        if (!/^file:/.test(obj.url)) {
          return false
        }
        const f = fileURLToPath(obj.url)
        if (!processInfo.files.includes(f)) {
          return false
        }
        // see if it has a source map
        const s = findSourceMap(f)
        if (s) {
          const {payload} = s
          sourceMapCache[obj.url] = Object.assign(Object.create(null), {
            lineLengths: lineLengths(f),
            data: payload,
          })
        }
        return true
      })

      writeFileSync(f, JSONStringify(cov, 0, 2) + '\n', 'utf8')
    })
  }

  module.exports = {coverageOnProcessEnd}
} else {
  module.exports = {coverageOnProcessEnd: () => {}}
}
