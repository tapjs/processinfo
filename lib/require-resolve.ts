// This is only the ESM version. For CJS, it's overwritten
// by the implementation in require-resolve-cjs.ts
// This only works because all of this package's modules are in the same
// folder, so effectively have the same require.resolve results. It's not
// intended to be portable!
import { createRequire } from 'module'
//@ts-ignore
export const { resolve } = createRequire(import.meta.url)
