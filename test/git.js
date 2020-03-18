import assert from 'assert'

import Git from '../lib/git.js'

const file = './test/fixtures/just-a-file.txt'

describe('git', () => {
  it('should get hash based on where I am', async () => {
    const firstCommit = 'b796368fab0855f54f11c566edbda07bab111b31' // commit
    const secondCommit = 'test-git' // branch

    assert.equal(
      'bbb290d466581574affcbba6e6f026cb47f0aaaf',
      await Git(firstCommit).getHash(file)
    )
    assert.equal(
      'fcab2787d7c7ce4307d39f0dd3f76ef76bc5b58a',
      await Git(secondCommit).getHash(file)
    )
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

    const t = everything['test/fixtures/just-a-file.txt']

    assert.equal('fcab2787d7c7ce4307d39f0dd3f76ef76bc5b58a', t.hash)
    assert.equal('This is for the tests. Changed.', t.contents)
  })
})
