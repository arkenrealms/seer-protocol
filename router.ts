import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import * as Schema from './util/schema';
import * as Area from './area/area.router';
import * as Asset from './asset/asset.router';
import * as Character from './character/character.router';
import * as Chain from './chain/chain.router';
import * as Chat from './chat/chat.router';
import * as Collection from './collection/collection.router';
import * as Core from './core/core.router';
import * as Game from './game/game.router';
import * as Interface from './interface/interface.router';
import * as Item from './item/item.router';
import * as Job from './job/job.router';
import * as Market from './market/market.router';
import * as Product from './product/product.router';
import * as Profile from './profile/profile.router';
import * as Raffle from './raffle/raffle.router';
import * as Skill from './skill/skill.router';
import * as Video from './video/video.router';
import * as Trek from './trek/trek.router';
import * as Isles from './isles/isles.router';
import * as Evolution from './evolution/evolution.router';
import * as Infinite from './infinite/infinite.router';
import * as Oasis from './oasis/oasis.router';
import type * as Types from './types';

export type RouterContext = {
  app: Types.ApplicationType;
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

    trek: Trek.createRouter(),
    evolution: Evolution.createRouter(),
    infinite: Infinite.createRouter(),
    oasis: Oasis.createRouter(),
    isles: Isles.createRouter(),

    info: procedure.query(({ input, ctx }) => {
      return { stuff: 1 };
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
        let data: any = {
          roundId: 1,
        };

        if (input.data.applicationId === '668e4e805f9a03927caf883b') {
          data = {
            ...data,
          };
        } else if (input.data.applicationId === '669095d20b1da555f6346cdb') {
          data = {
            ...data,
            roundId: 1,
          };
        }

        return data;
      }),

    banProfile: procedure
      .input(
        z.object({
          target: z.string(),
          banReason: z.string(),
          banExpireDate: z.string(),
        })
      )
      .mutation(({ input, ctx }) => {}),
  });
};

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = Schema.inferRouterInputs<Router>;
export type RouterOutput = Schema.inferRouterOutputs<Router>;
