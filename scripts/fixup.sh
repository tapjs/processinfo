#!/usr/bin/env bash

rm -rf dist
mv dist-tmp dist

# the loader paths have to be determined in different ways in esm
# vs commonjs, because of the availability of import.meta.url
rm dist/cjs/require-resolve.*
mv dist/cjs/require-resolve-cjs.js dist/cjs/require-resolve.js
mv dist/cjs/require-resolve-cjs.d.ts dist/cjs/require-resolve.d.ts

cat >dist/cjs/package.json <<!EOF
{
  "type": "commonjs"
}
!EOF

cat >dist/mjs/package.json <<!EOF
{
  "type": "module"
}
!EOF
