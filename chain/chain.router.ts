// module/chain.router.ts

import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Chain, ChainContract, ChainToken, ChainTransaction } from './chain.schema';
import { Query, getQueryInput, getQueryOutput, inferRouterOutputs } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getChain: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Chain))
      .output(Chain)
      .query(({ input, ctx }) => (ctx.app.service.Chain.getChain as any)(input, ctx)),

    createChain: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Chain))
      .output(Chain.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.createChain as any)(input, ctx)),

    updateChain: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Chain))
      .output(Chain.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.updateChain as any)(input, ctx)),

    getChainContract: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainContract))
      .output(ChainContract)
      .query(({ input, ctx }) => (ctx.app.service.Chain.getChainContract as any)(input, ctx)),

    createChainContract: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainContract))
      .output(ChainContract.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.createChainContract as any)(input, ctx)),

    updateChainContract: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainContract))
      .output(ChainContract.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.updateChainContract as any)(input, ctx)),

    getChainToken: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainToken))
      .output(ChainToken)
      .query(({ input, ctx }) => (ctx.app.service.Chain.getChainToken as any)(input, ctx)),

    createChainToken: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainToken))
      .output(ChainToken.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.createChainToken as any)(input, ctx)),

    updateChainToken: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainToken))
      .output(ChainToken.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.updateChainToken as any)(input, ctx)),

    getChainTransaction: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainTransaction))
      .output(ChainTransaction)
      .query(({ input, ctx }) => (ctx.app.service.Chain.getChainTransaction as any)(input, ctx)),

    createChainTransaction: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainTransaction))
      .output(ChainTransaction.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.createChainTransaction as any)(input, ctx)),

    updateChainTransaction: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ChainTransaction))
      .output(ChainTransaction.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Chain.updateChainTransaction as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
