// 保存当前的副作用函数
let activeEffect: any

// 保存所有的响应式对象
const targetMap = new WeakMap()

// 副作用函数乞丐版
export const effect = (fn: Function) => {
  const _effect = function () {
    activeEffect = _effect
    fn()
  }
  _effect()
}
export const track = (target: any, key: any) => {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }
  deps.add(activeEffect)
}

// 触发依赖
export const trigger = (target: any, key: any) => {
  const depsMap = targetMap.get(target)
  const deps = depsMap.get(key)

  deps.forEach((effect: any) => effect())
}
