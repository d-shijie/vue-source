import { createVNode } from './vnode'

export const createAppApi = (render) => {
  return function createApp(rootComponent) {
    const app = {
      _component: rootComponent,
      mount(rootContainer) {
        // 基于根组件创建vnode
        const vnode = createVNode(rootComponent)
        // 调用render rootContainer->#app
        render(vnode, rootContainer)
      },
    }
    return app
  }
}
