import assert from 'assert'

import DependencyGraph from '../lib/dependencyGraph.js'

describe('dependency graph', () => {
  let dg, schema

  beforeEach(async () => {
    dg = DependencyGraph('index.js')
    schema = dg.add(snapshot1)
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
})

const snapshot1 = {
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
}
