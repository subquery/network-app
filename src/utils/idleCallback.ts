export const idleTimeout = (func: () => void) => setTimeout(func, 200);
export const idleCallback = window.requestIdleCallback || idleTimeout;

export const idleQueue = async (queue: (() => void)[]) => {
  const [first, ...rest] = queue;
  if (!first) return;
  await first();
  idleCallback(() => idleQueue(rest));
};
