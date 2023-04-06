import { track, trigger } from './effect'

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
export const reactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowMap = new WeakMap()

export const reactive = <T extends Object>(target: T) => {
  return createReactiveObject(target, reactiveMap, reactiveHandler)
}
export const readonly = <T extends Object>(target: T) => {
  return createReactiveObject(target, readonlyMap, readonlyHandler)
}
export const shallow = <T extends Object>(target: T) => {
  return createReactiveObject(target, shallowMap, shallowHandler)
}
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

export const reactiveHandler = {
  get,
  set,
}
export const readonlyHandler = {
  get: get(true, false),
  set,
}
export const shallowHandler = {
  get: get(false, true),
  set,
}
// get可以分为reactive响应式 readonly只读模式  shallowReadonly表层响应 只有对象第一层为响应式
function get(isReadonly = false, isShallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    // 只读模式不可进行改变值 就不收集依赖
    if (!isReadonly) {
      track(target, key)
    }
    // 就最外层响应式
    if (isShallow) {
      return res
    }
    if (typeof res != null && typeof res === 'object') {
      // 给对象每一层都包裹reactive保证每一层都可响应式
      return reactive(res)
    }
    return res
  }
}

// 返回proxy的set
function set() {
  return function set(target, key, value, receiver) {
    const res = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return res
  }
}
