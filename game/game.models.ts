import * as mongo from '../util/mongo';
import type * as Types from './game.types';

const { addTagVirtuals, addApplicationVirtual } = mongo;

export const Game = mongo.createModel<Types.GameDocument>(
  'Game',
  {
    productId: { type: mongo.Schema.Types.ObjectId, ref: 'Product', required: true },
    statId: { type: mongo.Schema.Types.ObjectId, ref: 'GameStat' },
  },
  {
    extend: 'EntityFields',
    indexes: [{ applicationId: 1, name: 1, unique: true }],
    virtuals: [
      ...addTagVirtuals('Application'),
      { name: 'stat' },
      { name: 'stats', ref: 'GameStat', localField: '_id', foreignField: 'gameId' },
      { name: 'rounds', ref: 'GameRound', localField: '_id', foreignField: 'gameId' },
      // {
      //   name: 'latestStat',
      //   ref: 'GameStat',
      //   localField: '_id',
      //   foreignField: 'gameId',
      //   options: { sort: { createdAt: -1 }, limit: 1 },
      // },
    ],
  }
);

export const GameStat = mongo.createModel<Types.GameStatDocument>(
  'GameStat',
  {
    gameId: { type: mongo.Schema.Types.ObjectId, ref: 'Game', required: true },
  },
  {
    extend: 'EntityFields',
    virtuals: [...addTagVirtuals('Application'), { name: 'game' }],
  }
);

export const GameRound = mongo.createModel<Types.GameRoundDocument>(
  'GameRound',
  {
    gameId: { type: mongo.Schema.Types.ObjectId, ref: 'Game', required: true },
  },
  {
    extend: 'EntityFields',
    virtuals: [...addTagVirtuals('Application'), { name: 'game' }],
  }
);

export const Era = mongo.createModel<Types.EraDocument>('Era', {});
