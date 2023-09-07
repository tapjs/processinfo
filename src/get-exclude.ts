export const defaultExclude =
  /(^|[\\\/])(node_modules|\.tap|tap-testdir-.*?|tap-snapshots|tests?|[^\\\/]+\.test\.([cm]?[jt]s|[jt]sx?)|__tests?__)([\\\/]|$)/i

const parseExclude = (src: string | undefined): RegExp | undefined => {
  if (!src) return
  const parsed = src.match(/^\/(.*)\/([a-z]*)$/)
  if (parsed) {
    try {
      return new RegExp(parsed[1], parsed[2])
    } catch (e) {}
  }
}

const proc = process

export const getExclude = (k: string, useDefault = true) => {
  const src = proc.env[k]
  const exclude = parseExclude(src) || (useDefault ? defaultExclude : /$./)
  proc.env[k] = String(exclude)
  return exclude
}
