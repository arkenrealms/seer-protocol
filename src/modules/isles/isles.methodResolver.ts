// arken/packages/seer/packages/protocol/src/modules/isles/isles.methodResolver.ts
import { resolveModuleMethod, type MethodHandler } from '../methodResolver.ts';

export type IslesMethodName = 'saveRound' | 'interact' | 'getScene';

type IslesMethodHandler = MethodHandler;

export const resolveIslesMethod = (
  service: { Isles?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: IslesMethodName
): IslesMethodHandler => {
  return resolveModuleMethod({
    moduleName: 'Isles',
    method,
    primaryService: service.Isles,
    fallbackService: service.Evolution,
    allowSaveRoundFallback: true,
  });
};
