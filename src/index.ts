import util from '@arken/node/util';
import { initTRPC } from '@trpc/server';
import { serialize, deserialize } from '@arken/node/util/rpc';
import type { Application, ApplicationModelType, ApplicationServiceType } from '@arken/node/types';
import { z } from 'zod';
import { createRouter as createEvolutionRouter } from './modules/evolution/evolution.router';
import type * as Arken from '@arken/node/types';

export const t = initTRPC.context<{}>().create();
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const createRouter = () =>
  router({
    banUser: procedure
      .input(
        z.object({
          target: z.string(),
          banReason: z.string(),
          banExpireDate: z.string(),
        })
      )
      .mutation(({ input, ctx }) => {
        return { status: 1 };
      }),

    info: procedure.query(({ input, ctx }) => {
      return { status: 1, data: { stuff: 1 } };
    }),

    auth: procedure
      .input(
        z.object({
          data: z.any(),
          signature: z.object({ hash: z.string(), address: z.string() }),
        })
      )
      .mutation(({ input, ctx }) => {
        return {
          status: 1,
          data: {
            maxClients: 100,
            roundId: 1,
            rewardItemAmount: 0,
            rewardWinnerAmount: 0,
            rewardItemAmountPerLegitPlayer: 0,
            rewardItemAmountMax: 0,
            rewardWinnerAmountPerLegitPlayer: 0,
            rewardWinnerAmountMax: 0,
            drops: {
              guardian: 0,
              earlyAccess: 0,
              trinket: 0,
              santa: 0,
            },
            totalLegitPlayers: 0,
            isBattleRoyale: false,
            isGodParty: false,
            level2open: false,
            isRoundPaused: false,
            gameMode: 'Deathmatch',
            maxEvolves: 0,
            pointsPerEvolve: 0,
            pointsPerKill: 0,
            decayPower: 0,
            dynamicDecayPower: true,
            baseSpeed: 0,
            avatarSpeedMultiplier: {},
            avatarDecayPower: {},
            preventBadKills: false,
            antifeed1: false,
            antifeed2: false,
            antifeed3: false,
            noDecay: false,
            noBoot: false,
            rewardSpawnLoopSeconds: 0,
            orbOnDeathPercent: 0,
            orbTimeoutSeconds: 0,
            orbCutoffSeconds: 0,
            orbLookup: {},
            roundLoopSeconds: 0,
            fastLoopSeconds: 0,
            leadercap: false,
            hideMap: false,
            checkPositionDistance: 0,
            checkInterval: 0,
            resetInterval: 0,
            loggableEvents: [],
            mapBoundary: {
              x: { min: 0, max: 0 },
              y: { min: 0, max: 0 },
            },
            spawnBoundary1: {
              x: { min: 0, max: 0 },
              y: { min: 0, max: 0 },
            },
            spawnBoundary2: {
              x: { min: 0, max: 0 },
              y: { min: 0, max: 0 },
            },
            rewards: {
              runes: [
                {
                  type: 'rune',
                  symbol: 'solo',
                  quantity: 10000,
                },
              ],
              items: [],
              characters: [
                {
                  type: 'character',
                  tokenId: '1',
                },
              ],
            },
          },
        };
      }),
    // evolution: createEvolutionRouter(t),
    evolution: t.router({
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
        return { status: 1, data: {} as Arken.Profile.Types.Profile };
      }),
    }),
  });

export type Router = ReturnType<typeof createRouter>;

dotenv.config();

export default class Server implements Application {
  router: Router;
  service: ApplicationServiceType = {};
  model: ApplicationModelType = {};

  server: any;
  http: any;
  https: any;
  isHttps: boolean;
  cache: any;
  db: any;
  services: any;
  applications: any;
  application: any;
  filters: Record<string, any> = { applicationId: null };
}
