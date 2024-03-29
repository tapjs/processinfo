# 3.1

- Add ability to exclude specific files from coverage by path
- Use correct legacy loader for pre-20.6 node versions
- pre-load source maps to minimize calls at exit
- Only attempt final sourcemap lookup one time
- canonicalize source paths in sourcemap data
- do not add loader to NODE_OPTIONS if in args
- record unrecorded files that show up in coverage

# 3.0

- add support for --import and Module.register(), for node 20.6
  and beyond

# 2.4

- Put a filter function on `externalIDsChanged()`

# 2.3

- Add `externalIDsChanged()` method
- Add `descendants` to ProcessInfoNode

# 2.2

- capture source map sources in processinfo data

# 2.1

- add support for setting an explicit list of files to cover
- export WithExternalID type
- export ./package.json
- use consistent cwd for entire process group
- coverage: lineLengths should be based on generated content
- Revert using the diagnostics channel, does not work on node 20

# 2

- ported to typescript
- hybrid build
- support for node v20 using `globalPreload` message port
- require node v16.17 or higher, for multiple-loader support
- no longer squashing the loaders into the query string, since
  multiple-loader support is required
- default export replaced with named export
- Make the ESM entry point also the default module, to drop the `/esm`
  from the end of the loader argument
- Do not minify processinfo json files
- add support for fork()
- add support for promisified spawn methods

# 1

- Initial working implementation
- Included workarounds for the lack of multiple-loader support,
  which had not yet landed
