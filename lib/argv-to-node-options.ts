export const argvToNodeOptions = (argv: string[]) =>
  argv.map(o => `"${o.replace(/"/g, '\\"')}"`).join(' ')
