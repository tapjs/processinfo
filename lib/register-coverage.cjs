// start tracking coverage, unless disabled explicltly
// export so that we know to collect at the end of the process
const enabled = process.env._TAPJS_PROCESSINFO_COVERAGE_ !== '0'
if (enabled) {
  process.env._TAPJS_PROCESSINFO_COVERAGE_ = '1'
  process.setSourceMapsEnabled(true)

  // NB: coverage exclusion is in addition to processinfo
  // exclusion.  Only show coverage for a file we care
  // about at least somewhat, but coverage is a subset.
  const {getExclude} = require('./get-exclude.cjs')
  const exclude = getExclude('_TAPJS_PROCESSINFO_COV_EXCLUDE_')
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

  const lineLengths = f =>
    readFileSync(f, 'utf8').split(/\n|\u2028|\u2029/).map(l => l.length)

  const {mkdirSync, writeFileSync, readFileSync} = require('fs')

  const coverageOnProcessEnd = (cwd, processInfo) => {
    const f = `${cwd}/.tap/coverage/${processInfo.uuid}.json`
    mkdirSync(`${cwd}/.tap/coverage`, { recursive: true })

    session.post('Profiler.takePreciseCoverage', (er, cov) => {
      session.post('Profiler.stopPreciseCoverage')

      /* istanbul ignore next - something very strange and bad happened */
      if (er) {
        throw er
      }

      const sourceMapCache = cov['source-map-cache'] = {}
      cov.result = cov.result.filter(obj => {
        if (!/^file:/.test(obj.url)) {
          return false
        }
        const f = fileURLToPath(obj.url)
        if (!processInfo.files.includes(f) || exclude.test(f)) {
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

      writeFileSync(f, JSON.stringify(cov, 0, 2) + '\n', 'utf8')
    })
  }

  module.exports = {coverageOnProcessEnd}
} else {
  module.exports = {coverageOnProcessEnd: () => {}}
}
