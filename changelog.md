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
