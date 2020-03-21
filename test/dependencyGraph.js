import assert from 'assert'

import DependencyGraph from '../lib/dependencyGraph.js'

describe('dependency graph', () => {
  let dg, schema

  beforeEach(async () => {
    dg = DependencyGraph('index.js')
    schema = dg.add(snapshots[0])
  })

  it('should add versions when none are available', async () => {
    assert.deepEqual(schema, {
      'index.js': {
        hash: 'ide',
        version: 1,
      },
      'two.js': {
        hash: '222',
        version: 1,
      },
    })
  })

  it('should be immutable even when no changes', async () => {
    const oldSchema = schema
    schema = dg.add(snapshots[0])
    assert.notEqual(schema, oldSchema)
    assert.deepEqual(schema, oldSchema)
  })

  it('should dirty when any dependency is dirty', async () => {
    schema = dg.add(snapshots[1])
    assert.deepEqual(schema, {
      'index.js': {
        hash: 'ide',
        version: 2,
      },
      'two.js': {
        hash: '222-changed',
        version: 2,
      },
    })
  })

  it('should keep deleted files in schema', async () => {
    dg.add(snapshots[1])
    schema = dg.add(snapshots[2])

    assert.deepEqual(schema, {
      'index.js': {
        hash: '1',
        version: 3,
      },
      'two.js': {
        hash: '222-changed',
        version: 2,
      },
    })
  })

  it('should not fail on circular dependencies', async () => {
    dg.add(snapshots[1])
    dg.add(snapshots[2])
    schema = dg.add(snapshots[3])

    assert.deepEqual(schema, {
      'index.js': {
        hash: '11',
        version: 4,
      },
      'two.js': {
        hash: '222-changed',
        version: 2,
      },
      'circular-1.js': {
        hash: 'c1',
        version: 1,
      },
      'circular-2.js': {
        hash: 'c2',
        version: 1,
      },
      'circular-3.js': {
        hash: 'c3',
        version: 1,
      },
    })
  })

  it('should always consider circular dependencies dirty', async () => {
    dg.add(snapshots[1])
    dg.add(snapshots[2])
    dg.add(snapshots[3])
    schema = dg.add(snapshots[3])

    assert.deepEqual(schema, {
      'index.js': {
        hash: '11',
        version: 5, // note that this also gets version increase because it depends on a circular dependency
      },
      'two.js': {
        hash: '222-changed',
        version: 2,
      },
      'circular-1.js': {
        hash: 'c1',
        version: 2,
      },
      'circular-2.js': {
        hash: 'c2',
        version: 2,
      },
      'circular-3.js': {
        hash: 'c3',
        version: 2,
      },
    })
  })
})

const snapshots = [
  {
    'index.js': {
      hash: 'ide',
      contents: `import two from './two.js'`,
    },
    'two.js': {
      hash: '222',
      contents: `console.log('nothing much here')`,
    },
    'three.js': {
      hash: '333',
      contents: 'irrelevant',
    },
  },
  {
    'index.js': {
      hash: 'ide',
      contents: `import two from './two.js'`,
    },
    'two.js': {
      hash: '222-changed',
      contents: `console.log('I have changed')`,
    },
    'three.js': {
      hash: '333',
      contents: 'irrelevant',
    },
  },
  {
    'index.js': {
      hash: '1',
      contents: `'nothing here'`,
    },
  },
  {
    'index.js': {
      hash: '11',
      contents: `import './circular-1.js'`,
    },
    'circular-1.js': {
      hash: 'c1',
      contents: `import './circular-2.js'`,
    },
    'circular-2.js': {
      hash: 'c2',
      contents: `import './circular-3.js'`,
    },
    'circular-3.js': {
      hash: 'c3',
      contents: `import './circular-1.js'`,
    },
  },
]
