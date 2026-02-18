// arken/packages/seer/packages/protocol/src/modules/infinite/infinite.methodResolver.ts
export type InfiniteMethodName = 'saveRound' | 'interact' | 'getScene';

type ServiceMap = Record<string, unknown> | undefined;

const hasOwnFunction = (service: ServiceMap, method: InfiniteMethodName): ((...args: unknown[]) => unknown) | undefined => {
  if (!service || !Object.prototype.hasOwnProperty.call(service, method)) {
    return undefined;
  }

  const candidate = service[method];
  return typeof candidate === 'function' ? candidate : undefined;
};

export const resolveInfiniteMethod = (
  service: { Infinite?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: InfiniteMethodName
): Function => {
  const infiniteHandler = hasOwnFunction(service.Infinite, method);
  const evolutionHandler = hasOwnFunction(service.Evolution, method);
  const saveRoundFallback = method === 'saveRound' ? hasOwnFunction(service.Evolution, 'saveRound') : undefined;

  const handler = infiniteHandler ?? evolutionHandler ?? saveRoundFallback;

  if (!handler) {
    throw new Error(`Infinite service method unavailable: ${method}`);
  }

  return handler;
};
