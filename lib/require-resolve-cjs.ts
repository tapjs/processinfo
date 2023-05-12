// This is the CJS version which overwrites require-resolve.js
// This only works because all of this package's modules are in the same
// folder, so effectively have the same require.resolve results. It's not
// intended to be portable!
export const { resolve } = require
