import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Area, AreaLandmark, AreaType } from './area.schema';
import { Query, getQueryInput, inferRouterOutputs, inferRouterInputs } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getArea: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Area))
      .query(({ input, ctx }) => (ctx.app.service.Area.getArea as any)(input, ctx)),

    getAreas: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Area))
      .query(({ input, ctx }) => (ctx.app.service.Area.getAreas as any)(input, ctx)),

    saveArea: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Area))
      .output(Area.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Area.saveArea as any)(input, ctx)),

    getAreaLandmark: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Area.getAreaLandmark as any)(input, ctx)),

    createAreaLandmark: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: AreaLandmark.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Area.createAreaLandmark as any)(input, ctx)),

    updateAreaLandmark: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: AreaLandmark.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Area.updateAreaLandmark as any)(input, ctx)),

    getAreaType: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Area.getAreaType as any)(input, ctx)),

    createAreaType: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: AreaType.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Area.createAreaType as any)(input, ctx)),

    updateAreaType: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: AreaType.partial() }))
      .output(AreaType.partial())
      .mutation(({ input, ctx }) => (ctx.app.service.Area.updateAreaType as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
