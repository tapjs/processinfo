exports.argvToNodeOptions = argv =>
  argv.map(o => `"${o.replace(/"/g, '\\"')}"`).join(' ')
