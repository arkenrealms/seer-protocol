// arken/packages/seer/packages/protocol/src/modules/oasis/oasis.router.ts
import { z as zod } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
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
      .query(({ input, ctx }) => {
        const oasisService = ctx.app?.service?.Oasis as any;
        const descriptor =
          oasisService && Object.prototype.hasOwnProperty.call(oasisService, 'getPatrons')
            ? Object.getOwnPropertyDescriptor(oasisService, 'getPatrons')
            : undefined;
        const method = descriptor && 'value' in descriptor ? descriptor.value : undefined;

        if (typeof method !== 'function') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Oasis.getPatrons handler is unavailable for oasis.getPatrons',
          });
        }

        return method.call(oasisService, input, ctx);
      }),

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
        const sceneInput = input?.data;
        const applicationId =
          sceneInput && typeof sceneInput === 'object' ? (sceneInput as any).applicationId : undefined;

        if (applicationId === '668e4e805f9a03927caf883b') {
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
