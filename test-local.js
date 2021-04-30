import builder from "./lib/builder.js"
import fs from "fs"

async function run() {
  const smartes = await builder({
    rootFile: `lib/builder.js`,
    pathToGit: `.`,
  })
  const out = await smartes(`master`)

  await expand(out.lib)

  console.log(JSON.stringify(out, null, 4))
}

run()

async function expand(thing) {
  if (!thing) {
    return
  }

  for (const k of Object.keys(thing)) {
    const v = thing[k]
    const type = typeof v

    if (type === `function`) {
      thing[k] = await thing[k]()
    } else if (type === `object`) {
      await expand(thing[k])
    }
  }
}
