import DependencyGraph from './dependencyGraph.js'
import Git from './git.js'

let cache = {}

export default async function requestManager(config, treeish, path) {
  const git = Git(treeish)
  let revs
  try {
    revs = (await git.getRevisions()).split('\n')
  } catch (e) {
    return [
      400,
      {'Content-Type': 'text/text'},
      `Invalid branch/hash/tag "${treeish}"`,
    ]
  }

  let schema = {}
  let snapshot

  revs.forEach(rev => {
    if (cache[rev]) {
      schema = cache[rev]
      return
    } else {
      const dp = DependencyGraph(config.entry, schema)

      snapshot = Git(rev).snapshot()
      cache[rev] = schema = dp.add(snapshot)
    }
  })

  if (path !== config.entry && pathNotInSchema(path, schema)) {
    return [404, {}, 'No such file.']
  }

  return [200, {}, JSON.stringify(revs)]
}

const matcher = /^(.*)-(\d+)(\.[^.]+$|$)/
function pathNotInSchema(path, schema) {
  // paths are appended a dash and a number (version)
  const split = path.match(matcher)
  if (!split) {
    return true
  }
  const realpath = split[1] + split[3]
  const version = parseInt(split[2])
  const entry = schema[realpath]
  console.log(schema)
  if (!entry || entry.version !== version) {
    return true
  }
}
