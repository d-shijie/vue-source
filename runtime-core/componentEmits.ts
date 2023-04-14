// 首字母大写
export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

// 添加 on 前缀，并且首字母大写
export const toHandlerKey = (str: string) =>
  str ? `on${capitalize(str)}` : ``;

// 用来匹配 kebab-case 的情况
// 比如 onTest-event 可以匹配到 T
// 然后取到 T 在前面加一个 - 就可以
// \BT 就可以匹配到 T 前面是字母的位置
const hyphenateRE = /\B([A-Z])/g;
export const hyphenate = (str: string) =>
  str.replace(hyphenateRE, "-$1").toLowerCase();

const camelizeRE = /-(\w)/g;
export const camelize = (str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
};

export function emit (instance, event: string, ...rawArgs) {
  // emit 是基于 props 里面的 onXXX 的函数来进行匹配的
  // 所以我们先从 props 中看看是否有对应的 event handler
  const props = instance.props;
  // ex: event -> click 那么这里取的就是 onClick
  // 让事情变的复杂一点如果是烤肉串命名的话，需要转换成  change-page -> changePage
  // 需要得到事件名称 

  let handler = props[toHandlerKey(camelize(event))];

  // 如果上面没有匹配的话 那么在检测一下 event 是不是 kebab-case 类型
  if (!handler) {

    handler = props[(toHandlerKey(hyphenate(event)))]
  }

  if (handler) {
    handler(...rawArgs);
  }
}