export const argvToNodeOptions = (argv: readonly string[]) =>
  argv.map(o => `"${o.replace(/"/g, '\\"')}"`).join(' ')
