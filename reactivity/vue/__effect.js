"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trigger = exports.track = exports.effect = void 0;
// 保存当前的副作用函数
let activeEffect;
// 保存所有的响应式对象
const targetMap = new WeakMap();
// 副作用函数乞丐版
const effect = (fn) => {
    const _effect = function () {
        activeEffect = _effect;
        fn();
    };
    _effect();
};
exports.effect = effect;
const track = (target, key) => {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }
    deps.add(activeEffect);
};
exports.track = track;
// 触发依赖
const trigger = (target, key) => {
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    deps.forEach((effect) => effect());
};
exports.trigger = trigger;
