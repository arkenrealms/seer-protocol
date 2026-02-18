// arken/packages/seer/packages/protocol/src/modules/isles/isles.methodResolver.ts
export type IslesMethodName = 'saveRound' | 'interact' | 'getScene';

type ServiceMap = Record<string, unknown> | undefined;

type IslesMethodHandler = (...args: unknown[]) => unknown;

const hasOwnFunction = (service: ServiceMap, method: IslesMethodName): IslesMethodHandler | undefined => {
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

export const resolveIslesMethod = (
  service: { Isles?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: IslesMethodName
): IslesMethodHandler => {
  const islesHandler = hasOwnFunction(service.Isles, method);
  const evolutionHandler = hasOwnFunction(service.Evolution, method);
  const saveRoundFallback = method === 'saveRound' ? hasOwnFunction(service.Evolution, 'saveRound') : undefined;

  const handler = islesHandler ?? evolutionHandler ?? saveRoundFallback;

  if (!handler) {
    throw new Error(`Isles service method unavailable: ${method}`);
  }

  return handler;
};
