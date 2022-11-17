/// <reference types="node" />
import {
  ChildProcess,
  ExecFileOptions,
  ExecFileSyncOptions,
  ExecOptions,
  ExecSyncOptions,
  SpawnOptions,
  SpawnSyncOptions,
} from 'node:child_process'

declare interface ProcessInfoOptions {
  dir?: string
  exclude?: RegExp
}

declare class ProcessInfoNode {
  public parent: ProcessInfoNode | null
  public children: ProcessInfoNode[] | null
  public files: string[] | null
  public externalID: string | null
  link(db: ProcessInfo): void
}

declare interface ProcessInfoSpawnOptions extends SpawnOptions {
  externalID?: string
}
declare interface ProcessInfoSpawnSyncOptions extends SpawnSyncOptions {
  externalID?: string
}
declare interface ProcessInfoExecSyncOptions extends ExecSyncOptions {
  externalID?: string
}
declare interface ProcessInfoExecOptions extends ExecOptions {
  externalID?: string
}
declare interface ProcessInfoExecFileSyncOptions extends ExecFileSyncOptions {
  externalID?: string
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

  constructor(options: ProcessInfoOptions)

  save(): Promise<void>
  saveSync(): void
  erase(): Promise<void>
  eraseSync(): void

  load(): Promise<ProcessInfo>
  loadSync(): ProcessInfo

  static get Node(): typeof ProcessInfoNode
  static get ProcessInfo(): typeof ProcessInfo

  static get spawn(): (
    cmd: string,
    args: string[],
    options: ProcessInfoSpawnOptions
  ) => ChildProcess
  static get spawnSync(): (
    cmd: string,
    args: string[],
    options: ProcessInfoSpawnSyncOptions
  ) => SpawnSyncReturns
  static get exec(): (
    cmd: string,
    options: ProcessInfoExecOptions,
    callback?: (
      error: ExecException | null,
      stdout: Buffer,
      stderr: Buffer
    ) => void
  ) => ChildProcess
  static get execSync(): (
    cmd: string,
    options: ProcessInfoExecSyncOptions
  ) => string | Buffer
  static get execFile(): (
    cmd: string,
    args: string[],
    options: ProcessInfoExecFileOptions
  ) => ChildProcess
  static get execFileSync(): (
    cmd: string,
    args: string[],
    options: ProcessInfoExecFileSyncOptions
  ) => string | Buffer
}

export = ProcessInfo
