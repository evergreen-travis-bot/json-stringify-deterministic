'use strict'

var stringify = require('..')

describe('toJSON', function () {
  it('function', function () {
    var obj = { one: 1, two: 2, toJSON: function () { return { one: 1 } } }
    stringify(obj).should.be.equal('{"one":1}')
  })

  it('string', function () {
    var obj = { one: 1, two: 2, toJSON: function () { return 'one' } }
    stringify(obj).should.be.equal('"one"')
  })

  it('array', function () {
    var obj = { one: 1, two: 2, toJSON: function () { return ['one'] } }
    stringify(obj).should.be.equal('["one"]')
  })
})
