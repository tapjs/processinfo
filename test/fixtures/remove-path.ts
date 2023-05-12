export const removePath = (
  o: any,
  path: string,
  replace: string,
  seen: Map<any, any> = new Map()
): typeof o => {
  if (seen.has(o)) {
    return seen.get(o)
  }
  if (typeof o === 'string') {
    return o.split(path).join(replace).replace(/\\/g, '/')
  } else if (!o || typeof o !== 'object') {
    return o
  } else if (Array.isArray(o)) {
    const clean = new Array(o.length)
    seen.set(o, clean)
    for (let i = 0; i < o.length; i++) {
      clean[i] = removePath(o[i], path, replace, seen)
    }
    return clean
  } else if (o instanceof Map) {
    const clean = new Map()
    seen.set(o, clean)
    for (const [k, v] of o.entries()) {
      clean.set(
        removePath(k, path, replace, seen),
        removePath(v, path, replace, seen)
      )
    }
    return clean
  } else if (o instanceof Set) {
    const clean = new Set()
    seen.set(o, clean)
    for (const v of o) {
      clean.add(removePath(v, path, replace, seen))
    }
    return clean
  } else {
    const clean = Object.create({ prototype: o.prototype })
    seen.set(o, clean)
    for (const [k, v] of Object.entries(o)) {
      clean[k] = removePath(v, path, replace, seen)
    }
    return clean
  }
}
