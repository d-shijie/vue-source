import { trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'
export class RefImpl {
  // 此对象的依赖
  public dep
  // 是否是ref类型
  public __v_isRef = true
  // 因为直接使用set方法修改value会产生栈溢出 所以使用_value做缓存
  private _value
  // 普通值的缓存 也用来比较新旧值是否相同
  private _rawValue

  constructor(value) {
    this._rawValue = value
    // 若value是一个对象 则进行reactive
    this._value = convert(value)
    this.dep = new Set()
  }

  // 因为设定的value值 所以使用ref定义的值需要使用ref.value获取
  get value() {
    trackEffects(this.dep)
    return this._value
  }

  set value(newValue) {
    // 当新旧值不同时
    if (!Object.is(newValue, this._rawValue)) {
      this._value = convert(newValue)
      this._rawValue = newValue
      trackEffects(this.dep)
    }
  }
}
export const ref = (value) => {
  return createRef(value)
}
export const createRef = (value) => {
  return new RefImpl(value)
}
const isObject = (value) => {
  return value != null && typeof value === 'object'
}
const convert = (value) => {
  isObject(value) ? reactive(value) : value
}

// 是否是ref对象
export const isRef = (ref) => {
  return !!ref.__v_isRef
}
// ref对象转化为普通对象
export const unRef = (ref) => {
  return isRef(ref) ? ref.value : ref
}
