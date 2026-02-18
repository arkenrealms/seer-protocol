// arken/packages/seer/packages/protocol/src/modules/infinite/infinite.methodResolver.ts
export type InfiniteMethodName = 'saveRound' | 'interact' | 'getScene';

export const resolveInfiniteMethod = (
  service: { Infinite?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: InfiniteMethodName
): Function => {
  const infiniteService = service.Infinite as any;
  const evolutionService = service.Evolution as any;
  const handler = infiniteService?.[method] ?? evolutionService?.[method] ?? (method === 'saveRound' ? evolutionService?.saveRound : undefined);

  if (typeof handler !== 'function') {
    throw new Error(`Infinite service method unavailable: ${method}`);
  }

  return handler;
};
