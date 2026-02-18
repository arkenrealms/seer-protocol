// arken/packages/seer/packages/protocol/src/modules/infinite/infinite.methodResolver.ts
export type InfiniteMethodName = 'saveRound' | 'interact' | 'getScene';

type ServiceMap = Record<string, unknown> | undefined;

type InfiniteMethodHandler = (...args: unknown[]) => unknown;

const hasOwnFunction = (service: ServiceMap, method: InfiniteMethodName): InfiniteMethodHandler | undefined => {
  if (!service || !Object.prototype.hasOwnProperty.call(service, method)) {
    return undefined;
  }

  try {
    const candidate = service[method];
    if (typeof candidate !== 'function') {
      return undefined;
    }

    return (...args: unknown[]) => Reflect.apply(candidate, service, args);
  } catch {
    return undefined;
  }
};

export const resolveInfiniteMethod = (
  service: { Infinite?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: InfiniteMethodName
): InfiniteMethodHandler => {
  const infiniteHandler = hasOwnFunction(service.Infinite, method);
  const evolutionHandler = hasOwnFunction(service.Evolution, method);
  const saveRoundFallback = method === 'saveRound' ? hasOwnFunction(service.Evolution, 'saveRound') : undefined;

  const handler = infiniteHandler ?? evolutionHandler ?? saveRoundFallback;

  if (!handler) {
    throw new Error(`Infinite service method unavailable: ${method}`);
  }

  return handler;
};
