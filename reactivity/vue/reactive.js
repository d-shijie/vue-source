'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.shallowHandler =
  exports.readonlyHandler =
  exports.reactiveHandler =
  exports.shallow =
  exports.readonly =
  exports.reactive =
  exports.shallowMap =
  exports.readonlyMap =
  exports.reactiveMap =
    void 0
const effect_1 = require('./effect.js')
// demo way
// export const reactive = <T extends Object>(target: T) => {
//   return new Proxy(target, {
//     get(target, key, receiver) {
//       const res=Reflect.get(target, key, receiver)
//       track(target,key)
//       // Reflect保证上下文的统一
//       return res
//     },
//     set(target, key, value, receiver) {
//       const res=Reflect.set(target, key, value, receiver)
//       trigger(target,key)
//       return res
//     },
//   })
// }
// 保存各个类型的对象 做缓存
exports.reactiveMap = new WeakMap()
exports.readonlyMap = new WeakMap()
exports.shallowMap = new WeakMap()
const reactive = (target) => {
  return createReactiveObject(
    target,
    exports.reactiveMap,
    exports.reactiveHandler
  )
}
exports.reactive = reactive
const readonly = (target) => {
  return createReactiveObject(
    target,
    exports.readonlyMap,
    exports.readonlyHandler
  )
}
exports.readonly = readonly
const shallow = (target) => {
  return createReactiveObject(
    target,
    exports.shallowMap,
    exports.shallowHandler
  )
}
exports.shallow = shallow
function createReactiveObject(target, proxyMap, handler) {
  // 是否在缓存中已有当前的proxy对象 有就取缓存中的没有就新建 且把新建的放入缓存
  const proxy = proxyMap.get(target)
  if (proxy) {
    return proxy
  }
  const newProxy = new Proxy(target, handler)
  proxyMap.set(target, newProxy)
  return newProxy
}
exports.reactiveHandler = {
  get,
  set,
}
exports.readonlyHandler = {
  get: get(true, false),
  set,
}
exports.shallowHandler = {
  get: get(false, true),
  set,
}
// get可以分为reactive响应式 readonly只读模式  shallowReadonly表层响应 只有对象第一层为响应式
function get(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    // 只读模式不可进行改变值 就不收集依赖
    if (!isReadonly) {
      ;(0, effect_1.track)(target, key)
    }
    // 就最外层响应式
    if (isShallow) {
      return res
    }
    if (typeof res != null && typeof res === 'object') {
      // 给对象每一层都包裹reactive保证每一层都可响应式
      return (0, exports.reactive)(res)
    }
    return res
  }
}
// 返回proxy的set
function set() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    ;(0, effect_1.trigger)(target, key)
    return res
  }
}
