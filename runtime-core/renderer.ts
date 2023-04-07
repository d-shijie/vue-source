import { Text, Fragment, ShapFlags } from './vnode'
import { createAppApi } from './createApp'
export function createRenderer(options) {
  const {
    createElement: hostCreateElement, //document.createElement
    setElementText: hostSetElementText,
    createText: hostCreateText, //document.createTextNode
    setText: hostSetText,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
  } = options

  function render(vnode, container) {
    patch(null, vnode, container)
  }
  // 节点的更新
  // n1虚拟节点旧节点 n2虚拟节点新节点 container真实dom容器 parentComponent父节点虚拟节点 anchor保存一个真实dom 便于insert
  function patch(
    n1,
    n2,
    container = null,
    anchor = null,
    parentComponent = null,
  ) {
    // 根据n2判断 因为n2是新节点
    const { shapFlag, type } = n2
    // 根据type和shapFlag判断如何处理vnode
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break
      case Fragment:
        processFragment(n1, n2, container)
        break
      default:
        if (shapFlag & ShapFlags.ELEMENT) {
          processElement(n1, n2, container, anchor, parentComponent)
        } else if (shapFlag & ShapFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  function processText(n1, n2, container) {
    // n1为null说明是init阶段
    // 直接create->insert
    // hostCreateText document.createTextNode创建文本节点 将新建的文本dom节点绑定到vnode的el上，再insert到容器上
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    } else {
      // update 当n1和n2不同同才更新
      // 需要将n1的el赋值给n2 相当于新节点先继承旧节点内容再进行更新
      const el = (n2.el = n1.el!)
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }
  // 处理template
  function processFragment(n1, n2, container) {
    if (!n1) {
      mountChildren(n2.children, container)
    }
  }
  // 处理元素 div p span ...
  function processElement(n1, n2, container, anthor, parentComponent) {
    if (!n1) {
      mountElement(n2, container, anthor)
    } else {
      updateElement(n1, n2, container, anthor, parentComponent)
    }
  }
  // 处理组件
  function processComponent(n1, n2, container, parentComponent) {}
  function mountChildren(children, container) {
    children.forEach((VnodeChild) => {
      patch(null, VnodeChild, container)
    })
  }
  function mountElement(vnode, container, anthor) {
    const { shapFlag, props } = vnode
    // 渲染element vnode的type肯定为一个html标签字符串
    // 创建一个html元素赋值给el
    const el = (vnode.el = hostCreateElement(vnode.type))
    // vnode的children为一个字符串 直接渲染即可
    // createVNode('div',{},'vue3')
    // el= <div></div>
    if (shapFlag & ShapFlags.TEXT_CHILDREN) {
      // <div>vue3</div>
      hostSetElementText(el, vnode.children)
    } else if (shapFlag & ShapFlags.ARRAY_CHILDREN) {
      // 如果children是一个数组 遍历递归children渲染
      // createVNode('div',{},[createVNode('div',{},'1'),createVNode('div',{},'2')])
      // <div>
      //   <div>1</div>
      //   <div>2</div>
      // </div>
      mountChildren(vnode.children, el)
    }

    if (props) {
      for (const key in props) {
        // 此处需要过滤vue自带的key 比如生命周期等：onMounted、beforeMounted
        // 源码中对生命周期各阶段定义了枚举可借此进行过滤
        const value = props[key]
        hostPatchProp(el, key, null, value)
      }
    }
    // 最后再将dom insert到容器中
    // container=<div></div>
    // 假如shapFlag&ShapFlags.TEXT_CHILDREN
    // <div>
    //   <div>vue3</div>
    // <div>
    hostInsert(el, container, anthor)
  }
  function updateElement(n1, n2, container, anthor, parentComponent) {
    const oldProps = (n1 && n1.props) || {}
    const newProps = n2.props || {}
    const el = (n2.el = n1.el!)
    // 对比新旧props
    patchProps(el, oldProps, newProps)
    // 对比children
    patchChildren(n1, n2, el, anthor, parentComponent)
  }
  function patchProps(el, oldProps, newProps) {
    // 新节点新增和修改props
    // oldProps和newProps中都存在相同的key但是value改变了 {name:'xxx',age:18} {name:'xxx',age:16}
    // 此处也包含了newProps中增加了key 所以必须从newProps遍历 {name:'xxx',age:18} {name:'xxx',age:16,sex:'man'}
    // Object.keys(newProps).length>=Object.keys(oldProps).length
    for (const key in newProps) {
      const preValue = oldProps[key]
      const nextValue = newProps[key]
      if (preValue !== nextValue) {
        hostPatchProp(el, key, preValue, nextValue)
      }
    }
    // 新节点删除props
    // oldProps中有 newProps中不存在 {name:'xxx',age:18} {age:18}
    // 此处必须从oldProps中遍历 因为props中的属性在newProps中已经不存在
    for (const key in oldProps) {
      const preValue = oldProps[key]
      const nextValue = null
      // 当key存在于newProps中 所明已经处理过 不需要在进行转换
      if (!(key in newProps)) {
        // 直接将指定key值的value设为null
        hostPatchProp(el, key, preValue, nextValue)
      }
    }
  }
  function patchChildren(n1, n2, el, anthor, parentComponent) {
    const { shapeFlag: prevShapFlag, children: c1 } = n1
    const { shapFlag: nextShapFlag, children: c2 } = n2
    // 如果新节点的children为文本 判断是否与旧节点相同 不同重新赋值即可
    if (nextShapFlag & ShapFlags.TEXT_CHILDREN) {
      if (c1 !== c2) {
        hostSetElementText(el, c2 as string) // el.textContent=c2
      }
    } else {
      // 如果新节点的children不为文本而旧节点children是文本 将dom中文本清空后重新渲染新节点children
      if (prevShapFlag & ShapFlags.TEXT_CHILDREN) {
        hostSetElementText(el, '')
        mountChildren(c2, el)
      } else {
        // 只剩下新旧节点都为array的情况
        // diff important!!!
        // TODO 应该区分是否有key的情况
        patchKeyedChildren(c1, c2, el, anthor, parentComponent)
      }
    }
  }
  function patchKeyedChildren(
    c1: any[],
    c2: any[],
    container,
    parentAnthor,
    parentComponent
  ) {
    let e1=c1.length-1
    let e2=c2.length-1
    let i=0
    const isSameVNodeType=(n1,n2)=>{
     return n1.key===n2.key&&n1.type===n2.type
    }
    // 此两步都是为了复用节点 相同的节点直接取代旧节点即可
    // 从左往右遍历子节点
    while (i<=e1&&i<=e2){
      if(!isSameVNodeType(c1[i],c2[i])){
        break;
      }
      patch(c1[i],c2[i],container,parentAnthor,parentComponent)
      i++
    }
    // 从右往左遍历子节点
    while(i<=e1&&i<=e2){
     if(!isSameVNodeType(c1[e1],c2[e2])){
      break
     }
     patch(c1[e1],c2[e2],container,parentAnthor,parentComponent)
     e1--
     e2--
    }
    // 此情况说明新节点多余旧节点 需要新增
    // 新增分为添加到尾部还是头部
    if(i>e1&&i<=e2){
      // 通过nextPos进行参照物判断从头部插入还是尾部
      const nextPos=e2+1
      // 当前序比较时，从头部往尾部比较，在有不同节点时跳出循环
      // 此时的c2.length是不变的，c2.length永远小于nextPos，所以在尾部插入节点
      // 当后序比较时，若存在相同的节点，e2存在操作e2--
      // 此时的nextPos是小于c2.length的，给锚点anthor做参照物在头部插入节点
      const anthor=nextPos<c2.length?c2[nextPos].el:null
        while(i<=e2){
          patch(null,c2[i],container,anthor)
          i++
        }
    }else if(i<=e1&&i>e2){
      // 此时说明旧节点数量大于新节点数量
      // 此时需要删除旧节点多余的节点
      while(i<=e1){
        hostRemove(c1[i].el)
        i++
      }
    }else {
      // 此时只剩下中间存在乱序的情况 
      // a,b,[c,d,e],f,g
      // a,b,[e,c,d],f,g
      let s1=i
      let s2=i
      let moved=false
      let maxNewIndexSoFar=0
      // 用于存储新节点的key和下标index
      const keyToNewIndexMap=new Map()
      for(let i=s2;i<e2;i++){
        const nextChild=c2[i]
        keyToNewIndexMap.set(nextChild.key,i)
      }
      // 需要处理新节点的数量
      const toBePatched=e2-s2+1
      let patched=0
      // 用于保存新节点与旧节点索引的映射 
      const newIndexToOldIndexMap=new Array(toBePatched)
      // 初始化都为0 若后面经过处理还为0则表示新值在在旧值中不存在
      for(let i=0;i<newIndexToOldIndexMap.length;i++) newIndexToOldIndexMap[i]=i

      // 遍历老节点 
      // 找出旧节点存在而新节点不存在的 删除掉
      // 新旧节点都存在的 需要patch 此时的patch为了更新props 
      for(let i=s1;i<e1;i++){
        const prevChild=c1[i]
        
        // 老节点数大于新节点的话直接删除
        if(patched>=toBePatched){
            hostRemove(c1[i].el)
            continue
        }
        // 老节点在新节点map中的下标
        // 新老节点可能只是做出了位置的移动 只有index在改变key值是不变的 
        let newIndex
        if(prevChild.key!=null){
          newIndex=keyToNewIndexMap.get(prevChild.key) 
        }else {
          for(let j=s2;j<e2;j++){
            if(isSameVNodeType(prevChild,c2[j])){
              newIndex=j
              break
            }
          }
        }
        
        // 在新节点索引中未发现旧节点的 说明旧节点被删除
        if(newIndex===undefined){
          hostRemove(prevChild.el)
        }else {
          // 新旧节点都存在
          // 保存新旧节点索引的映射
          // newIndex->新节点的索引 s2->新节点的起始坐标 i->旧节点的索引
          // AB(CDEF)HG AB(DCSE)HG
          // [4,3,0,5] +1是因为i可能为0 需要用0判断新节点是否新建的 
          // 0就表明此映射的节点为新建节点
          newIndexToOldIndexMap[newIndex-s2]=i+1
        }
      }
    }
  }
  return {
    render,
    // 用于初始化根节点 const app=createApp(App) App为App.vue
    createApp: createAppApi(render),
  }
}
