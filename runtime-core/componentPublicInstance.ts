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
export const PublicInstanceProxyHandlers = {}
