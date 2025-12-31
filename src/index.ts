import type * as Arken from '@arken/node/types';
import * as dotenv from 'dotenv';
import * as Schema from '@arken/node/schema';
import { createRouter as createRouter2 } from './router';
import type * as Types from './types';

export * as Trek from './modules/trek';
export * as Evolution from './modules/evolution';
export * as Infinite from './modules/infinite';
export * as Oasis from './modules/oasis';

export { Application } from './types';

export type { Types };

export { createRouter } from './router';

export type Router = ReturnType<typeof createRouter2>;
export type RouterInput = Schema.inferRouterInputs<Router>;
export type RouterOutput = Schema.inferRouterOutputs<Router>;

dotenv.config();
