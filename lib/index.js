'use strict'

var DEFAULTS = require('./defaults')
var { isArray, isBoolean, isFunction, isObject, keys } = require('./util')

function stringifyDeterministic (obj, opts) {
  opts = opts || {}

  if (isFunction(opts)) opts = { compare: opts }

  var space = opts.space || DEFAULTS.space
  var cycles = isBoolean(opts.cycles) ? opts.cycles : DEFAULTS.cycles
  var replacer = opts.replacer || DEFAULTS.replacer
  var stringify = opts.stringify || DEFAULTS.stringify

  var compare = opts.compare && (function (f) {
    return function (node) {
      return function (a, b) {
        var aobj = { key: a, value: node[a]}
        var bobj = { key: b, value: node[b]}
        return f(aobj, bobj)
      }
    }
  })(opts.compare)

  var seen = []

  return (function _deterministic (parent, key, node, level) {
    var indent = space ? ('\n' + new Array(level + 1).join(space)) : ''
    var colonSeparator = space ? ': ' : ':'

    if (node && node.toJSON && isFunction(node.toJSON)) node = node.toJSON()
    node = replacer.call(parent, key, node)

    if (node === undefined) return

    if (typeof node !== 'object' || node === null) return stringify(node)

    if (isArray(node)) {
      var out = []
      for (var i = 0; i < node.length; i++) {
        var item = _deterministic(node, i, node[i], level + 1) || stringify(null)
        out.push(indent + space + item)
      }
      return '[' + out.join(',') + indent + ']'
    } else {
      if (seen.indexOf(node) !== -1) {
        if (cycles) return stringify('[Circular]')
        throw new TypeError('Converting circular structure to JSON')
      }
      else seen.push(node)

      var nodeKeys = keys(node).sort(compare && compare(node))
      var out = []
      for (var i = 0; i < nodeKeys.length; i++) {
        var key = nodeKeys[i]
        var value = _deterministic(node, key, node[key], level + 1)

        if (!value) continue

        var keyValue = stringify(key)
          + colonSeparator
          + value

        out.push(indent + space + keyValue)
      }
      seen.splice(seen.indexOf(node), 1)
      return '{' + out.join(',') + indent + '}'
    }
  })({ '': obj }, '', obj, 0)
}

module.exports = stringifyDeterministic