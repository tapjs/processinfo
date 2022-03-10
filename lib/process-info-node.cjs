class ProcessInfoNode {
  constructor (data) {
    this.parent = null
    this.children = null
    this.files = null
    Object.assign(this, data)
  }

  toJSON () {
    return {
      ...this,
      root: this.root && this.root.uuid,
      parent: this.parent && this.parent.uuid,
      children: this.children.map(c => c.uuid),
    }
  }

  link (db) {
    this.parent = db.uuids.get(this.parent) || this.parent || null
    this.root = db.uuids.get(this.root) || this.root
    if (this.parent === null) {
      db.roots.add(this)
    } else if (typeof this.parent !== 'string') {
      if (!this.parent.children) {
        this.parent.children = new Set([this])
      } else {
        this.parent.children.add(this)
      }
    }
    for (const f of this.files) {
      if (!db.files.has(f)) {
        db.files.set(f, new Set())
      }
      db.files.get(f).add(this)
    }
    if (this.externalID) {
      db.externalIDs.set(this.externalID, this)
    }
  }
}

module.exports = {ProcessInfoNode}
