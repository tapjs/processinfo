/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/node-options-env.ts TAP no require.register available args has esm absolute > args has esm absolute 1`] = `
"--loader" "{LOADER ABS}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available args has legacy loader relative > args has legacy loader relative 1`] = `
"--loader={LOADER REL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available args has legacy loader url = > args has legacy loader url = 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available doubledash > doubledash 1`] = `
"--import=whatever" "--" "--loader={LOADER URL}" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available empty > empty 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available empty no-warnings > empty no-warnings 1`] = `
"--no-warnings" "--loader={LOADER URL}"
`

exports[`test/node-options-env.ts TAP no require.register available empty no-warnings=ExperimentalLoader > empty no-warnings=ExperimentalLoader 1`] = `
"--no-warnings=ExperimentalLoader" "--loader={LOADER URL}"
`

exports[`test/node-options-env.ts TAP no require.register available esm absolute > esm absolute 1`] = `
"--loader" "{LOADER ABS}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available esm relative > esm relative 1`] = `
"--loader={LOADER REL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available esm url = > esm url = 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available esm url = no warning > esm url = no warning 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available esm url = no warning=exploader > esm url = no warning=exploader 1`] = `
"--loader={LOADER URL}" "--no-warnings=ExperimentalLoader"
`

exports[`test/node-options-env.ts TAP no require.register available esm url > esm url 1`] = `
"--loader" "{LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available exp args esm absolute > exp args esm absolute 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available exp args esm relative > exp args esm relative 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available exp args esm url = > exp args esm url = 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available exp args esm url > exp args esm url 1`] = `
"--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available has both > has both 1`] = `
"--import" "{IMPORT REL}" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available import absolute > import absolute 1`] = `
"--import" "{IMPORT ABS}" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available import multiple times > import multiple times 1`] = `
"--import" "file://{IMPORT ABS}" "--import={IMPORT REL}" "--import={IMPORT ABS}" "--import" "file://{IMPORT ABS}" "--import={IMPORT REL}" "--import={IMPORT ABS}" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available import not found > import not found 1`] = `
"--import" "not foud" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available import relative > import relative 1`] = `
"--import={IMPORT REL}" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available import value missing > import value missing 1`] = `
"--import" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available legacy loader url > legacy loader url 1`] = `
"--loader" "{LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available legacy loader url with no-warnings > legacy loader url with no-warnings 1`] = `
"--loader" "{LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available legacy loader url with no-warnings=ExperimentalLoader > legacy loader url with no-warnings=ExperimentalLoader 1`] = `
"--loader" "{LOADER URL}" "--no-warnings=ExperimentalLoader"
`

exports[`test/node-options-env.ts TAP no require.register available loader multiple times > loader multiple times 1`] = `
"--loader" "{LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available loader not found > loader not found 1`] = `
"--loader" "not foud" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available loader value missing > loader value missing 1`] = `
"--loader" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available multiple import > multiple import 1`] = `
"--import" "some-file.ts" "--import" "/some/path/to/index.import" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available multiple loaders > multiple loaders 1`] = `
"--loader" "some-file.ts" "--loader" "/some/path/to/index.import" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available other import > other import 1`] = `
"--import" "some-file.ts" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available other loader > other loader 1`] = `
"--loader" "some-file.ts" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP no require.register available some random stuff > some random stuff 1`] = `
"--x" "y" "-z" "--loader={LOADER URL}" "--no-warnings"
`

exports[`test/node-options-env.ts TAP with require.register available args has esm absolute > args has esm absolute 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available args has legacy loader relative > args has legacy loader relative 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available args has legacy loader url = > args has legacy loader url = 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available doubledash > doubledash 1`] = `
"--import=whatever" "--" "--loader={LOADER URL}" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available empty > empty 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available empty no-warnings > empty no-warnings 1`] = `
"--no-warnings" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available empty no-warnings=ExperimentalLoader > empty no-warnings=ExperimentalLoader 1`] = `
"--no-warnings=ExperimentalLoader" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available esm absolute > esm absolute 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available esm relative > esm relative 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available esm url = > esm url = 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available esm url = no warning > esm url = no warning 1`] = `
"--no-warnings" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available esm url = no warning=exploader > esm url = no warning=exploader 1`] = `
"--no-warnings=ExperimentalLoader" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available esm url > esm url 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available exp args esm absolute > exp args esm absolute 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available exp args esm relative > exp args esm relative 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available exp args esm url = > exp args esm url = 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available exp args esm url > exp args esm url 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available has both > has both 1`] = `
"--import" "{IMPORT REL}" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available import absolute > import absolute 1`] = `
"--import" "{IMPORT ABS}" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available import multiple times > import multiple times 1`] = `
"--import" "file://{IMPORT ABS}" "--import={IMPORT REL}" "--import={IMPORT ABS}" "--import" "file://{IMPORT ABS}" "--import={IMPORT REL}" "--import={IMPORT ABS}" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available import not found > import not found 1`] = `
"--import" "not foud" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available import relative > import relative 1`] = `
"--import={IMPORT REL}" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available import value missing > import value missing 1`] = `
"--import" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available legacy loader url > legacy loader url 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available legacy loader url with no-warnings > legacy loader url with no-warnings 1`] = `
"--no-warnings" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available legacy loader url with no-warnings=ExperimentalLoader > legacy loader url with no-warnings=ExperimentalLoader 1`] = `
"--no-warnings=ExperimentalLoader" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available loader multiple times > loader multiple times 1`] = `
"--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available loader not found > loader not found 1`] = `
"--loader" "not foud" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available loader value missing > loader value missing 1`] = `
"--loader" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available multiple import > multiple import 1`] = `
"--import" "some-file.ts" "--import" "/some/path/to/index.import" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available multiple loaders > multiple loaders 1`] = `
"--loader" "some-file.ts" "--loader" "/some/path/to/index.import" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available other import > other import 1`] = `
"--import" "some-file.ts" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available other loader > other loader 1`] = `
"--loader" "some-file.ts" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`

exports[`test/node-options-env.ts TAP with require.register available some random stuff > some random stuff 1`] = `
"--x" "y" "-z" "--import=file:///Users/isaacs/dev/tapjs/processinfo/dist/mjs/import.mjs"
`
