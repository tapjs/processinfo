/**
 * Get the import.meta.url for a module
 * abstracted to be able to do CJS and ESM versions.
 *
 * ESM version
 */
export const getImportMetaURL = (target: string) =>
  //@ts-ignore
  String(new URL(target, import.meta.url))
