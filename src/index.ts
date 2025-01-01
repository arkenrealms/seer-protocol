import type * as Arken from '@arken/node/types';
import * as dotenv from 'dotenv';
import { Router as Router2 } from './router';
import type * as Types from './types';

export * as Evolution from './modules/evolution';
export * as Infinite from './modules/infinite';
export * as Oasis from './modules/oasis';

export { Application } from './types';

export type { Types };

export { createRouter } from './router';

dotenv.config();
