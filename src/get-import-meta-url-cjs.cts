/**
 * Get the import.meta.url for a module
 * abstracted to be able to do CJS and ESM versions.
 *
 * CommonJS version
 */
import { pathToFileURL } from 'url'
export const getImportMetaURL = (target: string) =>
  String(new URL(target, pathToFileURL(__filename)))
