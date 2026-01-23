// module/market.router.ts

import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Market, MarketPair, MarketExchange } from './market.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getMarket: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ marketId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Market.getMarket as any)(input, ctx)),

    createMarket: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(Market)
      .mutation(({ input, ctx }) => (ctx.app.service.Market.createMarket as any)(input, ctx)),

    updateMarket: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ marketId: z.string(), data: Market.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Market.updateMarket as any)(input, ctx)),

    getMarketPair: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ marketPairId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Market.getMarketPair as any)(input, ctx)),

    createMarketPair: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(MarketPair)
      .mutation(({ input, ctx }) => (ctx.app.service.Market.createMarketPair as any)(input, ctx)),

    updateMarketPair: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ marketPairId: z.string(), data: MarketPair.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Market.updateMarketPair as any)(input, ctx)),

    getMarketExchange: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ exchangeId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Market.getMarketExchange as any)(input, ctx)),

    createMarketExchange: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(MarketExchange)
      .mutation(({ input, ctx }) => (ctx.app.service.Market.createMarketExchange as any)(input, ctx)),

    updateMarketExchange: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ exchangeId: z.string(), data: MarketExchange.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Market.updateMarketExchange as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
