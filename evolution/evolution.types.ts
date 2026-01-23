import { z } from 'zod';
import { Model, Document } from '../util/mongo';
import * as schema from './evolution.schema';

export type * from './evolution.router';
export type { RouterContext } from '../types';

// // Define types based on the schema
// export type Game = z.infer<typeof schema.Game>;
// export type GameDocument = Game & Document;

// export type GameStat = z.infer<typeof schema.GameStat>;
// export type GameStatDocument = GameStat & Document;

// export type Era = z.infer<typeof schema.Era>;
// export type EraDocument = Era & Document;

// Mappings for MongoDB models
export type Mappings = {};
