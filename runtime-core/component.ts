import { emit } from "./componentEmits"
import { initProps } from "./componentProps"
import { initSlots } from "./componentSlots"
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
export function createComponentInstance (vnode, parent) {
  const instance = {
    type: vnode.type,
    vnode,
    next: null, // 需要更新的vnode 用于更新component类型的组件
    props: {},
    parent,
    provides: parent ? parent.provides : {},
    proxy: null,
    isMounted: false,
    attrs: {}, // 存放attrs的数据
    slots: {}, // 存放插槽的数据
    ctx: {}, // 存放context的数据
    setupState: {}, // 存放setup的返回值
    emit: () => { }
  }
  instance.ctx = {
    _: instance
  }
  // 赋值 emit
  // 这里使用 bind 把 instance 进行绑定
  // 后面用户使用的时候只需要给 event 和参数即可 $emit('customEvent',arg1,arg2,...)
  instance.emit = emit.bind(null, instance) as any
  return instance
}

export function setupComponent (instance) {
  const { props, children } = instance.vnode
  initProps(instance, props)
  initSlots(instance, children)
  setupStatefulComponent(instance)
}
function setupStatefulComponent (instance) {
  // 代理实例的ctx属性 ctx存放了当前组件的实例
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
  // 组件类型的vnode的type属性就是此组件 
  // export default { setup(props,context){ return{} } }
  // createVNode({ setup(props,context){ return{} } })
  // export出的对象就是vnode的type即是实例的type
  const Component = instance.type

  // 将props和context传给setup
  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    const setupContext = createSetupContext(instance)
    //TODO 此处的props应只为可读的
    const setupResult = setup && setup(instance.props, setupContext)
    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function createSetupContext (instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
  };
}

function handleSetupResult (instance, setupResult) {
  // setup返回值不同处理不同
  if (typeof setupResult === 'function') {
    instance.render = setupResult
  } else if (typeof setupResult === 'object') {
    // 此处需要将setupResult进行响应式转换 
    // 不做此处理 const a= ref(1) 在setup返回时带上value setup(){return{a.value}} 
    // 重新代理了一遍ref.value
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup (instance) {
  // 给instance设置render
  const Component = instance.type
  // setup可能返回函数给render
  if (!instance.render) {
    if (compile && !Component.render) {
      if (Component.template) {
        const template = Component.template
        Component.render = compile(template)
      }
    }
  }
  instance.render = Component.render
}
let currentInstance = {}
function setCurrentInstance (instance) {
  currentInstance = instance
}
export function getCurrentInstance () {
  return currentInstance
}

let compile;
export function registerRuntimeCompiler (_compile) {
  compile = _compile;
}
