import mime from 'mime-types'
import zlib from 'zlib'
import fs from 'fs'

import DependencyGraph from './dependencyGraph.js'
import Git from './git.js'
import transform from './transform.js'

export default function RequestManager(config) {
  let cache = {}

  return {
    async handle(treeish, path) {
      if (!cache[treeish]) {
        cache[treeish] = {}
      }
      if (cache[treeish][path]) {
        return cache[treeish][path]
      }

      const git = Git(treeish)
      let revs
      try {
        revs = await git.getRevisions()
      } catch (e) {
        return [
          400,
          {'Content-Type': 'text/text'},
          `Invalid branch/hash/tag "${treeish}"`,
        ]
      }

      let schema = {}
      let snapshot

      for (const rev of revs) {
        if (cache[rev]) {
          schema = cache[rev]
        } else {
          const dp = DependencyGraph(config.entry, schema)

          snapshot = await Git(rev).snapshot()
          cache[rev] = schema = dp.add(snapshot)
        }
      }

      let ret

      if (path === config.entry) {
        if (!schema[path]) {
          ret = [404, {}, 'No such file.']
        } else {
          ret = await getFile(treeish, path, schema, snapshot)
        }
      } else if (pathNotInSchema(path, schema)) {
        ret = [404, {}, 'No such file.\n\n' + JSON.stringify(schema, null, 4)]
      } else {
        const [realpath, version] = versionedPathToReal(path)
        ret = await getFile(treeish, realpath, schema, snapshot)
      }

      if (path !== config.entry && treeish !== 'HEAD') {
      }

      if (treeish !== 'HEAD') {
        cache[treeish][path] = ret
      }

      return ret
    },
  }
}

function pathNotInSchema(path, schema) {
  const [realpath, version] = versionedPathToReal(path)

  if (!realpath) {
    return true
  }

  const entry = schema[realpath]
  if (!entry || entry.version !== version) {
    return true
  }
}

const matcher = /^(.*)-(\d+)(\.[^.]+$|$)/
function versionedPathToReal(path) {
  const split = path.match(matcher)
  // paths are appended a dash and a number (version)
  if (!split) {
    return []
  }
  const realpath = split[1] + split[3]
  const version = parseInt(split[2])
  return [realpath, version]
}

async function getFile(treeish, path, schema, snapshot) {
  let contents = snapshot
    ? snapshot[path].contents
    : await Git(treeish).readFile(path)

  contents = transform(treeish, path, contents, schema)

  contents = await new Promise(res => {
    zlib.gzip(contents, (_, result) => {
      res(result)
    })
  })

  return [
    200,
    {'Content-Type': mime.lookup(path), 'Content-Encoding': 'gzip'},
    contents,
  ]
}

function fileExists(path) {
  return new Promise(res => {
    fs.access(path, fs.constants.R_OK, err => {
      res(!err)
    })
  })
}

function fileContents(path) {
  return new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        rej(err)
      } else {
        res(data)
      }
    })
  })
}
