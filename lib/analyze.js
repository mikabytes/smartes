import { normalize } from "path"

const patternImport = new RegExp(
  /import(?:["'\s]*([\w*${}\n\r\t, ]+)from\s*)?["'\s]["'\s](\..*[@\w_-]+)["'\s].*$/,
  "mg"
)
const patternDImport = new RegExp(
  /import\s*\(\s*(["'`])(\..*[^\\])\1\s*\)/,
  "mg"
)
const globalImport = new RegExp(/(smartes|cdn-deploy)\((.+)\)/, "mg")

export default function* analyze(path, contents) {
  const seen = new Set()

  for (const m of contents.matchAll(patternImport)) {
    const mpath = normalize(`${path}/../${m[2]}`)

    if (!seen.has(mpath)) {
      seen.add(mpath)

      yield {
        path: mpath,
      }
    }
  }

  for (const m of contents.matchAll(patternDImport)) {
    const mpath = normalize(`${path}/../${m[2]}`)

    if (!seen.has(mpath)) {
      seen.add(mpath)

      yield {
        path: mpath,
        isDynamic: true,
      }
    }
  }

  for (const m of contents.matchAll(globalImport)) {
    const mpath = normalize(`${path}/../${m[2]}`)

    if (!seen.has(mpath)) {
      seen.add(mpath)

      yield {
        path: mpath,
        isSmartes: true,
      }
    }
  }
}
