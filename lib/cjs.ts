import { register } from './register-cjs.js'
register()

// copy main module so that this can also be the main
// entry point, and you can do --require=@tapjs/processinfo
export * from './index.js'
