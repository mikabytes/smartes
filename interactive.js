import builder from "./lib/builder.js"
import fs from "fs"

async function run() {
  const smartes = await builder({
    entry: `lib/builder.js`,
    path: `.`,
    skipCache: true,
  })
  const out = await smartes(`master`)
  console.log(out.lib.entries)

  await expand(out.lib)

  fs.writeFileSync(`/tmp/out.json`, JSON.stringify(out, null, 4))
}

run()

async function expand(thing) {
  if (thing && thing.contents) {
    thing.a = await thing.contents()
  }
  if (thing.entries) {
    await Promise.all(
      Object.keys(thing.entries).map((it) => expand(thing.entries[it]))
    )
  }
}
