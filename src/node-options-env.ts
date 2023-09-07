import { argvToNodeOptions } from './argv-to-node-options.js'
import {
  legacyLoader,
  legacyMatch,
  importLoader,
  importMatch,
} from './loader-paths.js'
import { nodeOptionsToArgv } from './node-options-to-argv.js'

import Module from 'node:module'

const getKeyValue = (
  args: string[],
  i: number
): [boolean, string, string | undefined] => {
  const arg = args[i]
  if (arg.includes('=')) {
    const [k, ...rest] = arg.split('=')
    return [true, k, rest.join('=')]
  } else if (i < args.length - 1) {
    return [false, arg, args[i + 1]]
  } else {
    return [false, arg, undefined]
  }
}

const useImport = !!(Module as { register?: (...a: any[]) => any })
  .register

const addLoader = (args: string[]) => {
  const addKey = useImport ? '--import' : '--loader'
  const addValue = useImport ? importLoader : legacyLoader
  const doNotWantKeys = [
    '--experimental-loader',
    useImport ? '--loader' : '--import',
  ]
  const test = useImport ? importMatch : legacyMatch

  const added: string[] = []

  let doubledash = false
  let found = false
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg.startsWith('--') || doubledash) {
      added.push(arg)
      continue
    }
    if (arg === '--') {
      added.push(arg)
      doubledash = true
      continue
    }

    const [eq, k, v] = getKeyValue(args, i)
    if (!v) {
      // wasn't a key-value pair
      added.push(arg)
      continue
    }
    if (!eq) i++
    if (
      doNotWantKeys.includes(k) &&
      (importMatch(v) || legacyMatch(v))
    ) {
      // it's ours, but not how we want it, omit
      continue
    }

    if (k === addKey && test(v)) {
      // already present, don't let it be set multiple times.
      if (found) continue
      found = true
      added.push(arg)
      if (!eq) added.push(args[i])
    } else  {
      // not ours
      added.push(arg)
      if (!eq) added.push(args[i])
      continue
    }
  }
  if (!found) added.push(`${addKey}=${addValue}`)
  return !useImport ? addIgnoreLoadersWarning(added) : added
}

const addIgnoreLoadersWarning = (args: readonly string[]) =>
  args.includes('--no-warnings') ||
  args.includes('--no-warnings=ExperimentalLoader')
    ? args
    : args.concat('--no-warnings=ExperimentalLoader')

export const nodeOptionsEnv = (
  env: NodeJS.ProcessEnv,
) => {
  const no = nodeOptionsToArgv(env.NODE_OPTIONS)
  return argvToNodeOptions(addLoader(no))
}
