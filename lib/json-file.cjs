// read the file and json decode it, if anything fails, return {}

const { readFile } = require('fs/promises')
const { readFileSync } = require('fs')

const safeJSONSync = f => {
  try {
    return JSON.parse(readFileSync(f, 'utf8'))
  } catch (e) {
    return {}
  }
}

const safeJSON = f =>
  readFile(f, 'utf8').then(d => JSON.parse(d)).catch(() => ({}))

module.exports = { safeJSON, safeJSONSync }
