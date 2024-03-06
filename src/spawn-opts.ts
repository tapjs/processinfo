import { ProcessEnvOptions } from 'child_process'
import { nodeOptionsEnv } from './node-options-env.js'

export type WithExternalID<T> = T & { externalID?: string }
const p = process

export const spawnOpts = <T extends { [k: string]: any }>(
  options: WithExternalID<T>,
  exclude?: RegExp | string,
  args?: readonly string[]
): Omit<T, 'externalID'> & { env: ProcessEnvOptions } => {
  const { externalID, ...rest } = options
  const env = { ...(options.env || p.env) }
  // only add if lacking in args, but this can come in multiple ways
  const a = [
    ...(options.execArgv ?? []),
    ...(args ?? []),
    ...(options.args ?? []),
  ]
  env.NODE_OPTIONS = nodeOptionsEnv(env, a)
  if (externalID) {
    env._TAPJS_PROCESSINFO_EXTERNAL_ID_ = externalID
  }
  if (exclude) {
    env._TAPJS_PROCESSINFO_EXCLUDE_ = String(exclude)
  }
  return { ...rest, env }
}
