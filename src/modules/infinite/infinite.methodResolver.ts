// arken/packages/seer/packages/protocol/src/modules/infinite/infinite.methodResolver.ts
import { getOwnMethodHandler, type MethodHandler } from '../methodResolver.ts';

export type InfiniteMethodName = 'saveRound' | 'interact' | 'getScene';

type InfiniteMethodHandler = MethodHandler;

export const resolveInfiniteMethod = (
  service: { Infinite?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: InfiniteMethodName
): InfiniteMethodHandler => {
  const infiniteHandler = getOwnMethodHandler(service.Infinite, method);
  const evolutionHandler = getOwnMethodHandler(service.Evolution, method);
  const saveRoundFallback = method === 'saveRound' ? getOwnMethodHandler(service.Evolution, 'saveRound') : undefined;

  const handler = infiniteHandler ?? evolutionHandler ?? saveRoundFallback;

  if (!handler) {
    throw new Error(`Infinite service method unavailable: ${method}`);
  }

  return handler;
};
