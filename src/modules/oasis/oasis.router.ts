import type * as Arken from '@arken/node/types';
import { z } from 'zod';

export const createRouter = (t: any) =>
  t.router({
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
            ] as Arken.Core.Types.Object,
          };
        }

        return data;
      }),
  });
