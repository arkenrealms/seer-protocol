// arken/packages/seer/packages/protocol/infinite/infinite.router.ts
import { z as zod } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import { Query, getQueryInput, inferRouterOutputs, inferRouterInputs } from '../util/schema';
import { RouterContext } from '../types';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

const resolveInfiniteHandler = (ctx: RouterContext, methodName: 'saveRound' | 'interact' | 'getScene') => {
  const infiniteService = (ctx.app as any)?.service?.Infinite as any;
  const ownDescriptor =
    infiniteService && Object.prototype.hasOwnProperty.call(infiniteService, methodName)
      ? Object.getOwnPropertyDescriptor(infiniteService, methodName)
      : undefined;

  if (ownDescriptor && typeof ownDescriptor.value === 'function') {
    return { owner: infiniteService, method: ownDescriptor.value };
  }

  const evolutionService = (ctx.app as any)?.service?.Evolution as any;
  const fallbackDescriptor =
    evolutionService && Object.prototype.hasOwnProperty.call(evolutionService, methodName)
      ? Object.getOwnPropertyDescriptor(evolutionService, methodName)
      : undefined;

  if (fallbackDescriptor && typeof fallbackDescriptor.value === 'function') {
    return { owner: evolutionService, method: fallbackDescriptor.value };
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: `Infinite.${methodName} handler is unavailable for infinite.${methodName}`,
  });
};

export const createRouter = () =>
  router({
    saveRound: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          shardId: z.string(),
          roundId: z.number(),
          round: z.any(),
          rewardWinnerAmount: z.number(),
          lastClients: z.any(),
        })
      )
      .query(({ input, ctx }) => {
        const { owner, method } = resolveInfiniteHandler(ctx, 'saveRound');
        return method.call(owner, input, ctx);
      }),

    interact: t.procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          shardId: z.string(),
          roundId: z.number(),
          round: z.any(),
          rewardWinnerAmount: z.number(),
          lastClients: z.any(),
        })
      )
      .mutation(({ input, ctx }) => {
        const { owner, method } = resolveInfiniteHandler(ctx, 'interact');
        return method.call(owner, input, ctx);
      }),

    getScene: t.procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          data: z.any(),
          signature: z.object({ hash: z.string(), address: z.string() }),
        })
      )
      .mutation(({ input, ctx }) => {
        const { owner, method } = resolveInfiniteHandler(ctx, 'getScene');
        return method.call(owner, input, ctx);
      }),
  });

