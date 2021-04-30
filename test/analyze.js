import assert from "assert"

import analyze from "../lib/analyze.js"

describe("analyze", () => {
  it("get dependencies", async () => {
    const result = analyze(
      "index.js",
      `
      import 'global'
      import "otherGlobal"
      import './one.js';
      import './real/../weird/./..//////two.js'
      import "./two.js";
      import third from './some/third.js'
      import {fourth} from './some/third.js'
      import fifth from './fifth.weirdExtension';
      /* smartes(./sixth.html) */
      import '/absolute/path' // should be ignored

      const d1 = import   (    './spaced-quotes'    )
      const d2 = import('./unspaced-quotes')
      const d2 = import("./semi-quotes")
      const d3 = import(\`./backtick\`)

      http://unpkg.com/lib/redux/redux.js // should be ignored
    `
    )

    assert.deepEqual(
      [...result],
      [
        { path: "one.js" },
        { path: "two.js" },
        { path: "some/third.js" },
        { path: "fifth.weirdExtension" },
        { path: "spaced-quotes", isDynamic: true },
        { path: "unspaced-quotes", isDynamic: true },
        { path: "semi-quotes", isDynamic: true },
        { path: "backtick", isDynamic: true },
        { path: "sixth.html", isSmartes: true },
      ]
    )
  })
})
