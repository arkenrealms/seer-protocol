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
