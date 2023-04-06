'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.unRef =
  exports.isRef =
  exports.createRef =
  exports.ref =
  exports.RefImpl =
    void 0
const effect_1 = require('./effect.js')
const reactive_1 = require('./reactive.js')
class RefImpl {
  constructor(value) {
    // 是否是ref类型
    this.__v_isRef = true
    this._rawValue = value
    // 若value是一个对象 则进行reactive
    this._value = convert(value)
    this.dep = new Set()
  }
  // 因为设定的value值 所以使用ref定义的值需要使用ref.value获取
  get value() {
    ;(0, effect_1.trackEffects)(this.dep)
    return this._value
  }
  set value(newValue) {
    // 当新旧值不同时
    if (!Object.is(newValue, this._rawValue)) {
      this._value = convert(newValue)
      this._rawValue = newValue
      ;(0, effect_1.trackEffects)(this.dep)
    }
  }
}
exports.RefImpl = RefImpl
const ref = (value) => {
  return (0, exports.createRef)(value)
}
exports.ref = ref
const createRef = (value) => {
  return new RefImpl(value)
}
exports.createRef = createRef
const isObject = (value) => {
  return value != null && typeof value === 'object'
}
const convert = (value) => {
  isObject(value) ? (0, reactive_1.reactive)(value) : value
}
// 是否是ref对象
const isRef = (ref) => {
  return !!ref.__v_isRef
}
exports.isRef = isRef
// ref对象转化为普通对象
const unRef = (ref) => {
  return (0, exports.isRef)(ref) ? ref.value : ref
}
exports.unRef = unRef
