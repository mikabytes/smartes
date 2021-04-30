// this gather various smartes modules, adds some caching, and builds a complete file tree including contents. Consider it a convenience class.

import cmd from "./cmd.js"
import { writeFile } from "fs/promises"
import Git from "./git.js"
import DependencyGraph from "./dependencyGraph.js"

export default async function Builder({ entry, path, skipCache }) {
  cmd.cwd = path // yes, we're that dirty.

  let timer
  let data
  try {
    data = JSON.parse(await fs.readFile(`.smartes.cache`))
  } catch (e) {
    data = {}
  }
  async function saveCache() {
    timer = null
    if (!skipCache) {
      await fs.writeFile(`.smartes.cache`, JSON.stringify(data))
    }
  }
  let cache = new Proxy(
    {},
    {
      set(obj, prop, value) {
        obj[prop] = value
        if (timer) {
          clearTimeout(timer)
          timer = setTimeout(saveCache, 10000) // save cache at most every 10 seconds
        }
        return value
      },
    }
  )

  let lastResult = {}

  return async function build(treeish) {
    const git = Git(treeish)
    let revs
    try {
      revs = await git.getRevisions()
    } catch (e) {
      e.code = `invalid_treeish`
      throw e
    }

    let schema = {}
    let snapshot
    let dirty = false
    let all = []

    for (const rev of revs) {
      const c = cache[rev]
      if (c) {
        schema = c.schema
        snapshot = c.snapshot
      } else {
        dirty = true
        const dp = DependencyGraph(entry, schema)

        const git = Git(rev)

        snapshot = await git.snapshot()
        schema = await dp.add(snapshot)

        cache[rev] = {
          schema,
          snapshot,
        }
      }

      all.push({ schema, snapshot })
    }

    if (dirty) {
      lastResult[treeish] = await compile(all)
    }
    return lastResult[treeish]
  }
}

async function compile(list) {
  const creation = {}

  for (const { schema, snapshot } of list) {
    for (const file of Object.keys(schema)) {
      addDeeply(creation, file, schema[file].version, snapshot[file])
    }
  }

  return creation
}

function addDeeply(creation, file, version, snapshotFile) {
  // browse down the folder hierarchy until we arrive where file should be located
  const parts = file.split(/(?<!\\)\//)
  let p = creation
  while (parts.length > 1) {
    const current = parts.shift()
    if (!p[current]) {
      p[current] = { type: `dir`, entries: {} }
    }
    p = p[current].entries
  }

  // add file there
  const fp = parts[0].match(/^(.*?)(\.[^./]+$|$)/)
  const filename = `${fp[1]}-${version}${fp[2]}`
  p[filename] = {
    type: `file`,
    ...snapshotFile,
  }
}
