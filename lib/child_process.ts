// This wraps all of the various spawn methods such that externalID can be
// set in the options, and ensuring that the proper envs get set.
import {
  ChildProcess,
  ChildProcessByStdio,
  ChildProcessWithoutNullStreams,
  exec as cpExec,
  ExecException,
  execFile as cpExecFile,
  ExecFileException,
  ExecFileOptions,
  ExecFileOptionsWithBufferEncoding,
  ExecFileOptionsWithOtherEncoding,
  ExecFileOptionsWithStringEncoding,
  execFileSync as cpExecFileSync,
  ExecFileSyncOptions,
  ExecFileSyncOptionsWithBufferEncoding,
  ExecFileSyncOptionsWithStringEncoding,
  ExecOptions,
  execSync as cpExecSync,
  ExecSyncOptions,
  ExecSyncOptionsWithBufferEncoding,
  ExecSyncOptionsWithStringEncoding,
  fork as cpFork,
  ForkOptions,
  PromiseWithChild,
  spawn as cpSpawn,
  SpawnOptions,
  SpawnOptionsWithoutStdio,
  SpawnOptionsWithStdioTuple,
  spawnSync as cpSpawnSync,
  SpawnSyncOptions,
  SpawnSyncOptionsWithBufferEncoding,
  SpawnSyncOptionsWithStringEncoding,
  SpawnSyncReturns,
  StdioNull,
  StdioPipe,
} from 'child_process'
import type { ObjectEncodingOptions } from 'fs'
import type { Readable, Writable } from 'stream'
import { getExclude } from './get-exclude.js'
import { spawnOpts, WithExternalID } from './spawn-opts.js'

const promisify = Symbol.for('nodejs.util.promisify.custom')

// pull the old __promisify__ out of node's declared namespaces
type CP<T extends { __promisify__: any }> = T & {
  [promisify]: T['__promisify__']
}
type OldCP = { __promisify__: (...a: any) => any }
const customPromisify = <T extends OldCP>(e: T) =>
  // the node types list it as __promisify__ but it's actually the symbol
  /* c8 ignore start */
  (e as CP<T>)[promisify] || e.__promisify__
/* c8 ignore stop */

const k = '_TAPJS_PROCESSINFO_EXCLUDE_'

// coercion function when we know it's an array or something else
const isNotArray = <T extends { [k: string]: any }>(o: any): o is T =>
  !!o && typeof o === 'object' && !Array.isArray(o)

export function spawn(
  command: string,
  options?: WithExternalID<SpawnOptionsWithoutStdio>
): ChildProcessWithoutNullStreams
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
  >
): ChildProcessByStdio<Writable, Readable, Readable>
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>
  >
): ChildProcessByStdio<Writable, Readable, null>
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>
  >
): ChildProcessByStdio<Writable, null, Readable>
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>
  >
): ChildProcessByStdio<null, Readable, Readable>
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>
  >
): ChildProcessByStdio<Writable, null, null>
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>
  >
): ChildProcessByStdio<null, Readable, null>
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>
  >
): ChildProcessByStdio<null, null, Readable>
export function spawn(
  command: string,
  options: WithExternalID<
    SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>
  >
): ChildProcessByStdio<null, null, null>
export function spawn(
  command: string,
  options: WithExternalID<SpawnOptions>
): ChildProcess
export function spawn(
  command: string,
  args?: ReadonlyArray<string>,
  options?: SpawnOptionsWithoutStdio
): ChildProcessWithoutNullStreams
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>
): ChildProcessByStdio<Writable, Readable, Readable>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioNull>
): ChildProcessByStdio<Writable, Readable, null>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioPipe>
): ChildProcessByStdio<Writable, null, Readable>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>
): ChildProcessByStdio<null, Readable, Readable>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioPipe, StdioNull, StdioNull>
): ChildProcessByStdio<Writable, null, null>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioNull>
): ChildProcessByStdio<null, Readable, null>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioPipe>
): ChildProcessByStdio<null, null, Readable>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptionsWithStdioTuple<StdioNull, StdioNull, StdioNull>
): ChildProcessByStdio<null, null, null>
export function spawn(
  command: string,
  args: ReadonlyArray<string>,
  options: SpawnOptions
): ChildProcess

export function spawn(
  cmd: string,
  args?:
    | ReadonlyArray<string>
    | WithExternalID<SpawnOptions>
    | WithExternalID<SpawnOptionsWithoutStdio>
    | WithExternalID<
        SpawnOptionsWithStdioTuple<
          StdioNull | StdioPipe,
          StdioNull | StdioPipe,
          StdioNull | StdioPipe
        >
      >,
  options?:
    | WithExternalID<SpawnOptions>
    | WithExternalID<SpawnOptionsWithoutStdio>
    | WithExternalID<
        SpawnOptionsWithStdioTuple<
          StdioNull | StdioPipe,
          StdioNull | StdioPipe,
          StdioNull | StdioPipe
        >
      >
): ChildProcess | ChildProcessWithoutNullStreams {
  if (isNotArray<SpawnOptions>(args)) {
    options = args
    args = []
  }
  return cpSpawn(cmd, args || [], spawnOpts(options || {}, getExclude(k)))
}

export function spawnSync(command: string): SpawnSyncReturns<Buffer>
export function spawnSync(
  command: string,
  options: WithExternalID<SpawnSyncOptionsWithStringEncoding>
): SpawnSyncReturns<string>
export function spawnSync(
  command: string,
  options: WithExternalID<SpawnSyncOptionsWithBufferEncoding>
): SpawnSyncReturns<Buffer>
export function spawnSync(
  command: string,
  options?: WithExternalID<SpawnSyncOptions>
): SpawnSyncReturns<string | Buffer>
export function spawnSync(
  command: string,
  args: ReadonlyArray<string>
): SpawnSyncReturns<Buffer>
export function spawnSync(
  command: string,
  args: ReadonlyArray<string>,
  options: WithExternalID<SpawnSyncOptionsWithStringEncoding>
): SpawnSyncReturns<string>
export function spawnSync(
  command: string,
  args: ReadonlyArray<string>,
  options: WithExternalID<SpawnSyncOptionsWithBufferEncoding>
): SpawnSyncReturns<Buffer>
export function spawnSync(
  command: string,
  args?: ReadonlyArray<string>,
  options?: WithExternalID<SpawnSyncOptions>
): SpawnSyncReturns<string | Buffer>

export function spawnSync(
  cmd: string,
  args?:
    | WithExternalID<SpawnSyncOptionsWithStringEncoding>
    | WithExternalID<SpawnSyncOptionsWithBufferEncoding>
    | WithExternalID<SpawnSyncOptions>
    | ReadonlyArray<string>,
  options?:
    | WithExternalID<SpawnSyncOptionsWithStringEncoding>
    | WithExternalID<SpawnSyncOptionsWithBufferEncoding>
    | WithExternalID<SpawnSyncOptions>
) {
  if (isNotArray<SpawnSyncOptions>(args)) {
    options = args
    args = []
  }
  return cpSpawnSync(
    cmd,
    args || [],
    spawnOpts(options || {}, getExclude(k))
  )
}

export type ExecArgs =
  | [
      command: string,
      callback?: (
        error: ExecException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      command: string,
      options: WithExternalID<
        {
          encoding: 'buffer' | null
        } & ExecOptions
      >,
      callback?: (
        error: ExecException | null,
        stdout: Buffer,
        stderr: Buffer
      ) => void
    ]
  | [
      command: string,
      options: WithExternalID<
        {
          encoding: BufferEncoding
        } & ExecOptions
      >,
      callback?: (
        error: ExecException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      command: string,
      options: WithExternalID<
        {
          encoding: BufferEncoding
        } & ExecOptions
      >,
      callback?: (
        error: ExecException | null,
        stdout: string | Buffer,
        stderr: string | Buffer
      ) => void
    ]
  | [
      command: string,
      options: WithExternalID<ExecOptions>,
      callback?: (
        error: ExecException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      command: string,
      options:
        | WithExternalID<ObjectEncodingOptions & ExecOptions>
        | undefined
        | null,
      callback?: (
        error: ExecException | null,
        stdout: string | Buffer,
        stderr: string | Buffer
      ) => void
    ]
export function exec(...args: ExecArgs): ChildProcess {
  const [cmd, options, callback] = args
  if (typeof options === 'function') {
    return cpExec(cmd, spawnOpts<ExecOptions>({}, getExclude(k)), options)
  } else if (!options) {
    return cpExec(
      cmd,
      spawnOpts<ExecOptions>({}, getExclude(k)),
      callback as (
        error: ExecException | null,
        stdout: string | Buffer,
        stderr: string | Buffer
      ) => void
    )
  }

  return cpExec(
    cmd,
    spawnOpts(options, getExclude(k)),
    callback as (
      error: ExecException | null,
      stdout: string | Buffer,
      stderr: string | Buffer
    ) => void
  )
}

export namespace exec {
  export function __promisify__(command: string): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    command: string,
    options: WithExternalID<
      {
        encoding: 'buffer' | null
      } & ExecOptions
    >
  ): PromiseWithChild<{
    stdout: Buffer
    stderr: Buffer
  }>
  export function __promisify__(
    command: string,
    options: WithExternalID<
      {
        encoding: BufferEncoding
      } & ExecOptions
    >
  ): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    command: string,
    options: WithExternalID<ExecOptions>
  ): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    command: string,
    options?: WithExternalID<ObjectEncodingOptions & ExecOptions> | null
  ): PromiseWithChild<{
    stdout: string | Buffer
    stderr: string | Buffer
  }>
  export function __promisify__(
    command: string,
    options?:
      | WithExternalID<
          {
            encoding: 'buffer' | null
          } & ExecOptions
        >
      | WithExternalID<
          {
            encoding: BufferEncoding
          } & ExecOptions
        >
      | WithExternalID<ExecOptions>
      | WithExternalID<ObjectEncodingOptions & ExecOptions>
      | null
  ): PromiseWithChild<{
    stdout: string | Buffer
    stderr: string | Buffer
  }> {
    return customPromisify(cpExec)(
      command,
      spawnOpts(options || {}, getExclude(k))
    )
  }

  Object.assign(exec, { [promisify]: __promisify__ })
  /* c8 ignore start */
}
/* c8 ignore stop */

export function execSync(command: string): Buffer
export function execSync(
  command: string,
  options: WithExternalID<ExecSyncOptionsWithStringEncoding>
): string
export function execSync(
  command: string,
  options: WithExternalID<ExecSyncOptionsWithBufferEncoding>
): Buffer
export function execSync(
  command: string,
  options?: WithExternalID<ExecSyncOptions>
): string | Buffer
export function execSync(
  cmd: string,
  options?:
    | WithExternalID<ExecSyncOptions>
    | WithExternalID<ExecSyncOptionsWithBufferEncoding>
    | WithExternalID<ExecSyncOptionsWithStringEncoding>
    | WithExternalID<ExecSyncOptionsWithBufferEncoding>
): string | Buffer {
  return cpExecSync(
    cmd,
    spawnOpts<ExecSyncOptions>(options || {}, getExclude(k))
  )
}

export type ExecFileArgs =
  | []
  | [
      options:
        | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
        | undefined
        | null
    ]
  | [args?: ReadonlyArray<string> | null]
  | [
      args: ReadonlyArray<string> | undefined | null,
      options:
        | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
        | undefined
        | null
    ]
  | [
      callback: (
        error: ExecFileException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      args: ReadonlyArray<string> | undefined | null,
      callback: (
        error: ExecFileException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      options: WithExternalID<ExecFileOptionsWithBufferEncoding>,
      callback: (
        error: ExecFileException | null,
        stdout: Buffer,
        stderr: Buffer
      ) => void
    ]
  | [
      args: ReadonlyArray<string> | undefined | null,
      options: WithExternalID<ExecFileOptionsWithBufferEncoding>,
      callback: (
        error: ExecFileException | null,
        stdout: Buffer,
        stderr: Buffer
      ) => void
    ]
  | [
      options: WithExternalID<ExecFileOptionsWithStringEncoding>,
      callback: (
        error: ExecFileException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      args: ReadonlyArray<string> | undefined | null,
      options: WithExternalID<ExecFileOptionsWithStringEncoding>,
      callback: (
        error: ExecFileException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      options: WithExternalID<ExecFileOptionsWithOtherEncoding>,
      callback: (
        error: ExecFileException | null,
        stdout: string | Buffer,
        stderr: string | Buffer
      ) => void
    ]
  | [
      args: ReadonlyArray<string> | undefined | null,
      options: WithExternalID<ExecFileOptionsWithOtherEncoding>,
      callback: (
        error: ExecFileException | null,
        stdout: string | Buffer,
        stderr: string | Buffer
      ) => void
    ]
  | [
      options: WithExternalID<ExecFileOptions>,
      callback: (
        error: ExecFileException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      args: ReadonlyArray<string> | undefined | null,
      options: WithExternalID<ExecFileOptions>,
      callback: (
        error: ExecFileException | null,
        stdout: string,
        stderr: string
      ) => void
    ]
  | [
      options:
        | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
        | undefined
        | null,
      callback:
        | ((
            error: ExecFileException | null,
            stdout: string | Buffer,
            stderr: string | Buffer
          ) => void)
        | undefined
        | null
    ]
  | [
      args: ReadonlyArray<string> | undefined | null,
      options:
        | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
        | undefined
        | null,
      callback:
        | ((
            error: ExecFileException | null,
            stdout: string | Buffer,
            stderr: string | Buffer
          ) => void)
        | undefined
        | null
    ]
export function execFile(
  file: string,
  ...execFileArgs: ExecFileArgs
): ChildProcess {
  let args = []
  let options: WithExternalID<ObjectEncodingOptions & ExecFileOptions> = {}
  let callback: ((...a: any) => any) | undefined = undefined
  for (const arg of execFileArgs) {
    if (Array.isArray(arg)) {
      args = arg
    } else if (
      arg &&
      typeof arg === 'object' &&
      isNotArray<WithExternalID<ObjectEncodingOptions & ExecFileOptions>>(
        arg
      )
    ) {
      options = arg
    } else if (typeof arg === 'function') {
      callback = arg
    }
  }
  return cpExecFile(
    file,
    args,
    spawnOpts(options, getExclude(k)),
    callback
  )
}

export namespace execFile {
  export function __promisify__(file: string): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    file: string,
    args: ReadonlyArray<string> | undefined | null
  ): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    file: string,
    options: WithExternalID<ExecFileOptionsWithBufferEncoding>
  ): PromiseWithChild<{
    stdout: Buffer
    stderr: Buffer
  }>
  export function __promisify__(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options: WithExternalID<ExecFileOptionsWithBufferEncoding>
  ): PromiseWithChild<{
    stdout: Buffer
    stderr: Buffer
  }>
  export function __promisify__(
    file: string,
    options: WithExternalID<ExecFileOptionsWithStringEncoding>
  ): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options: WithExternalID<ExecFileOptionsWithStringEncoding>
  ): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    file: string,
    options: WithExternalID<ExecFileOptionsWithOtherEncoding>
  ): PromiseWithChild<{
    stdout: string | Buffer
    stderr: string | Buffer
  }>
  export function __promisify__(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options: WithExternalID<ExecFileOptionsWithOtherEncoding>
  ): PromiseWithChild<{
    stdout: string | Buffer
    stderr: string | Buffer
  }>
  export function __promisify__(
    file: string,
    options: WithExternalID<ExecFileOptions>
  ): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options: WithExternalID<ExecFileOptions>
  ): PromiseWithChild<{
    stdout: string
    stderr: string
  }>
  export function __promisify__(
    file: string,
    options:
      | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
      | undefined
      | null
  ): PromiseWithChild<{
    stdout: string | Buffer
    stderr: string | Buffer
  }>
  export function __promisify__(
    file: string,
    args: ReadonlyArray<string> | undefined | null,
    options:
      | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
      | undefined
      | null
  ): PromiseWithChild<{
    stdout: string | Buffer
    stderr: string | Buffer
  }>
  export function __promisify__(
    file: string,
    args?:
      | ReadonlyArray<string>
      | undefined
      | null
      | WithExternalID<ExecFileOptionsWithBufferEncoding>
      | WithExternalID<ExecFileOptionsWithStringEncoding>
      | WithExternalID<ExecFileOptionsWithOtherEncoding>
      | WithExternalID<ExecFileOptions>
      | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
      | WithExternalID<ObjectEncodingOptions & ExecFileOptions>,
    options?:
      | undefined
      | null
      | WithExternalID<ExecFileOptionsWithBufferEncoding>
      | WithExternalID<ExecFileOptionsWithStringEncoding>
      | WithExternalID<ExecFileOptionsWithOtherEncoding>
      | WithExternalID<ExecFileOptions>
      | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
      | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
  ): PromiseWithChild<{
    stdout: string | Buffer
    stderr: string | Buffer
  }> {
    if (
      !!args &&
      typeof args === 'object' &&
      isNotArray<
        | WithExternalID<ExecFileOptionsWithBufferEncoding>
        | WithExternalID<ExecFileOptionsWithStringEncoding>
        | WithExternalID<ExecFileOptionsWithOtherEncoding>
        | WithExternalID<ExecFileOptions>
        | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
        | WithExternalID<ObjectEncodingOptions & ExecFileOptions>
      >(args)
    ) {
      options = args
      args = []
    }
    return customPromisify(cpExecFile)(
      file,
      spawnOpts(options || {}, getExclude(k))
    )
  }
  Object.assign(execFile, { [promisify]: __promisify__ })
  /* c8 ignore start */
}
/* c8 ignore stop */

export function execFileSync(file: string): Buffer
export function execFileSync(
  file: string,
  options: WithExternalID<ExecFileSyncOptionsWithStringEncoding>
): string
export function execFileSync(
  file: string,
  options: WithExternalID<ExecFileSyncOptionsWithBufferEncoding>
): Buffer
export function execFileSync(
  file: string,
  options?: WithExternalID<ExecFileSyncOptions>
): string | Buffer
export function execFileSync(
  file: string,
  args: ReadonlyArray<string>
): Buffer
export function execFileSync(
  file: string,
  args: ReadonlyArray<string>,
  options: WithExternalID<ExecFileSyncOptionsWithStringEncoding>
): string
export function execFileSync(
  file: string,
  args: ReadonlyArray<string>,
  options: WithExternalID<ExecFileSyncOptionsWithBufferEncoding>
): Buffer
export function execFileSync(
  file: string,
  args?: ReadonlyArray<string>,
  options?: WithExternalID<ExecFileSyncOptions>
): string | Buffer
export function execFileSync(
  file: string,
  args?:
    | ReadonlyArray<string>
    | WithExternalID<ExecFileSyncOptions>
    | WithExternalID<ExecFileSyncOptionsWithStringEncoding>
    | WithExternalID<ExecFileSyncOptionsWithBufferEncoding>,
  options?:
    | WithExternalID<ExecFileSyncOptions>
    | WithExternalID<ExecFileSyncOptionsWithStringEncoding>
    | WithExternalID<ExecFileSyncOptionsWithBufferEncoding>
): string | Buffer {
  if (
    args &&
    typeof args === 'object' &&
    isNotArray<
      | WithExternalID<ExecFileSyncOptions>
      | WithExternalID<ExecFileSyncOptionsWithStringEncoding>
      | WithExternalID<ExecFileSyncOptionsWithBufferEncoding>
    >(args)
  ) {
    options = args
    args = []
  }
  return cpExecFileSync(
    file,
    args || [],
    spawnOpts(options || {}, getExclude(k))
  )
}

export function fork(
  modulePath: string,
  options?: ForkOptions
): ChildProcess
export function fork(
  modulePath: string,
  args?: ReadonlyArray<string>,
  options?: WithExternalID<ForkOptions>
): ChildProcess
export function fork(
  modulePath: string,
  args?: ForkOptions | ReadonlyArray<string>,
  options?: WithExternalID<ForkOptions>
): ChildProcess {
  if (isNotArray<ForkOptions>(args)) {
    options = args
    args = []
  }
  return cpFork(modulePath, args, spawnOpts(options || {}, getExclude(k)))
}
