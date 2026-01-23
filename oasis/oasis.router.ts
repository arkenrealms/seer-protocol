import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import { Query, getQueryInput, inferRouterOutputs, inferRouterInputs } from '../util/schema';
import { RouterContext, Core, Profile } from '../types';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getPatrons: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .output(z.array(Profile.Schemas.Profile))
      .query(({ input, ctx }) => (ctx.app.service.Oasis.getPatrons as any)(input, ctx)),

    interact: t.procedure
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
        return { status: 1 };
      }),

    getScene: t.procedure
      .input(
        z.object({
          data: z.any(),
          signature: z.object({ hash: z.string(), address: z.string() }),
        })
      )
      .query(({ input, ctx }) => {
        let data = {};

        if (input.data.applicationId === '668e4e805f9a03927caf883b') {
          data = {
            ...data,
            objects: [
              {
                id: 'adsad',
                file: 'asdasdas.fbx',
                position: {
                  x: 1000,
                  y: 1000,
                  z: 1000,
                },
              },
            ] as Core.Types.Object,
          };
        }

        return data;
      }),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
