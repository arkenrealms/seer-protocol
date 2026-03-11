import { z } from 'zod';
import * as schema from './area.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '../schema';
import type { Router } from './area.router';

export type * from './area.router';
export type { RouterContext };

export type Area = z.infer<typeof schema.Area>;
export type AreaDocument = Area & Document;

export type AreaLandmark = z.infer<typeof schema.AreaLandmark>;
export type AreaLandmarkDocument = AreaLandmark & Document;

export type AreaType = z.infer<typeof schema.AreaType>;
export type AreaTypeDocument = AreaType & Document;

export type AreaNameChoice = z.infer<typeof schema.AreaNameChoice>;
export type AreaNameChoiceDocument = AreaNameChoice & Document;

export type Mappings = {
  Area: Model<AreaDocument>;
  AreaLandmark: Model<AreaLandmarkDocument>;
  AreaType: Model<AreaTypeDocument>;
  AreaNameChoice: Model<AreaNameChoiceDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
