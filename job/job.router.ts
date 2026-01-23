// job.router.ts

import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Job } from './job.schema';
import { Query } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getJob: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Job.getJob as any)(input, ctx)),

    createJob: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: Job }))
      .mutation(({ input, ctx }) => (ctx.app.service.Job.createJob as any)(input, ctx)),

    updateJob: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: Job.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Job.updateJob as any)(input, ctx)),

    updateMetrics: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.any())
      .mutation(({ input, ctx }) => (ctx.app.service.Job.updateMetrics as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
