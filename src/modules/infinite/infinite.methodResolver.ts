// arken/packages/seer/packages/protocol/src/modules/infinite/infinite.methodResolver.ts
import { resolveModuleMethod, type MethodHandler } from '../methodResolver.ts';

export type InfiniteMethodName = 'saveRound' | 'interact' | 'getScene';

type InfiniteMethodHandler = MethodHandler;

export const resolveInfiniteMethod = (
  service: { Infinite?: Record<string, unknown>; Evolution?: Record<string, unknown> },
  method: InfiniteMethodName
): InfiniteMethodHandler => {
  return resolveModuleMethod({
    moduleName: 'Infinite',
    method,
    primaryService: service.Infinite,
    fallbackService: service.Evolution,
    allowSaveRoundFallback: true,
  });
};
