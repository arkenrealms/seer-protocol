import type { RouterContext, RouterInput, RouterOutput } from './oasis.types';
import { getFilter } from '@arken/node/util/api';
import { ARXError } from '@arken/node/util/rpc';
import * as Arken from '@arken/node';

export class Service {
  async getPatrons(input: RouterInput['getPatrons'], ctx: RouterContext): Promise<RouterOutput['getPatrons']> {
    console.log('Oasis.Service.getPatrons', input);

    const cubes = await ctx.app.model.Item.aggregate([
      { $match: { name: "Founder's Cube" } },
      { $sort: { quantity: -1 } },
      { $limit: 15 },
      {
        $lookup: {
          from: 'Character',
          localField: 'characterId',
          foreignField: '_id',
          as: 'character',
        },
      },
      { $unwind: '$character' },
      {
        $lookup: {
          from: 'Profile',
          localField: 'character.profileId',
          foreignField: '_id',
          as: 'character.profile',
        },
      },
      { $unwind: '$character.profile' },
    ]);

    const profiles = cubes.map((ticket: any) => ticket.character?.profile);

    return profiles as Arken.Profile.Types.Profile[];
  }
}
