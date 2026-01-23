import { z } from 'zod';
import * as schema from './raffle.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { Router } from './raffle.router';

export type * from './raffle.router';
export type { RouterContext };

export type Raffle = z.infer<typeof schema.Raffle>;
export type RaffleRequirement = z.infer<typeof schema.RaffleRequirement>;
export type RaffleReward = z.infer<typeof schema.RaffleReward>;
export type RaffleEntry = z.infer<typeof schema.RaffleEntry>;

export type RaffleDocument = Raffle & Document;
export type RaffleRequirementDocument = RaffleRequirement & Document;
export type RaffleRewardDocument = RaffleReward & Document;
export type RaffleEntryDocument = RaffleEntry & Document;

export type Mappings = {
  Raffle: Model<RaffleDocument>;
  RaffleRequirement: Model<RaffleRequirementDocument>;
  RaffleReward: Model<RaffleRewardDocument>;
  RaffleEntry: Model<RaffleEntryDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
