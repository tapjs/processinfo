import { argvToNodeOptions } from './argv-to-node-options.js'
import {
  cjsLoader,
  cjsMatch,
  esmLoader,
  esmMatch,
} from './loader-paths.js'
import { nodeOptionsToArgv } from './node-options-to-argv.js'

// Check if our esm and/or cjs loaders are in the list,
// and only add them if not.

const hasCJSLoader = (args: string[]) =>
  hasLoader(args, ['-r', '--require'], cjsMatch)

const hasESMLoader = (args: string[]) =>
  hasLoader(args, ['--experimental-loader', '--loader'], esmMatch)

const addCJS = (args: string[]) =>
  !hasCJSLoader(args) ? args.concat('--require=' + cjsLoader) : args

const addESM = (args: string[]) =>
  !hasESMLoader(args) ? args.concat('--loader=' + esmLoader) : args

const cjsOnly = (args: string[]) =>
  hasESMLoader(args) ? false : hasCJSLoader(args)

const hasLoader = (
  args: string[],
  keys: string[],
  test: (s: string) => boolean
) => {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    // -r <value>
    // --loader <value>
    if (keys.includes(arg) && i < args.length - 1) {
      if (test(args[i + 1])) {
        return true
      } else {
        continue
      }
    } else if (arg.startsWith('--') && arg.includes('=')) {
      // --require=<value>
      // --loader=<value>
      const [k, ...rest] = arg.split('=')
      if (keys.includes(k) && test(rest.join('='))) {
        return true
      } else {
        continue
      }
    } else if (
      !arg.startsWith('--') &&
      arg.startsWith('-') &&
      arg.length > 2 &&
      keys.includes(arg.substring(0, 2))
    ) {
      // -r<value>
      if (test(arg.substring(2))) {
        return true
      } else {
        continue
      }
    }
  }
  return false
}

const addIgnoreLoadersWarning = (args: readonly string[]) =>
  args.includes('--no-warnings') ||
  args.includes('--no-warnings=ExperimentalLoader')
    ? args
    : args.concat('--no-warnings=ExperimentalLoader')

export const nodeOptionsEnv = (
  env: NodeJS.ProcessEnv,
  args: ReadonlyArray<string>
) => {
  const no = nodeOptionsToArgv(env.NODE_OPTIONS)
  return argvToNodeOptions(
    cjsOnly(args.concat(no))
      ? addCJS(no)
      : addIgnoreLoadersWarning(addESM(no))
  )
}
