import { createVNode } from './vnode'
// 就是createVNode
export const h = (type: any, props: any, children: any[] | string) => {
  return createVNode(type, props, children)
}
