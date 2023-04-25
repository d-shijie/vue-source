let activeEffect;
export function effect(fn) {
    const _effect = function () {
        activeEffect = _effect;
        fn();
    };
    _effect();
}
const targetMap = new WeakMap();
export function track(taregt, key) {
    let depsMap = targetMap.get(taregt);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(taregt, depsMap);
    }
    let deps = depsMap.get(key);
    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }
    deps.add(activeEffect);
}
export function tragger(target, key) {
    const depsMap = targetMap.get(target);
    const deps = depsMap.get(key);
    deps.forEach(effect => {
        effect();
    });
}
