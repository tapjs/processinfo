# @tapjs/processinfo

A Node.js loader to track processes and which JavaScript files they load.

After the process has run, all wrapped process info is dumped to
`.tap/processinfo`.

The exported object can also be used to spawn processes, clear the
processinfo data, or load the processinfo data.

## USAGE

Run the top level process with a `--loader` or `--require` argument to
track all Node.js child processes.

```sh
# wrap both CommonJS and ESM
node --loader=@tapjs/processinfo/esm file.js

# wrap only CommonJS
node --require=@tapjs/processinfo/cjs
```

To spawn a wrapped process from JavaScript, you can run:

```js
const ProcessInfo = require('@tapjs/processinfo')
// any of these will work
const childProcess = ProcessInfo.spawn(cmd, args, options)
const childProcess = ProcessInfo.exec(cmd, options)
const childProcess = ProcessInfo.spawnSync(cmd, args, options)
const childProcess = ProcessInfo.execSync(cmd, options)
```

The `cmd` and `args` parameters are identical to the methods from the
Node.js `child_process` module. The `options` parameter is also identical,
but may also include an `externalID` field, which if set to a string, will
be used as the processinfo `externalID`.

If you just use the normal `spawn`/`exec` methods from the Node.js
`child_process` module, then the relevant environment variables will still
be tracked, unless explicitly set to `''` or some other value.

### Interacting with Process Info

To load the process info data, use the exported `ProcessInfo` class.

```js
const ProcessInfo = require('@tapjs/processinfo')

const processInfo = new ProcessInfo()
// returns
// {
//   roots: Set([ProcessInfo.Node, ...]) for each root process group
//   files: Map({ filename => Set([ProcessInfo.Node, ...]) }),
//   externalIDs: Map({ externalID => ProcessInfo.Node }),
//   uuids: Map({ uuid => ProcessInfo.Node }),
// }
// A ProcessInfo.Node looks like:
// {
//   date: iso date string,
//   argv,
//   execArgv,
//   cwd,
//   pid,
//   ppid,
//   uuid,
//   externalID,
//   parent: <ProcessInfo.Node or null for root node>,
//   root: <ProcessInfo.Node>,
//   children: [ProcessInfo.Node, ...],
//   files: [ filename, ... ],
//   code: unix exit code,
//   signal: terminating signal or null,
//   runtime: high resolution run time in ms,
// }
const data = await processInfo.load()
// say we wanted to find all the files loaded by the process 'foo'
const proc = data.externalIDs.get('foo')
console.error(`Files loaded by process named 'foo':`, proc.files)

// now let's find all any other named processes that loaded them
for (const f of proc.files) {
  for (const otherProc of data.files.get(f)) {
    // walk up the tree looking for a named process
    for (let parent = otherProc; parent; parent = parent.parent) {
      if (parent.externalID && parent !== proc) {
        console.error(`Also loaded by process ${parent.externalID}`)
      }
    }
  }
}
```

Note: unless there has been a previous wrapped process run, nothing will be
present in the data. That is, `data.root` will be null, and all the maps
will be empty.
