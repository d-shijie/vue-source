/******/ ;(() => {
  // webpackBootstrap
  /******/ 'use strict'
  /******/ var __webpack_modules__ = {
    /***/ './vue/effect.js':
      /*!***********************!*\
  !*** ./vue/effect.js ***!
  \***********************/
      /***/ (__unused_webpack_module, exports) => {
        Object.defineProperty(exports, '__esModule', { value: true })
        exports.triggerEffects =
          exports.trigger =
          exports.trackEffects =
          exports.track =
          exports.stop =
          exports.effect =
          exports.ReactiveEffect =
            void 0
        // 保存当前的副作用函数  副作用函数可以简单理解为每个响应式对象的属性改变时的回调函数
        let activeEffect
        // 是否应该收集依赖 依赖就是需要跟踪的属性的副作用函数的集合
        let shouldTrack = false
        // 保存所有的响应式对象
        const targetMap = new WeakMap() // WeakMap的key值为引用类型 当原类型没被使用了WeakMap中的也会被垃圾回收
        // 创建副作用对象
        class ReactiveEffect {
          constructor(fn, scheduler) {
            this.fn = fn
            this.scheduler = scheduler
            // 是否收集依赖
            this.active = true
            this.deps = []
            // fn为用户的回调
          }
          // 指定run方法进行依赖的收集
          run() {
            if (!this.active) {
              this.fn() //只执行回调 不收集依赖
            }
            shouldTrack = true
            activeEffect = this
            const result = this.fn()
            // 重置
            shouldTrack = false
            activeEffect = undefined
            return result
          }
          // 停止收集依赖
          stop() {
            if (this.active) {
              // 清除内存
              cleanupEffect(this)
              if (this.onStop) {
                this.onStop()
              }
              // active为false不在收集依赖
              this.active = false
            }
          }
        }
        exports.ReactiveEffect = ReactiveEffect
        function cleanupEffect(effect) {
          effect.deps.forEach((dep) => {
            dep.delete(effect)
          })
          effect.deps.length = 0
        }
        // 副作用函数 用于作用与触发依赖时的动作
        const effect = (fn, options = {}) => {
          const _effect = new ReactiveEffect(fn)
          // 合并用户传过来的值
          Object.assign(_effect, options)
          // 开始收集依赖
          _effect.run()
          // 把 _effect.run 这个方法返回
          // 让用户可以自行选择调用的时机（调用 fn）
          const runner = _effect.run.bind(_effect)
          runner.effect = _effect
          return runner
        }
        exports.effect = effect
        // demo way
        // export const effect=(fn:Function)=>{
        //   const _effect=function(){
        //     activeEffect=_effect
        //     fn()
        //   }
        //   _effect()
        // }
        const stop = (runner) => {
          runner.effcet.stop()
        }
        exports.stop = stop
        // 依赖收集
        const track = (target, key) => {
          let depsMap = targetMap.get(target)
          if (!depsMap) {
            depsMap = new Map()
            targetMap.set(target, depsMap)
          }
          let dep = depsMap.get(key)
          if (!dep) {
            dep = new Set()
            depsMap.set(key, dep)
          }
          ;(0, exports.trackEffects)(dep)
        }
        exports.track = track
        const trackEffects = (dep) => {
          // 是否set中已存在此依赖 不存在再收集
          if (!dep.has(activeEffect)) {
            dep.add(activeEffect)
          }
          activeEffect.deps.push(dep)
        }
        exports.trackEffects = trackEffects
        const trigger = (target, key) => {
          const depsMap = targetMap.get(target)
          if (!depsMap) return
          const dep = depsMap.get(key)
          let effects = []
          dep.forEach((effect) => {
            // 此处直接effect对象run方法触发依赖就行 使用trackEffects为了复用
            // effect.run()
            effects.push(effect)
          })
          // new Set去掉多余的重复函数
          ;(0, exports.trackEffects)(new Set(effects))
        }
        exports.trigger = trigger
        const triggerEffects = (effects) => {
          effects.forEach((effect) => {
            if (effect.scheduler) {
              // scheduler 可以让用户自己选择调用的时机
              // 这样就可以灵活的控制调用了
              // 在 runtime-core 中，就是使用了 scheduler 实现了在 next ticker 中调用的逻辑
              effect.scheduler()
            } else {
              effect.run()
            }
          })
        }
        exports.triggerEffects = triggerEffects

        /***/
      },

    /***/ './vue/reactive.js':
      /*!*************************!*\
  !*** ./vue/reactive.js ***!
  \*************************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        Object.defineProperty(exports, '__esModule', { value: true })
        exports.shallowHandler =
          exports.readonlyHandler =
          exports.reactiveHandler =
          exports.shallow =
          exports.readonly =
          exports.reactive =
          exports.shallowMap =
          exports.readonlyMap =
          exports.reactiveMap =
            void 0
        const effect_1 = __webpack_require__(
          /*! ./effect.js */ './vue/effect.js'
        )
        // demo way
        // export const reactive = <T extends Object>(target: T) => {
        //   return new Proxy(target, {
        //     get(target, key, receiver) {
        //       const res=Reflect.get(target, key, receiver)
        //       track(target,key)
        //       // Reflect保证上下文的统一
        //       return res
        //     },
        //     set(target, key, value, receiver) {
        //       const res=Reflect.set(target, key, value, receiver)
        //       trigger(target,key)
        //       return res
        //     },
        //   })
        // }
        // 保存各个类型的对象 做缓存
        exports.reactiveMap = new WeakMap()
        exports.readonlyMap = new WeakMap()
        exports.shallowMap = new WeakMap()
        const reactive = (target) => {
          return createReactiveObject(
            target,
            exports.reactiveMap,
            exports.reactiveHandler
          )
        }
        exports.reactive = reactive
        const readonly = (target) => {
          return createReactiveObject(
            target,
            exports.readonlyMap,
            exports.readonlyHandler
          )
        }
        exports.readonly = readonly
        const shallow = (target) => {
          return createReactiveObject(
            target,
            exports.shallowMap,
            exports.shallowHandler
          )
        }
        exports.shallow = shallow
        function createReactiveObject(target, proxyMap, handler) {
          // 是否在缓存中已有当前的proxy对象 有就取缓存中的没有就新建 且把新建的放入缓存
          const proxy = proxyMap.get(target)
          if (proxy) {
            return proxy
          }
          const newProxy = new Proxy(target, handler)
          proxyMap.set(target, newProxy)
          return newProxy
        }
        exports.reactiveHandler = {
          get,
          set,
        }
        exports.readonlyHandler = {
          get: get(true, false),
          set,
        }
        exports.shallowHandler = {
          get: get(false, true),
          set,
        }
        // get可以分为reactive响应式 readonly只读模式  shallowReadonly表层响应 只有对象第一层为响应式
        function get(isReadonly = false, isShallow = false) {
          return function get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver)
            // 只读模式不可进行改变值 就不收集依赖
            if (!isReadonly) {
              ;(0, effect_1.track)(target, key)
            }
            // 就最外层响应式
            if (isShallow) {
              return res
            }
            if (typeof res != null && typeof res === 'object') {
              // 给对象每一层都包裹reactive保证每一层都可响应式
              return (0, exports.reactive)(res)
            }
            return res
          }
        }
        // 返回proxy的set
        function set() {
          return function set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver)
            ;(0, effect_1.trigger)(target, key)
            return res
          }
        }

        /***/
      },

    /***/ './vue/ref.js':
      /*!********************!*\
  !*** ./vue/ref.js ***!
  \********************/
      /***/ (__unused_webpack_module, exports, __webpack_require__) => {
        Object.defineProperty(exports, '__esModule', { value: true })
        exports.unRef =
          exports.isRef =
          exports.createRef =
          exports.ref =
          exports.RefImpl =
            void 0
        const effect_1 = __webpack_require__(
          /*! ./effect.js */ './vue/effect.js'
        )
        const reactive_1 = __webpack_require__(
          /*! ./reactive.js */ './vue/reactive.js'
        )
        class RefImpl {
          constructor(value) {
            // 是否是ref类型
            this.__v_isRef = true
            this._rawValue = value
            // 若value是一个对象 则进行reactive
            this._value = convert(value)
            this.dep = new Set()
          }
          // 因为设定的value值 所以使用ref定义的值需要使用ref.value获取
          get value() {
            ;(0, effect_1.trackEffects)(this.dep)
            return this._value
          }
          set value(newValue) {
            // 当新旧值不同时
            if (!Object.is(newValue, this._rawValue)) {
              this._value = convert(newValue)
              this._rawValue = newValue
              ;(0, effect_1.trackEffects)(this.dep)
            }
          }
        }
        exports.RefImpl = RefImpl
        const ref = (value) => {
          return (0, exports.createRef)(value)
        }
        exports.ref = ref
        const createRef = (value) => {
          return new RefImpl(value)
        }
        exports.createRef = createRef
        const isObject = (value) => {
          return value != null && typeof value === 'object'
        }
        const convert = (value) => {
          isObject(value) ? (0, reactive_1.reactive)(value) : value
        }
        // 是否是ref对象
        const isRef = (ref) => {
          return !!ref.__v_isRef
        }
        exports.isRef = isRef
        // ref对象转化为普通对象
        const unRef = (ref) => {
          return (0, exports.isRef)(ref) ? ref.value : ref
        }
        exports.unRef = unRef

        /***/
      },

    /******/
  }
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {}
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId]
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {},
      /******/
    })
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__
    )
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports
    /******/
  }
  /******/
  /************************************************************************/
  var __webpack_exports__ = {}
  // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
  ;(() => {
    var exports = __webpack_exports__
    /*!**********************!*\
  !*** ./vue/index.js ***!
  \**********************/

    Object.defineProperty(exports, '__esModule', { value: true })
    exports.shallow =
      exports.readonly =
      exports.reactive =
      exports.unRef =
      exports.isRef =
      exports.ref =
      exports.ReactiveEffect =
      exports.effect =
        void 0
    var effect_1 = __webpack_require__(/*! ./effect.js */ './vue/effect.js')
    Object.defineProperty(exports, 'effect', {
      enumerable: true,
      get: function () {
        return effect_1.effect
      },
    })
    Object.defineProperty(exports, 'ReactiveEffect', {
      enumerable: true,
      get: function () {
        return effect_1.ReactiveEffect
      },
    })
    var ref_1 = __webpack_require__(/*! ./ref.js */ './vue/ref.js')
    Object.defineProperty(exports, 'ref', {
      enumerable: true,
      get: function () {
        return ref_1.ref
      },
    })
    Object.defineProperty(exports, 'isRef', {
      enumerable: true,
      get: function () {
        return ref_1.isRef
      },
    })
    Object.defineProperty(exports, 'unRef', {
      enumerable: true,
      get: function () {
        return ref_1.unRef
      },
    })
    var reactive_1 = __webpack_require__(
      /*! ./reactive.js */ './vue/reactive.js'
    )
    Object.defineProperty(exports, 'reactive', {
      enumerable: true,
      get: function () {
        return reactive_1.reactive
      },
    })
    Object.defineProperty(exports, 'readonly', {
      enumerable: true,
      get: function () {
        return reactive_1.readonly
      },
    })
    Object.defineProperty(exports, 'shallow', {
      enumerable: true,
      get: function () {
        return reactive_1.shallow
      },
    })
  })()

  /******/
})()
