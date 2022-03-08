const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k)
const cjsLoader = require.resolve('./cjs.cjs')
const esmLoader = require.resolve('./esm.mjs')
const hasCJSLoader = args => hasLoader(args, ['-r', '--require'], cjsLoader)
const hasESMLoader = args => hasLoader(args, ['--experimental-loader', '--loader'], esmLoader)
const addCJS = args => !hasCJSLoader(args) ? args.concat('--require', cjsLoader) : args
const addESM = args => !hasESMLoader(args) ? args.concat('--loader', esmLoader) : args
const cjsOnly = args => hasESMLoader(args) ? false : hasCJSLoader(args)

const hasLoader = (args, keys, value) => {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    // -r <value>
    if (keys.includes(arg) && i < args.length - 1 &&
        require.resolve(args[i + 1]) === value) {
      return true
    } else if (arg.startsWith('--') && arg.includes('=')) {
      // --require=<value>
      const [k, ...rest] = arg.split('=')
      if (keys.includes(k) && require.resolve(rest.join('=')) === value) {
        return true
      } else {
        continue
      }
    }
  }
  return false
}

const nodeOptionsEnv = (env, args) => {
  const no = (env.NODE_OPTIONS || '').split(/\s+/)
  const newNO = cjsOnly(args.concat(no)) ? addCJS(no) : addESM(no)
  return newNO.join(' ')
}

module.exports = { nodeOptionsEnv }
