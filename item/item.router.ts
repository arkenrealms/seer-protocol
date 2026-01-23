import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Query, getQueryInput, inferRouterOutputs, inferRouterInputs } from '../schema';
import {
  Item,
  ItemAttribute,
  ItemMaterial,
  ItemSet,
  ItemSlot,
  ItemRarity,
  ItemType,
  ItemSubType,
  ItemSpecificType,
  ItemAffix,
  ItemRecipe,
  ItemSkin,
  ItemTransmute,
} from './item.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getItem: procedure
      .use(hasRole('guest', t))
      .input(getQueryInput(Item))
      .output(Item)
      .query(({ input, ctx }) => (ctx.app.service.Item.getItem as any)(input, ctx)),

    getItems: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Item))
      // .output(z.array(Item))
      .query(({ input, ctx }) => (ctx.app.service.Item.getItems as any)(input, ctx)),

    createItem: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Item))
      .output(Item.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Item.createItem as any)(input, ctx)),

    updateItem: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Item))
      .output(Item.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Item.updateItem as any)(input, ctx)),

    getItemAttribute: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ItemAttribute))
      .output(ItemAttribute)
      .query(({ input, ctx }) => (ctx.app.service.Item.getItemAttribute as any)(input, ctx)),

    createItemAttribute: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ItemAttribute))
      .output(ItemAttribute.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Item.createItemAttribute as any)(input, ctx)),

    updateItemAttribute: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ItemAttribute))
      .output(ItemAttribute.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Item.updateItemAttribute as any)(input, ctx)),

    // Add more procedures for other entities like ItemMaterial, ItemSet, ItemSlot, ItemRarity, etc.

    getItemTransmute: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ItemTransmute))
      .output(ItemTransmute)
      .query(({ input, ctx }) => (ctx.app.service.Item.getItemTransmute as any)(input, ctx)),

    createItemTransmute: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ItemTransmute))
      .output(ItemTransmute.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Item.createItemTransmute as any)(input, ctx)),

    updateItemTransmute: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ItemTransmute))
      .output(ItemTransmute.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Item.updateItemTransmute as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
