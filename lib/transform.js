import {normalize} from 'path'

const patternImport = new RegExp(
  /import(?:["'\s]*([\w*${}\n\r\t, ]+)from\s*)?["'\s]["'\s](.*[@\w_-]+)["'\s].*$/,
  'mg'
)
const patternDImport = new RegExp(
  /import\((?:["'\s]*([\w*{}\n\r\t, ]+)\s*)?["'\s](.*([@\w_-]+))["'\s].*\)$/,
  'mg'
)
const globalImport = new RegExp(/(smartes)\((.+)\)/, 'mg')

const versionSplitter = /^(.*?)(\.[^./]+$|$)/

export default function transform(treeish, path, contents, schema) {
  const seen = new Set()

  const matches = [
    ...contents.matchAll(patternImport),
    ...contents.matchAll(patternDImport),
    ...contents.matchAll(globalImport),
  ].filter(m => m[2].match(/^(\.|\/)/))

  for (const m of matches) {
    const isAbsolute = m[2].startsWith('/')
    let absPath
    if (isAbsolute) {
      absPath = m[2].slice(1)
    } else {
      absPath = normalize(`${path}/../${m[2]}`)
    }
    const entry = schema[absPath]

    if (entry) {
      const version = entry.version
      const toReplace = m[0].startsWith('smartes') ? m[2] : m[0]
      const p = toReplace.match(versionSplitter)

      if (p) {
        let newPath = `${p[1]}-${version}${p[2]}`
        if (isAbsolute) {
          newPath = '/' + newPath
        }
        contents = contents.split(toReplace).join(newPath)
      }
    }
  }

  return contents
}
