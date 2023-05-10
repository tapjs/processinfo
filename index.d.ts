/// <reference types="node" />
import {
  ChildProcess,
  ExecException,
  ExecFileOptions,
  ExecFileSyncOptions,
  ExecOptions,
  ExecSyncOptions,
  SpawnOptions,
  SpawnSyncOptions,
  SpawnSyncReturns,
} from 'node:child_process'

declare interface ProcessInfoOptions {
  dir?: string
  exclude?: RegExp
}

declare class ProcessInfoNode {
  parent: ProcessInfoNode | null
  root: ProcessInfoNode | null
  children: ProcessInfoNode[] | null
  files: string[] | null
  externalID?: string | null
  uuid: string
  date: string
  argv: string[]
  execArgv: string[]
  pid: number
  ppid: number
  cwd: string
  code?: number | null
  signal: string | null
  runtime: number
  link(db: ProcessInfo): void
  NODE_OPTIONS?: string | null
}

declare interface ProcessInfoSpawnOptions extends SpawnOptions {
  externalID?: string
}

declare interface ProcessInfoSpawnSyncOptions extends SpawnSyncOptions {
  externalID?: string
}
declare interface ProcessInfoSpawnSyncOptionsWithStringEncoding
  extends ProcessInfoSpawnSyncOptions {
  encoding: BufferEncoding
}
interface ProcessInfoSpawnSyncOptionsWithBufferEncoding
  extends ProcessInfoSpawnSyncOptions {
  encoding?: 'buffer' | null | undefined
}

declare interface ProcessInfoExecSyncOptions extends ExecSyncOptions {
  externalID?: string
}
declare interface ProcessInfoExecSyncOptionsWithStringEncoding
  extends ProcessInfoExecSyncOptions {
  encoding: BufferEncoding
}
declare interface ProcessInfoExecSyncOptionsWithBufferEncoding
  extends ProcessInfoExecSyncOptions {
  encoding?: 'buffer' | null | undefined
}

declare interface ProcessInfoExecOptions extends ExecOptions {
  externalID?: string
}
declare interface ProcessInfoExecFileSyncOptions extends ExecFileSyncOptions {
  externalID?: string
}
declare interface ProcessInfoExecFileSyncOptionsWithStringEncoding
  extends ProcessInfoExecFileSyncOptions {
  encoding: BufferEncoding
}
declare interface ProcessInfoExecFileSyncOptionsWithBufferEncoding
  extends ProcessInfoExecFileSyncOptions {
  encoding?: 'buffer' | null | undefined
}
declare interface ProcessInfoExecFileOptions extends ExecFileOptions {
  externalID?: string
}

declare class ProcessInfo {
  public dir: string
  public exclude: RegExp
  public roots: Set<ProcessInfoNode>
  public files: Map<string, Set<ProcessInfoNode>>
  public uuids: Map<string, ProcessInfoNode>
  public externalIDs: Map<string, ProcessInfoNode>

  private pendingRoot: Map<string, ProcessInfoNode>
  private pendingParent: Map<string, ProcessInfoNode>

  constructor(options?: ProcessInfoOptions)

  save(): Promise<void>
  saveSync(): void
  erase(): Promise<void>
  eraseSync(): void

  load(): Promise<ProcessInfo>
  loadSync(): ProcessInfo

  static get Node(): typeof ProcessInfoNode
  static get ProcessInfo(): typeof ProcessInfo

  static spawn(
    cmd: string,
    args: string[],
    options: ProcessInfoSpawnOptions
  ): ChildProcess

  static spawnSync(cmd: string): SpawnSyncReturns<Buffer>
  static spawnSync(
    cmd: string,
    options: ProcessInfoSpawnSyncOptionsWithStringEncoding
  ): SpawnSyncReturns<string>
  static spawnSync(
    cmd: string,
    options: ProcessInfoSpawnSyncOptionsWithBufferEncoding
  ): SpawnSyncReturns<Buffer>
  static spawnSync(
    cmd: string,
    options?: ProcessInfoSpawnSyncOptions
  ): SpawnSyncReturns<string | Buffer>
  static spawnSync(
    cmd: string,
    args: readonly string[]
  ): SpawnSyncReturns<Buffer>
  static spawnSync(
    cmd: string,
    args: readonly string[],
    options: ProcessInfoSpawnSyncOptionsWithStringEncoding
  ): SpawnSyncReturns<string>
  static spawnSync(
    cmd: string,
    args: readonly string[],
    options: ProcessInfoSpawnSyncOptionsWithBufferEncoding
  ): SpawnSyncReturns<Buffer>
  static spawnSync(
    cmd: string,
    args?: readonly string[],
    options?: ProcessInfoSpawnSyncOptions
  ): SpawnSyncReturns<string | Buffer>

  static exec(
    cmd: string,
    options: ProcessInfoExecOptions,
    callback?: (
      error: ExecException | null,
      stdout: Buffer,
      stderr: Buffer
    ) => void
  ): ChildProcess

  static execSync(
    cmd: string,
    options: ProcessInfoExecSyncOptionsWithStringEncoding
  ): string
  static execSync(
    cmd: string,
    options: ProcessInfoExecSyncOptionsWithBufferEncoding
  ): Buffer
  static execSync(
    cmd: string,
    options?: ProcessInfoExecSyncOptions
  ): string | Buffer

  static execFile(
    cmd: string,
    args: string[],
    options: ProcessInfoExecFileOptions
  ): ChildProcess

  static execFileSync(file: string): Buffer
  static execFileSync(
    file: string,
    options: ProcessInfoExecFileSyncOptionsWithStringEncoding
  ): string
  static execFileSync(
    file: string,
    options: ProcessInfoExecFileSyncOptionsWithBufferEncoding
  ): Buffer
  static execFileSync(
    file: string,
    options?: ProcessInfoExecFileSyncOptions
  ): string | Buffer
  static execFileSync(file: string, args: readonly string[]): Buffer
  static execFileSync(
    file: string,
    args: readonly string[],
    options: ProcessInfoExecFileSyncOptionsWithStringEncoding
  ): string
  static execFileSync(
    file: string,
    args: readonly string[],
    options: ProcessInfoExecFileSyncOptionsWithBufferEncoding
  ): Buffer
  static execFileSync(
    file: string,
    args?: readonly string[],
    options?: ProcessInfoExecFileSyncOptions
  ): string | Buffer
}

export = ProcessInfo
