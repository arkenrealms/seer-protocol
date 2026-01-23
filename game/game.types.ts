import { z } from 'zod';
import { Model, Document } from '../util/mongo';
import * as schema from './game.schema';

export type * from './game.router';
export type { RouterContext } from '../types';

// Define types based on the schema
export type Game = z.infer<typeof schema.Game>;
export type GameDocument = Game & Document;

export type GameStat = z.infer<typeof schema.GameStat>;
export type GameStatDocument = GameStat & Document;

export type GameRound = z.infer<typeof schema.GameRound>;
export type GameRoundDocument = GameRound & Document;

export type Era = z.infer<typeof schema.Era>;
export type EraDocument = Era & Document;

// Mappings for MongoDB models
export type Mappings = {
  Game: Model<GameDocument>;
  GameStat: Model<GameStatDocument>;
  GameRound: Model<GameRoundDocument>;
  Era: Model<EraDocument>;
};
