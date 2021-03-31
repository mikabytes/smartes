import assert from "assert"

import transform from "../src/transform.js"

describe("transform", () => {
  it("should inject in import statements", async () => {
    const result = transform(
      "abc",
      "app/index.js",
      `import '../src/file2.js'`,
      {
        "src/file2.js": {
          version: 15,
        },
      }
    )

    assert.equal(result, `import '../src/file2-15.js'`)
  })

  it("should replace smartes statements globally", async () => {
    const result = transform(
      "abc",
      "app/index.html",
      `<!-- smartes(../src/file2.js) -->
      <script src="../src/file2.js"></script>
      `,
      {
        "src/file2.js": {
          version: 15,
        },
      }
    )

    assert.equal(
      result,
      `<!-- smartes(../src/file2-15.js) -->
      <script src="../src/file2-15.js"></script>
      `
    )
  })
})
