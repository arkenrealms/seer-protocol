// arken/packages/seer/packages/protocol/src/modules/methodResolver.ts
export type MethodHandler = (...args: unknown[]) => unknown;

type ServiceMap = Record<string, unknown> | undefined;

export const getOwnMethodHandler = <MethodName extends string>(
  service: ServiceMap,
  method: MethodName
): MethodHandler | undefined => {
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

export const resolveModuleMethod = <ServiceName extends string, MethodName extends string>(params: {
  moduleName: ServiceName;
  method: MethodName;
  primaryService?: Record<string, unknown>;
  fallbackService?: Record<string, unknown>;
  allowMethodMatchedFallback?: boolean;
  allowSaveRoundFallback?: boolean;
}): MethodHandler => {
  const {
    moduleName,
    method,
    primaryService,
    fallbackService,
    allowMethodMatchedFallback = true,
    allowSaveRoundFallback,
  } = params;

  const normalizedMethod = typeof method === 'string' ? method.trim() : '';
  if (!normalizedMethod) {
    throw new Error(`${moduleName} service method unavailable: <empty>`);
  }

  const primaryHandler = getOwnMethodHandler(primaryService, normalizedMethod as MethodName);
  const methodMatchedFallbackHandler =
    !allowMethodMatchedFallback || (normalizedMethod === 'saveRound' && !allowSaveRoundFallback)
      ? undefined
      : getOwnMethodHandler(fallbackService, normalizedMethod as MethodName);

  const handler = primaryHandler ?? methodMatchedFallbackHandler;

  if (!handler) {
    throw new Error(`${moduleName} service method unavailable: ${normalizedMethod}`);
  }

  return handler;
};
