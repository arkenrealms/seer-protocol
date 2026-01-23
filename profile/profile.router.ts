import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Profile } from './profile.schema';
import { Query, getQueryInput, getQueryOutput, inferRouterOutputs } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    setProfileMode: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(z.string())
      .mutation(({ input, ctx }) => (ctx.app.service.Profile.setProfileMode as any)(input, ctx)),

    // Profile endpoints
    me: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      // .output(Profile.partial())
      .query(({ input, ctx }) => (ctx.app.service.Profile.me as any)(input, ctx)),

    // Profile endpoints
    getProfile: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Profile))
      // .output(Profile.partial())
      .query(({ input, ctx }) => (ctx.app.service.Profile.getProfile as any)(input, ctx)),

    getProfiles: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Profile))
      .output(z.array(Profile))
      .query(({ input, ctx }) => (ctx.app.service.Profile.getProfiles as any)(input, ctx)),

    createProfile: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Profile))
      .output(Profile.partial())
      .mutation(({ input, ctx }) => (ctx.app.service.Profile.createProfile as any)(input, ctx)),

    updateProfile: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Profile))
      .output(Profile.partial())
      .mutation(({ input, ctx }) => (ctx.app.service.Profile.updateProfile as any)(input, ctx)),

    getProfileStats: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Profile.getProfileStats as any)(input, ctx)),

    updateProfileSettings: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, settings: Profile.shape.settings }))
      .mutation(({ input, ctx }) => (ctx.app.service.Profile.updateProfileSettings as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
