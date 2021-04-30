import assert from "assert"

import DependencyGraph from "../lib/dependencyGraph.js"

describe("dependency graph", () => {
  let dg, schema

  beforeEach(async () => {
    dg = DependencyGraph("index.js")
    schema = await dg.add(snapshots[0])
  })

  it("should add versions when none are available", async () => {
    assert.deepEqual(schema, {
      "index.js": {
        hash: "ide",
        version: 1,
        isDynamic: false,
      },
      "two.js": {
        hash: "222",
        version: 1,
        isDynamic: false,
      },
    })
  })

  it("should be immutable even when no changes", async () => {
    const oldSchema = schema
    schema = await dg.add(snapshots[0])
    assert.notEqual(schema, oldSchema)
    assert.deepEqual(schema, oldSchema)
  })

  it("should dirty when any dependency is dirty", async () => {
    schema = await dg.add(snapshots[1])
    assert.deepEqual(schema, {
      "index.js": {
        hash: "ide",
        version: 2,
        isDynamic: false,
      },
      "two.js": {
        hash: "222-changed",
        version: 2,
        isDynamic: false,
      },
    })
  })

  it("should keep deleted files in schema", async () => {
    await dg.add(snapshots[1])
    schema = await dg.add(snapshots[2])

    assert.deepEqual(schema, {
      "index.js": {
        hash: "1",
        version: 3,
        isDynamic: false,
      },
      "two.js": {
        hash: "222-changed",
        version: 2,
        isDynamic: false,
      },
    })
  })

  it("should not fail on circular dependencies", async () => {
    await dg.add(snapshots[1])
    await dg.add(snapshots[2])
    schema = await dg.add(snapshots[3])

    assert.deepEqual(schema, {
      "index.js": {
        hash: "11",
        version: 4,
        isDynamic: false,
      },
      "two.js": {
        hash: "222-changed",
        version: 2,
        isDynamic: false,
      },
      "circular-1.js": {
        hash: "c1",
        version: 1,
        isDynamic: false,
      },
      "circular-2.js": {
        hash: "c2",
        version: 1,
        isDynamic: false,
      },
      "circular-3.js": {
        hash: "c3",
        version: 1,
        isDynamic: false,
      },
    })
  })

  it("should always consider circular dependencies dirty", async () => {
    await dg.add(snapshots[1])
    await dg.add(snapshots[2])
    await dg.add(snapshots[3])
    schema = await dg.add(snapshots[3])

    assert.deepEqual(schema, {
      "index.js": {
        hash: "11",
        version: 5, // note that this also gets version increase because it depends on a circular dependency
        isDynamic: false,
      },
      "two.js": {
        hash: "222-changed",
        version: 2,
        isDynamic: false,
      },
      "circular-1.js": {
        hash: "c1",
        version: 2,
        isDynamic: false,
      },
      "circular-2.js": {
        hash: "c2",
        version: 2,
        isDynamic: false,
      },
      "circular-3.js": {
        hash: "c3",
        version: 2,
        isDynamic: false,
      },
    })
  })

  it("should always consider circular dependencies dirty", async () => {
    schema = await dg.add(snapshots[4])

    assert.deepEqual(schema, {
      "index.js": {
        hash: "11",
        version: 2,
        isDynamic: false,
      },
      "two.js": {
        hash: "222",
        version: 1,
        isDynamic: false,
      },
      dynamic1: {
        hash: "dead beef",
        isDynamic: true,
        version: 1,
      },
      "static-from-dynamic": {
        hash: "beef",
        isDynamic: true,
        version: 1,
      },
    })
  })
})

const snapshots = [
  {
    "index.js": {
      hash: async () => "ide",
      contents: async () => `import two from './two.js'`,
    },
    "two.js": {
      hash: async () => "222",
      contents: async () => `console.log('nothing much here')`,
    },
    "three.js": {
      hash: async () => "333",
      contents: async () => "irrelevant",
    },
  },
  {
    "index.js": {
      hash: async () => "ide",
      contents: async () => `import two from './two.js'`,
    },
    "two.js": {
      hash: async () => "222-changed",
      contents: async () => `console.log('I have changed')`,
    },
    "three.js": {
      hash: async () => "333",
      contents: async () => "irrelevant",
    },
  },
  {
    "index.js": {
      hash: async () => "1",
      contents: async () => `'nothing here'`,
    },
  },
  {
    "index.js": {
      hash: async () => "11",
      contents: async () => `import './circular-1.js'`,
    },
    "circular-1.js": {
      hash: async () => "c1",
      contents: async () => `import './circular-2.js'`,
    },
    "circular-2.js": {
      hash: async () => "c2",
      contents: async () => `import './circular-3.js'`,
    },
    "circular-3.js": {
      hash: async () => "c3",
      contents: async () => `import './circular-1.js'`,
    },
  },
  {
    "index.js": {
      hash: async () => "11",
      contents: async () => `const dynamic = import('./dynamic1')`,
    },
    dynamic1: {
      hash: async () => "dead beef",
      contents: async () => `import dynamic2 from "./static-from-dynamic"`,
    },
    "static-from-dynamic": {
      hash: async () => "beef",
      contents: async () => `tuff`,
    },
  },
]
