/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/get-process-info.ts TAP get the process info > root process info 1`] = `
Object {
  "argv": Array [
    "{NODE}",
    "{CWD}/test/get-process-info.ts",
  ],
  "cwd": "{CWD}",
  "date": "string",
  "execArgv": Array [],
  "files": Array [],
  "hrstart": Array [
    true,
    2,
  ],
  "NODE_OPTIONS": "",
  "parent": null,
  "pid": true,
  "ppid": true,
  "root": "uuid-0",
  "uuid": "uuid-0",
}
`

exports[`test/get-process-info.ts child process TAP get the process info child process info > child process info 1`] = `
Object {
  "argv": Array [
    "{NODE}",
    "{CWD}/test/get-process-info.ts",
    "child process",
  ],
  "cwd": "{CWD}",
  "date": "string",
  "execArgv": Array [],
  "files": Array [],
  "hrstart": Array [
    true,
    2,
  ],
  "NODE_OPTIONS": "",
  "parent": "uuid-0",
  "pid": true,
  "ppid": true,
  "root": "uuid-0",
  "uuid": "uuid-1",
}
`

exports[`test/get-process-info.ts eid process TAP get the process info external id process > process with external ID 1`] = `
Object {
  "argv": Array [
    "{NODE}",
    "{CWD}/test/get-process-info.ts",
    "eid process",
  ],
  "cwd": "{CWD}",
  "date": "string",
  "execArgv": Array [],
  "externalID": "external id",
  "files": Array [],
  "hrstart": Array [
    true,
    2,
  ],
  "NODE_OPTIONS": "",
  "parent": "uuid-1",
  "pid": true,
  "ppid": true,
  "root": "uuid-0",
  "uuid": "uuid-2",
}
`
