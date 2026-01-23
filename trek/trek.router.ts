// arken/packages/seer/packages/protocol/src/modules/trek/trek.router.ts

import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { inferRouterOutputs, inferRouterInputs } from '@trpc/server';
import type { RouterContext } from '../types';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

// If you want stricter outputs later you can add .output() schemas.
// For now we keep it flexible while wiring up the service.

export const createRouter = () =>
  router({
    /**
     * Read current trek state for the active character.
     * UI calls this as: trpc.trek.getState.useQuery({ metaverseId, trekId })
     */
    getState: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          metaverseId: z.string().optional(),
          trekId: z.string().optional(), // aka defKey
        })
      )
      .query(({ input, ctx }) => {
        return (ctx.app.service.Trek as any).getState(
          {
            defKey: input?.trekId || 'trek.default',
            metaverseId: input?.metaverseId,
          },
          ctx
        );
      }),

    /**
     * Generate the next open node IF no open node exists.
     * Equivalent to "Next Stop" in UI.
     */
    nextStop: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          trekId: z.string().optional(), // aka defKey
        })
      )
      .mutation(({ input, ctx }) => {
        return (ctx.app.service.Trek as any).nextStop({ defKey: input?.trekId || 'trek.default' }, ctx);
      }),

    /**
     * Choose a choice on the open node.
     */
    choose: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          runId: z.string(),
          nodeId: z.string(),
          choiceId: z.string(),
        })
      )
      .mutation(({ input, ctx }) => {
        return (ctx.app.service.Trek as any).choose(input, ctx);
      }),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
