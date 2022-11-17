/// <reference types="node" />
import {
  spawn,
  spawnSync,
  exec,
  execSync,
  execFile,
  execFileSync,
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
  static get spawn(): typeof spawn
  static get spawnSync(): typeof spawnSync
  static get exec(): typeof exec
  static get execSync(): typeof execSync
  static get execFile(): typeof execFile
  static get execFileSync(): typeof execFileSync
}

export = ProcessInfo
