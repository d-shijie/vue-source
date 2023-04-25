import { track, tragger } from "./effect.js";
export const reactive = (target) => {
    return new Proxy(target, {
        get(target, key, receiver) {
            const res = Reflect.get(target, key, receiver);
            track(target, key);
            return res;
        },
        set(target, key, value, receiver) {
            const res = Reflect.set(target, key, value, receiver);
            tragger(target, key);
            return res;
        }
    });
};
