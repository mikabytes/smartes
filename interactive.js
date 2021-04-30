import smartes from "./lib/builder.js"
import fs from "fs/promises"

const out = smartes({ entry: `lib/builder.js`, path: `.`, skipCache })

fs.writeFileSync(`/tmp/out.json`, JSON.serialize(out, null, 4))
