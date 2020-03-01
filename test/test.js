import assert from 'assert'

import hello from '../index.js'

describe('test', () => {
  it('should import index.js', () => {
    assert.equal('helloa', hello)
  })
})
