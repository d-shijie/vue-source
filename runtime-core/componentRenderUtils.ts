export function shouldUpdateComponent (n1, n2): boolean {
  const { props: prevProps } = n1
  const { props: nextProps } = n2
  if (prevProps === nextProps) return false
  if (!nextProps) return true
  if (!prevProps) !!nextProps
  return hasPropsChanged(prevProps, nextProps)
}
function hasPropsChanged (prevProps, nextProps): boolean {

  const nextKeys = Object.keys(nextProps)
  if (nextKeys.length !== Object.keys(prevProps).length) return true

  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i]
    if (nextProps[key] !== prevProps[key]) return true
  }
  return false
}