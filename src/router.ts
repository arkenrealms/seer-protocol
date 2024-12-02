import util from '@arken/node/util';
import { initTRPC } from '@trpc/server';
import { serialize, deserialize } from '@arken/node/util/rpc';
import { z } from 'zod';
import { customErrorFormatter, hasRole } from '@arken/node/util/rpc';
import { Query, getQueryInput, getQueryOutput, inferRouterOutputs } from '@arken/node/schema';
import * as Arken from '@arken/node/types';
import * as Schema from '@arken/node/schema';
import * as Area from '@arken/node/modules/area/area.router';
import * as Asset from '@arken/node/modules/asset/asset.router';
import * as Character from '@arken/node/modules/character/character.router';
import * as Chain from '@arken/node/modules/chain/chain.router';
import * as Chat from '@arken/node/modules/chat/chat.router';
import * as Collection from '@arken/node/modules/collection/collection.router';
import * as Core from '@arken/node/modules/core/core.router';
import * as Game from '@arken/node/modules/game/game.router';
import * as Interface from '@arken/node/modules/interface/interface.router';
import * as Item from '@arken/node/modules/item/item.router';
import * as Job from '@arken/node/modules/job/job.router';
import * as Market from '@arken/node/modules/market/market.router';
import * as Product from '@arken/node/modules/product/product.router';
import * as Profile from '@arken/node/modules/profile/profile.router';
import * as Raffle from '@arken/node/modules/raffle/raffle.router';
import * as Skill from '@arken/node/modules/skill/skill.router';
import * as Video from '@arken/node/modules/video/video.router';
import * as Isles from './modules/isles/isles.router';
import * as Evolution from './modules/evolution/evolution.router';
import * as Oasis from './modules/oasis/oasis.router';
import type * as Types from './types';

export type RouterContext = {
  app: Types.Seer;
};
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

export const createRouter = () => {
  return router({
    area: Area.createRouter(),
    asset: Asset.createRouter(),
    chain: Chain.createRouter(),
    character: Character.createRouter(),
    chat: Chat.createRouter(),
    collection: Collection.createRouter(),
    core: Core.createRouter(),
    game: Game.createRouter(),
    interface: Interface.createRouter(),
    item: Item.createRouter(),
    job: Job.createRouter(),
    market: Market.createRouter(),
    product: Product.createRouter(),
    profile: Profile.createRouter(),
    raffle: Raffle.createRouter(),
    skill: Skill.createRouter(),
    video: Video.createRouter(),

    evolution: Evolution.createRouter(t),
    isles: Isles.createRouter(t),
    oasis: Oasis.createRouter(t),

    info: procedure.query(({ input, ctx }) => {
      return { status: 1, data: { stuff: 1 } };
    }),

    // TODO: use protocol types
    // updateRealm: procedure
    //   .use(hasRole('guest', t))
    //   .use(customErrorFormatter(t))
    //   .input(
    //     getQueryInput(
    //       z.object({
    //         realmId: z.string(),
    //         status: z.string(),
    //         clientCount: z.number(),
    //         regionCode: z.string(),
    //         realmShards: z.array(z.object({ endpoint: z.string(), status: z.string(), clientCount: z.number() })),
    //       })
    //     )
    //   )
    //   .output(getQueryOutput(Arken.Core.Schemas.Realm))
    //   .mutation(({ input, ctx }) => (ctx.app.updateRealm as any)(input, ctx)),

    auth: procedure
      .input(
        z.object({
          data: z.any(),
          signature: z.object({ hash: z.string(), address: z.string() }),
        })
      )
      .mutation(({ input, ctx }) => {
        let data = {};

        if (input.data.applicationId === '668e4e805f9a03927caf883b') {
          data = {
            maxClients: 100,
            stats: {
              totalObjects: 1000,
              totalCharacters: 100,
            },
          };
        } else if (input.data.applicationId === '669095d20b1da555f6346cdb') {
          data = {
            ...data,
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
          };
        }

        return {
          status: 1,
          data,
        };
      }),

    banProfile: procedure
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

    getProfile: t.procedure.input(z.string()).query(({ input, ctx }) => {
      console.log('getProfile', input);
      if (input === '0x150F24A67d5541ee1F8aBce2b69046e25d64619c')
        return { status: 1, data: { name: 'Maiev', status: 'Paused' } as Arken.Profile.Types.Profile };
      if (input === '0xF7252D2a3b95B8069Dfc2Fadd5f4b39D3Ee71122')
        return { status: 1, data: { name: 'Riccardo', status: 'Archived' } as Arken.Profile.Types.Profile };

      return { status: 1, data: {} as Arken.Profile.Types.Profile };
    }),
  });
};

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = Schema.inferRouterInputs<Router>;
export type RouterOutput = Schema.inferRouterOutputs<Router>;
