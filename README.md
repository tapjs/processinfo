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
node --loader=@tapjs/processinfo file.js

# wrap only CommonJS, idk why you'd want to do this, but it works
node --require=@tapjs/processinfo/cjs
```

To spawn a wrapped process from JavaScript, you can run:

```js
import {
  spawn,
  exec,
  execFile,
  execSync,
  execFileSync,
  fork,
} from '@tapjs/processinfo'
// any of these will work
const childProcess = spawn(cmd, args, options)
const childProcess = exec(cmd, options, callback)
const childProcess = execFile(cmd, options, callback)
const childProcess = spawnSync(cmd, args, options)
const childProcess = execSync(cmd, options)
const childProcess = execFileSync(cmd, options)
const childProcess = fork(cmd, options)
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
const processInfoDB = await ProcessInfo.load()
// say we wanted to find all the files loaded by the process 'foo'
const proc = processInfoDB.externalIDs.get('foo')
console.error(`Files loaded by process named 'foo':`, proc.files)

// now let's find all any other named processes that loaded them
for (const f of proc.files) {
  for (const otherProc of processInfoDB.files.get(f)) {
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

## Controlling Coverage

To disable coverage entirely, set
`_TAPJS_PROCESSINFO_COVERAGE_=0` in the environment.

To exclude certain file paths from coverage, set the
`_TAPJS_PROCESSINFO_COV_EXCLUDE_` to a regular expression string.
By default, it will ignore:

- Anything in a folder named `node_modules`, `.tap`,
  `tap-snapshots`, `test`, `tests`, `__test__`, `__tests__`, or
  starting with `tap-testdir-`.
- Any file named `*.test.{ext}` where `{ext}` is one of js, cjs,
  mjs, ts, cts, mts, jsx, or tsx.

To include only a specific set of files for coverage (as with
node-tap's `coverage-map` option), set
`_TAPJS_PROCESSINFO_COV_FILES_` to a `\n` delimited list of the
files to include. These will have their coverage reported even if
they would be excluded by the `_TAPJS_PROCESSINFO_COV_EXCLUDE_`
regexp.

Note that coverage _instrumentation_ is by necessity enabled for
all files, but it's only written to disk if the file (or any of
its sources, if it has a sourcemap) is included.
