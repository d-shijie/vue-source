// 判断目标对象自身是否存在key
export const hasOwn = (val, key) => {
  return Object.prototype.hasOwnProperty.call(val, key)
}
const publicPropertiesMap = {
  // i就是组件实例
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
  $props: (i) => i.props,
  $emit: (i) => i.emit,
}
// 需要用户在render函数中通过使用this触发proxy
//  setup(props,context){
//  此时return的对象就是setupState 
//  return {
//  }
// }
export const PublicInstanceProxyHandlers = {
  get ({ _: instance }, key) {
    const { setupState, props } = instance
    if (key[0] !== '$') {
      if (hasOwn(setupState, key)) {
        return setupState[key]
      } else if (hasOwn(props, key)) {
        return props[key]
      }
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) return publicGetter(instance)
  },
  set ({ _: instance }, key, value) {
    // 只修改setup的返回值即可 因为props只读
    const { setupState } = instance
    if (hasOwn(instance, key)) {
      setupState[key] = value
    }
    return true
  }
}
