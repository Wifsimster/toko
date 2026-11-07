export type ScrollOffsetHandler = (event: { nativeEvent: { contentOffset: { y: number } } }) => void;

export function createThresholdWatcher(
  onChange: (past: boolean) => void,
): (offsetY: number, threshold: number) => void {
  let past = false;
  return (offsetY, threshold) => {
    const next = threshold > 0 && offsetY > threshold;
    if (next === past) return;
    past = next;
    onChange(next);
  };
}

export function chainScrollHandlers<E>(
  first: ((event: E) => void) | undefined,
  second: (event: E) => void,
): (event: E) => void {
  return (event) => {
    first?.(event);
    second(event);
  };
}
