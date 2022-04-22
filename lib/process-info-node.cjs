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
      children: this.children && [...this.children].map(c => c.uuid),
    }
  }

  link (db) {
    db.uuids.set(this.uuid, this)
    this.parent = db.uuids.get(this.parent) || this.parent || null
    this.root = db.uuids.get(this.root) || this.root

    if (this.parent === null) {
      this.root = this
      if (db.pendingRoot.has(this.uuid)) {
        for (const n of db.pendingRoot.get(this.uuid)) {
          n.root = this
        }
        db.pendingRoot.delete(this.uuid)
      }
    } else if (typeof this.root === 'string') {
      if (db.pendingRoot.has(this.root)) {
        db.pendingRoot.get(this.root).add(this)
      } else {
        db.pendingRoot.set(this.root, new Set([this]))
      }
    }

    if (typeof this.parent === 'string') {
      if (db.pendingParent.has(this.parent)) {
        db.pendingParent.get(this.parent).add(this)
      } else {
        db.pendingParent.set(this.parent, new Set([this]))
      }
    } else if (this.parent !== null) {
      if (!this.parent.children) {
        this.parent.children = new Set([this])
      } else {
        this.parent.children.add(this)
      }
    }

    if (db.pendingParent.has(this.uuid)) {
      this.children = db.pendingParent.get(this.uuid)
      for (const n of this.children) {
        n.parent = this
      }
      db.pendingParent.delete(this.uuid)
    }

    for (const f of this.files) {
      if (!db.files.has(f)) {
        db.files.set(f, new Set([this]))
      } else {
        db.files.get(f).add(this)
      }
    }

    if (this.externalID) {
      db.externalIDs.set(this.externalID, this)
    }
  }
}

module.exports = {ProcessInfoNode}
