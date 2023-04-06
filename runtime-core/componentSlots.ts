import { ShapFlags } from './vnode'
export const initSlots = (instance, children) => {
  const { vnode } = instance

  // vnode子节点类型为slots
  if (vnode.shapeFlag & ShapFlags.SLOTS_CHILDREN) {
    normalizeObjectSlots(children, (instance.slots = {}))
  }
}
export const normalizeObjectSlots = (rawSlots, slots) => {
  for (let key in rawSlots) {
    const value = rawSlots[key]
    if (typeof value === 'function') {
      slots[key] = (props) => normalizeSlotValue(value(props))
    }
  }
}
function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
