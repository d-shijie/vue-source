'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.shallow =
  exports.readonly =
  exports.reactive =
  exports.unRef =
  exports.isRef =
  exports.ref =
  exports.ReactiveEffect =
  exports.effect =
    void 0
var effect_1 = require('./effect.js')
Object.defineProperty(exports, 'effect', {
  enumerable: true,
  get: function () {
    return effect_1.effect
  },
})
Object.defineProperty(exports, 'ReactiveEffect', {
  enumerable: true,
  get: function () {
    return effect_1.ReactiveEffect
  },
})
var ref_1 = require('./ref.js')
Object.defineProperty(exports, 'ref', {
  enumerable: true,
  get: function () {
    return ref_1.ref
  },
})
Object.defineProperty(exports, 'isRef', {
  enumerable: true,
  get: function () {
    return ref_1.isRef
  },
})
Object.defineProperty(exports, 'unRef', {
  enumerable: true,
  get: function () {
    return ref_1.unRef
  },
})
var reactive_1 = require('./reactive.js')
Object.defineProperty(exports, 'reactive', {
  enumerable: true,
  get: function () {
    return reactive_1.reactive
  },
})
Object.defineProperty(exports, 'readonly', {
  enumerable: true,
  get: function () {
    return reactive_1.readonly
  },
})
Object.defineProperty(exports, 'shallow', {
  enumerable: true,
  get: function () {
    return reactive_1.shallow
  },
})
