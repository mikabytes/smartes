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

export default function* analyze(path, contents) {
  const seen = new Set()

  const matches = [
    ...contents.matchAll(patternImport),
    ...contents.matchAll(patternDImport),
    ...contents.matchAll(globalImport),
  ].filter(m => m[2].startsWith('.'))

  for (const m of matches) {
    const depPath = normalize(`${path}/../${m[2]}`)

    if (!seen.has(depPath)) {
      seen.add(depPath)

      yield {
        path: depPath,
      }
    }
  }
}
