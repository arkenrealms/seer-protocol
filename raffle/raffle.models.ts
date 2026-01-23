import * as mongo from '../util/mongo';
import type * as Types from './raffle.types';

export const Raffle = mongo.createModel<Types.RaffleDocument>(
  'Raffle',
  {
    content: { type: String, required: true },
    rewards: [{ type: mongo.Schema.Types.ObjectId, ref: 'RaffleReward' }],
  },
  {
    virtuals: [
      {
        name: 'raffleRequirements',
        ref: 'RaffleRequirement',
        localField: '_id',
        foreignField: 'raffleId',
      },
      {
        name: 'raffleEntries',
        ref: 'RaffleEntry',
        localField: '_id',
        foreignField: 'raffleId',
      },
    ],
  }
);

export const RaffleRequirement = mongo.createModel<Types.RaffleRequirementDocument>('RaffleRequirement', {
  amount: { type: Number, required: true },
  raffleRewardId: { type: mongo.Schema.Types.ObjectId, ref: 'RaffleReward' },
});

export const RaffleReward = mongo.createModel<Types.RaffleRewardDocument>('RaffleReward', {
  raffleId: { type: mongo.Schema.Types.ObjectId, ref: 'Raffle' },
  winnerId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' },
  requirements: [{ type: mongo.Schema.Types.ObjectId, ref: 'RaffleRequirement' }],
  entries: [{ type: mongo.Schema.Types.ObjectId, ref: 'RaffleEntry' }],
});

export const RaffleEntry = mongo.createModel<Types.RaffleEntryDocument>('RaffleEntry', {
  amount: { type: Number, required: true },
  raffleRewardId: { type: mongo.Schema.Types.ObjectId, ref: 'RaffleReward' },
  raffleId: { type: mongo.Schema.Types.ObjectId, ref: 'Raffle' },
});
