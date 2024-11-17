import type * as Arken from '@arken/node/types';
import { z } from 'zod';

export const createRouter = (t: any) =>
  t.router({
    saveRound: t.procedure
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

    getProfile: t.procedure.input(z.string()).query(({ input, ctx }) => {
      console.log('getProfile', input);
      if (input === '0x150F24A67d5541ee1F8aBce2b69046e25d64619c')
        return { status: 1, data: { name: 'Maiev', status: 'Paused' } as Arken.Profile.Types.Profile };
      if (input === '0xF7252D2a3b95B8069Dfc2Fadd5f4b39D3Ee71122')
        return { status: 1, data: { name: 'Riccardo', status: 'Archived' } as Arken.Profile.Types.Profile };

      return { status: 1, data: {} as Arken.Profile.Types.Profile };
    }),
  });
