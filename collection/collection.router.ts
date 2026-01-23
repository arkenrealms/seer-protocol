// module/collection.router.ts

import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { CollectibleCollection, CollectibleCardBox, CollectibleCardPack, CollectibleCard } from './collection.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getCollectibleCollection: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCollectionId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Collection.getCollectibleCollection as any)(input, ctx)),

    createCollectibleCollection: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(CollectibleCollection)
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.createCollectibleCollection as any)(input, ctx)),

    updateCollectibleCollection: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCollectionId: z.string(), data: CollectibleCollection.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.updateCollectibleCollection as any)(input, ctx)),

    getCollectibleCardBox: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCardBoxId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Collection.getCollectibleCardBox as any)(input, ctx)),

    createCollectibleCardBox: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(CollectibleCardBox)
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.createCollectibleCardBox as any)(input, ctx)),

    updateCollectibleCardBox: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCardBoxId: z.string(), data: CollectibleCardBox.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.updateCollectibleCardBox as any)(input, ctx)),

    getCollectibleCardPack: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCardPackId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Collection.getCollectibleCardPack as any)(input, ctx)),

    createCollectibleCardPack: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(CollectibleCardPack)
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.createCollectibleCardPack as any)(input, ctx)),

    updateCollectibleCardPack: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCardPackId: z.string(), data: CollectibleCardPack.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.updateCollectibleCardPack as any)(input, ctx)),

    getCollectibleCard: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCardId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Collection.getCollectibleCard as any)(input, ctx)),

    createCollectibleCard: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(CollectibleCard)
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.createCollectibleCard as any)(input, ctx)),

    updateCollectibleCard: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ collectibleCardId: z.string(), data: CollectibleCard.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Collection.updateCollectibleCard as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
