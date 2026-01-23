import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Raffle, RaffleRequirement, RaffleReward, RaffleEntry } from './raffle.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    // Raffle endpoints
    getRaffle: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Raffle.getRaffle as any)(input, ctx)),

    createRaffle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(Raffle)
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.createRaffle as any)(input, ctx)),

    updateRaffle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleId: z.string(), data: Raffle.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.updateRaffle as any)(input, ctx)),

    getRaffleRequirement: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleRequirementId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Raffle.getRaffleRequirement as any)(input, ctx)),

    createRaffleRequirement: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(RaffleRequirement)
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.createRaffleRequirement as any)(input, ctx)),

    updateRaffleRequirement: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleRequirementId: z.string(), data: RaffleRequirement.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.updateRaffleRequirement as any)(input, ctx)),

    getRaffleReward: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleRewardId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Raffle.getRaffleReward as any)(input, ctx)),

    createRaffleReward: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(RaffleReward)
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.createRaffleReward as any)(input, ctx)),

    updateRaffleReward: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleRewardId: z.string(), data: RaffleReward.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.updateRaffleReward as any)(input, ctx)),

    getRaffleEntry: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleEntryId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Raffle.getRaffleEntry as any)(input, ctx)),

    createRaffleEntry: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(RaffleEntry)
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.createRaffleEntry as any)(input, ctx)),

    updateRaffleEntry: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ raffleEntryId: z.string(), data: RaffleEntry.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Raffle.updateRaffleEntry as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
