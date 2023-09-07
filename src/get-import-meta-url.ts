/**
 * Get the import.meta.url for a module
 * abstracted to be able to do CJS and ESM versions.
 *
 * This is just a dummy export for TypeScript's benefit.
 */

import { pathToFileURL } from 'node:url'
export const getImportMetaURL = (target: string) =>
  String(new URL(target, pathToFileURL(process.cwd() + '/x')))
