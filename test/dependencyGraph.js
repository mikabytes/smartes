import assert from 'assert'

describe('dependency graph', () => {
  it('should add versions when none are available', async () => {
    const dg = DependencyGraph()
    dg.add(initial)

    assert.equal(
      dg.createSchema(),
    [
      {
        path: './index.js',
        hash: 'abc',
        version: 1,
      },
      {
        path: './two.js',
        hash: '123',
        version: 1,
      },
    ]
  )
})

const configuration = {
  entry: './index.js',
  base: './src',
  port: 3000,
  branches: [/.*/],
}

const initial = [
  {
    path: './index.js',
    hash: 'abc',
    contents: `import two from './two.js`,
  },
  {
    path: './two.js',
    hash: '123',
    contents: `import two from './two.js`,
  },
]
