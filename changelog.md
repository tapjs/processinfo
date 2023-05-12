# 2

- ported to typescript
- hybrid build
- support for node v20 using `globalPreload` message port
- require node v16.17 or higher, for multiple-loader support
- no longer squashing the loaders into the query string, since
  multiple-loader support is required
- default export replaced with named export

# 1

- Initial working implementation
- Included workarounds for the lack of multiple-loader support,
  which had not yet landed
