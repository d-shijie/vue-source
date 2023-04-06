'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.triggerEffects =
  exports.trigger =
  exports.trackEffects =
  exports.track =
  exports.stop =
  exports.effect =
  exports.ReactiveEffect =
    void 0
// 保存当前的副作用函数  副作用函数可以简单理解为每个响应式对象的属性改变时的回调函数
let activeEffect
// 是否应该收集依赖 依赖就是需要跟踪的属性的副作用函数的集合
let shouldTrack = false
// 保存所有的响应式对象
const targetMap = new WeakMap() // WeakMap的key值为引用类型 当原类型没被使用了WeakMap中的也会被垃圾回收
// 创建副作用对象
class ReactiveEffect {
  constructor(fn, scheduler) {
    this.fn = fn
    this.scheduler = scheduler
    // 是否收集依赖
    this.active = true
    this.deps = []
    // fn为用户的回调
  }
  // 指定run方法进行依赖的收集
  run() {
    if (!this.active) {
      this.fn() //只执行回调 不收集依赖
    }
    shouldTrack = true
    activeEffect = this
    const result = this.fn()
    // 重置
    shouldTrack = false
    activeEffect = undefined
    return result
  }
  // 停止收集依赖
  stop() {
    if (this.active) {
      // 清除内存
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      // active为false不在收集依赖
      this.active = false
    }
  }
}
exports.ReactiveEffect = ReactiveEffect
function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}
// 副作用函数 用于作用与触发依赖时的动作
const effect = (fn, options = {}) => {
  const _effect = new ReactiveEffect(fn)
  // 合并用户传过来的值
  Object.assign(_effect, options)
  // 开始收集依赖
  _effect.run()
  // 把 _effect.run 这个方法返回
  // 让用户可以自行选择调用的时机（调用 fn）
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}
exports.effect = effect
// demo way
// export const effect=(fn:Function)=>{
//   const _effect=function(){
//     activeEffect=_effect
//     fn()
//   }
//   _effect()
// }
const stop = (runner) => {
  runner.effcet.stop()
}
exports.stop = stop
// 依赖收集
const track = (target, key) => {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  ;(0, exports.trackEffects)(dep)
}
exports.track = track
const trackEffects = (dep) => {
  // 是否set中已存在此依赖 不存在再收集
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
  activeEffect.deps.push(dep)
}
exports.trackEffects = trackEffects
const trigger = (target, key) => {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  let effects = []
  dep.forEach((effect) => {
    // 此处直接effect对象run方法触发依赖就行 使用trackEffects为了复用
    // effect.run()
    effects.push(effect)
  })
  // new Set去掉多余的重复函数
  ;(0, exports.trackEffects)(new Set(effects))
}
exports.trigger = trigger
const triggerEffects = (effects) => {
  effects.forEach((effect) => {
    if (effect.scheduler) {
      // scheduler 可以让用户自己选择调用的时机
      // 这样就可以灵活的控制调用了
      // 在 runtime-core 中，就是使用了 scheduler 实现了在 next ticker 中调用的逻辑
      effect.scheduler()
    } else {
      effect.run()
    }
  })
}
exports.triggerEffects = triggerEffects
