import assert from 'assert'

import Git from '../lib/git.js'

const file = './test/fixtures/just-a-file.txt'

describe('git', () => {
  it('should get hash based on where I am', async () => {
    const firstCommit = 'b796368fab0855f54f11c566edbda07bab111b31' // commit
    const secondCommit = 'test-git' // branch

    assert.equal(await Git(firstCommit).getHash(file), 'bbb2')
    assert.equal(await Git(secondCommit).getHash(file), 'fcab2')
  })

  it('should read file', async () => {
    assert.equal(
      await Git('test-git').readFile('test/fixtures/just-a-file.txt'),
      'This is for the tests. Changed.'
    )
  })

  it('should present a list of commits given a treeish', async () => {
    assert.equal(
      await Git('test-git').getRevisions(),
      `fcab2787d7c7ce4307d39f0dd3f76ef76bc5b58a
b796368fab0855f54f11c566edbda07bab111b31
bbb290d466581574affcbba6e6f026cb47f0aaaf
bf751b447578a814ea3b23a73a236fc5a32a4ff0`
    )
  })

  it('should present everything', async () => {
    const everything = await Git('test-git').everything()

    assert.deepEqual(
      [
        '.gitignore',
        'README.md',
        'index.js',
        'lib/cmd.js',
        'lib/git.js',
        'package-lock.json',
        'package.json',
        'test/cmd.js',
        'test/fixtures/just-a-file.txt',
        'test/git.js',
        'test/test.js',
      ],
      everything.map(it => it.path)
    )

    assert.deepEqual(
      [
        'bf75',
        'b796',
        'bf75',
        'b796',
        'b796',
        'bf75',
        'bf75',
        'b796',
        'fcab2',
        'b796',
        'bf75',
      ],
      everything.map(it => it.hash)
    )

    assert.equal(
      'This is for the tests. Changed.',
      everything.find(it => it.path === 'test/fixtures/just-a-file.txt')
        .contents
    )
  })
})
