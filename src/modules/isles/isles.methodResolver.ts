// arken/packages/seer/packages/protocol/src/modules/isles/isles.methodResolver.ts
import { getOwnMethodHandler, type MethodHandler } from '../methodResolver.ts';

export type IslesMethodName = 'saveRound' | 'interact' | 'getScene';

type IslesMethodHandler = MethodHandler;

export const resolveIslesMethod = (
  service: { Isles?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: IslesMethodName
): IslesMethodHandler => {
  const islesHandler = getOwnMethodHandler(service.Isles, method);
  const evolutionHandler = getOwnMethodHandler(service.Evolution, method);
  const saveRoundFallback = method === 'saveRound' ? getOwnMethodHandler(service.Evolution, 'saveRound') : undefined;

  const handler = islesHandler ?? evolutionHandler ?? saveRoundFallback;

  if (!handler) {
    throw new Error(`Isles service method unavailable: ${method}`);
  }

  return handler;
};
