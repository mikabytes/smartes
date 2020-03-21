import analyze from './analyze.js'

let i = 0

export default function DependencyGraph(entryPath) {
  let schema = {}

  return {
    add(snapshot) {
      if (!snapshot) {
        throw new Error('Must provide a valid snapshot')
      }
      // duplicate, not to modify existing one
      schema = JSON.parse(JSON.stringify(schema))
      const cds = []
      compile(schema, snapshot, entryPath, [], {}, cds)

      for (const v of Object.values(schema)) {
        if (v.dirty) {
          delete v.dirty
          v.version++
        }
      }

      cds.forEach(cd => {
        console.warn(
          `A circular dependency was detected. You should fix that. These files and all files importing them will be considered dirty for every commit: [${cd.join(
            ' '
          )}]`
        )
      })

      return schema
    },
  }
}

function compile(schema, snapshot, path, callTree, cache, cds) {
  callTree.push(path)

  if (cache[path]) {
    return cache[path]
  }

  let dirty = false

  if (!schema[path]) {
    dirty = true
    schema[path] = {
      version: 0,
      hash: snapshot[path].hash,
    }
  }

  const oldHash = schema[path].hash
  const newHash = snapshot[path].hash
  if (oldHash !== newHash) {
    // This file has changed
    dirty = true
    schema[path].hash = snapshot[path].hash
  }

  for (const dep of analyze(path, snapshot[path].contents)) {
    if (callTree.includes(dep.path)) {
      // any circular dependencies cause the offending file to be considered
      // dirty. It's a simple solution to a very difficult problem.
      dirty = true
      cds.push(callTree.slice(callTree.lastIndexOf(dep.path)))
    } else {
      const depDirty = compile(
        schema,
        snapshot,
        dep.path,
        callTree.slice(),
        cache,
        cds
      )
      if (depDirty) {
        dirty = true
      }
    }
  }

  if (dirty) {
    schema[path].dirty = true
  }
  return dirty
}
