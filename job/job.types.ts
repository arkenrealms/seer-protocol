// module/job.types.ts

import { z } from 'zod';
import * as schema from './job.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { Router } from './job.router';

export type * from './job.router';
export type { RouterContext };

export type Job = z.infer<typeof schema.Job>;

export type JobDocument = Job & Document;

export type Mappings = {
  Job: Model<JobDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
