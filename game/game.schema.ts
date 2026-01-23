import { z, ObjectId, Entity } from '../schema';

export const GameStat = Entity.merge(
  z.object({
    gameId: ObjectId,
  })
);

export const Game = Entity.merge(
  z.object({
    productId: ObjectId,
    statId: ObjectId.optional(),
    stat: GameStat.nullable().optional(),
  })
);

export const GameRound = Entity.merge(
  z.object({
    gameId: ObjectId,
  })
);

export const Era = Entity.merge(z.object({}));
