import analyze from './analyze.js'

export default function DependencyGraph(entryPath) {
  let schema = {}

  return {
    add(snapshot) {
      // duplicate, not to modify existing one
      schema = JSON.parse(JSON.stringify(schema))
      compile(schema, snapshot, entryPath)

      for (const v of Object.values(schema)) {
        if (v.dirty) {
          delete v.dirty
          v.version++
        }
      }

      return schema
    },
  }
}

function compile(schema, snapshot, path, callTree = [], cache = {}) {
  if (callTree.includes(path)) {
    throw new Error(
      'Circular dependency detected, which this script has no support for! ' +
        JSON.stringify(callTree) +
        ' detected in adding ' +
        file
    )
  }

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

  if (schema[path].hash !== snapshot[path].hash) {
    // This file has changed
    dirty = true
  }

  for (const dep of analyze(path, snapshot[path].contents)) {
    const depDirty = compile(
      schema,
      snapshot,
      dep.path,
      [...callTree, path],
      cache
    )
    dirty = dirty || depDirty
  }

  schema[path].dirty = true
  return dirty
}
