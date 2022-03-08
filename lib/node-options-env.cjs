const cjsLoader = require.resolve('./cjs.cjs')
const esmLoader = require.resolve('./esm.mjs')

const hasCJSLoader = args =>
  hasLoader(args, ['-r', '--require'], cjsLoader)

const hasESMLoader = args =>
  hasLoader(args, ['--experimental-loader', '--loader'], esmLoader, true)

const addCJS = args => !hasCJSLoader(args)
  ? args.concat('--require=' + cjsLoader)
  : args
const addESM = args => !hasESMLoader(args)
  ? args.concat('--loader=' + pathToFileURL(esmLoader))
  : args

const cjsOnly = args => hasESMLoader(args) ? false : hasCJSLoader(args)

const {nodeOptionsToArgv} = require('./node-options-to-argv.cjs')
const {argvToNodeOptions} = require('./argv-to-node-options.cjs')
const {fileURLToPath, pathToFileURL} = require('url')

const { resolve } = require('path')
const resolveLoader = path => require.resolve(
  /^\.?\.[\\/]/.test(path) ? resolve(path)
  : /^file:/.test(path) ? fileURLToPath(path)
  : path
)

const decode = (path, isURI) =>
  !isURI ? path
  : /^file:/.test(path) ? fileURLToPath(path)
  : decodeURIComponent(path)

const hasLoader = (args, keys, value, isURI = false) => {
  value = decode(value, isURI)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    // -r <value>
    if (keys.includes(arg) && i < args.length - 1 &&
        resolveLoader(decode(args[i + 1], isURI)) === value) {
      return true
    } else if (arg.startsWith('--') && arg.includes('=')) {
      // --require=<value>
      const [k, ...rest] = arg.split('=')
      if (keys.includes(k) &&
          resolveLoader(decode(rest.join('='), isURI)) === value) {
        return true
      } else {
        continue
      }
    }
  }
  return false
}

const nodeOptionsEnv = (env, args) => {
  const no = nodeOptionsToArgv(env.NODE_OPTIONS)
  return argvToNodeOptions(cjsOnly(args.concat(no)) ? addCJS(no) : addESM(no))
}

module.exports = { nodeOptionsEnv }
