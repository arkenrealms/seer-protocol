// profile.types.ts
//
import { z } from 'zod';
import * as schema from './profile.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { Router } from './profile.router';

export type * from './profile.router';
export type { RouterContext };

export type Profile = z.infer<typeof schema.Profile>;
export type ProfileDocument = Profile & Document & { saveQueued: () => null };

export type Mappings = {
  Profile: Model<ProfileDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
