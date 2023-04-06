// 通过按位与&与按位或|计算
// 1001&1001=1001 true 包含 1010&0101=0000 false 相同位数为1相加得1 最后结果不为0为true
// 1001|1001=0000 包含 1010|0101=1111===15 不同位数相加得1
// 以此判断虚拟节点子节点类型
export const enum ShapFlags {
  // vnode类型
  // 普通元素 div p span
  ELEMENT = 1, // 0001
  // 组件类型
  STATEFUL_COMPONENT = 1 << 2, //  0100 4
  // vnode的children类型
  TEXT_CHILDREN = 1 << 3, // 1000 8
  // vnode 的 children 为数组类型
  ARRAY_CHILDREN = 1 << 4, // 10000 16
  // vnode 的 children 为 slots 类型
  SLOTS_CHILDREN = 1 << 5, // 100000 32
}
// createVNode('h1',{key:1},'Hello world')
export const createVNode = (
  // type可以为string和对象
  type: any,
  props?: any,
  children?: string | any[] // 是string就是普通text文本 数组就为虚拟点数组
) => {
  // 虚拟节点对象
  const vnode = {
    type,
    props: props || {}, // 一些自定义属性
    children,
    key: props?.key, // 方便diff
    component: null,
    el: null, // 真实的dom
    shapeFlag: getShapeFlag(type), // 判断虚拟节点的类型 且可以根据此属性判断children的类型
  }

  // children是一个数组 重新定义vnode的shapeFlag说明此节点存在children且为array节点类型
  if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapFlags.ARRAY_CHILDREN
  } else {
    vnode.shapeFlag |= ShapFlags.TEXT_CHILDREN
  }

  normalizeChildren(vnode, children)
  return vnode
}
// type是个string就是元素 否者就是组件
function getShapeFlag(type) {
  return typeof type === 'string'
    ? ShapFlags.ELEMENT
    : ShapFlags.STATEFUL_COMPONENT
}
function normalizeChildren(vnode, children) {
  // 判断children是否为slots类型
  if (typeof children === 'object') {
    if (vnode.type & ShapFlags.ELEMENT) {
    } else {
      vnode.shapeFlag |= ShapFlags.SLOTS_CHILDREN
    }
  }
}

export const normalizeVNode = (child) => {
  if (typeof child === 'string' || typeof child === 'number') {
    return createVNode(Text, {}, String(child))
  } else {
    return child
  }
}
export const Text = Symbol('text')
export const Fragment = Symbol('fragment')

export const createTextVNode = (text: string) => {
  return createVNode(Text, {}, text)
}
