import assert from "assert"
import cmd from "../lib/cmd.js"

describe("cmd", () => {
  it("should execute shell commands", async () => {
    const result = await cmd`echo hello`
    assert.equal(result, "hello")
  })

  it("should fail on error", async () => {
    await assert.rejects(async () => {
      await cmd`cat hello`
    }, /cat hello: \[1\] cat: hello: No such file or directory/)
  })
})
