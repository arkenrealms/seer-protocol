import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Era, Game, GameStat } from './game.schema';
import { Query, getQueryInput, inferRouterOutputs, inferRouterInputs } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getGame: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Game))
      .output(Game)
      .query(({ input, ctx }) => (ctx.app.service.Game.getGame as any)(input, ctx)),

    getGames: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Game))
      .output(z.array(Game))
      .query(({ input, ctx }) => (ctx.app.service.Game.getGames as any)(input, ctx)),

    createGame: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Game))
      .output(Game.pick({ id: true }))
      .query(({ input, ctx }) => (ctx.app.service.Game.createGame as any)(input, ctx)),

    updateGame: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Game))
      .output(Game.pick({ id: true }))
      .query(({ input, ctx }) => (ctx.app.service.Game.updateGame as any)(input, ctx)),

    getGameStat: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(GameStat))
      .output(GameStat)
      .query(({ input, ctx }) => (ctx.app.service.Game.getGameStat as any)(input, ctx)),

    getGameStats: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(GameStat))
      .output(z.array(GameStat))
      .query(({ input, ctx }) => (ctx.app.service.Game.getGameStats as any)(input, ctx)),

    createGameStat: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(GameStat))
      .output(GameStat.pick({ id: true }))
      .query(({ input, ctx }) => (ctx.app.service.Game.createGameStat as any)(input, ctx)),

    updateGameStat: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(GameStat))
      .output(GameStat.pick({ id: true }))
      .query(({ input, ctx }) => (ctx.app.service.Game.updateGame as any)(input, ctx)),

    // Era Procedures
    getEra: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Era))
      .output(Era)
      .query(({ input, ctx }) => (ctx.app.service.Game.getEra as any)(input, ctx)),

    getEras: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Era))
      .output(z.array(Era))
      .query(({ input, ctx }) => (ctx.app.service.Game.getEras as any)(input, ctx)),

    createEra: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Era))
      .output(Era.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Game.createEra as any)(input, ctx)),

    updateEra: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Era))
      .output(Era.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Game.updateEra as any)(input, ctx)),

    deleteEra: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Era))
      .output(Era.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Game.deleteEra as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
