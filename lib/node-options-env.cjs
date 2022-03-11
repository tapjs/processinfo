const cjsLoader = require.resolve('./cjs.cjs')
const esmLoader = require.resolve('./esm.mjs')

// esm --loader is actually last-wins, so only counts as having
// it if it's the last loader in line.  To get around that, we pass
// ALL loaders to our loader as ?a&b&c&...
//
// cjs --require stacks in order, so as long as it's there, it counts.

const hasCJSLoader = args =>
  hasLoader(args, ['-r', '--require'], cjsLoader)

const hasESMLoader = args =>
  hasLoader(args, ['--experimental-loader', '--loader'], esmLoader, true)

const addCJS = args => !hasCJSLoader(args)
  ? args.concat('--require=' + cjsLoader)
  : args
const addESM = args => squashLoaders(args)

const cjsOnly = args => hasESMLoader(args) ? false : hasCJSLoader(args)

const {nodeOptionsToArgv} = require('./node-options-to-argv.cjs')
const {argvToNodeOptions} = require('./argv-to-node-options.cjs')
const {fileURLToPath, pathToFileURL} = require('url')

const { resolve } = require('path')
const resolveLoader = (path, isURI) => {
  path = decode(path, isURI)
  try {
    return require.resolve(
      /^\.?\.[\\/]/.test(path) ? resolve(path)
      : path
    )
  } catch (e) {
    return path
  }
}

const decode = (path, isURI) =>
  !isURI ? path
  : /^file:/.test(path) ? fileURLToPath(path)
  : decodeURIComponent(path)

const squashLoaders = args => {
  const loaders = []
  const re = /^--(?:experimental-)?loader(?:=(.*))?$/
  const squashed = []
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const parsed = arg.match(re)
    if (!parsed) {
      squashed.push(arg)
      continue
    }
    const val = parsed[1] || args[++i]
    if (!val) {
      // --loader with no value anywhere, just put it back how it was
      // and let node barf on it
      squashed.push(arg, args[i - 1])
      continue
    }
    const resolved = resolveLoader(val, true)
    if (resolved === esmLoader) {
      continue
    }
    loaders.push(encodeURIComponent(val.replace(/\\/g, '/')))
  }
  const q = loaders.length ? '?' : ''
  squashed.push(`--loader=${pathToFileURL(esmLoader)}${q}${loaders.join('&')}`)
  return squashed
}

const hasLoader = (args, keys, value, isURI = false) => {
  value = decode(value, isURI)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    // -r <value>
    if (keys.includes(arg) && i < args.length - 1 &&
        resolveLoader(args[i + 1], isURI) === value) {
      return true
    } else if (arg.startsWith('--') && arg.includes('=')) {
      // --require=<value>
      const [k, ...rest] = arg.split('=')
      if (keys.includes(k) &&
          resolveLoader(rest.join('='), isURI) === value) {
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

module.exports = {nodeOptionsEnv}
