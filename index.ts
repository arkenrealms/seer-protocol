import type * as Arken from './types';
import * as dotenv from 'dotenv';
import * as Schema from './util/schema';
import { createRouter as createRouter2 } from './router';
import type * as Types from './types';

// Imports
import * as Area from './area';
import * as Asset from './asset';
import * as Chain from './chain';
import * as Character from './character';
import * as Chat from './chat';
import * as Collection from './collection';
import * as Core from './core';
import * as Game from './game';
import * as Interface from './interface';
import * as Item from './item';
import * as Job from './job';
import * as Market from './market';
import * as Product from './product';
import * as Profile from './profile';
import * as Raffle from './raffle';
import * as Skill from './skill';
import * as Video from './video';

// Exports
export * as Area from './area';
export * as Asset from './asset';
export * as Chain from './chain';
export * as Character from './character';
export * as Chat from './chat';
export * as Collection from './collection';
export * as Core from './core';
export * as Game from './game';
export * as Interface from './interface';
export * as Item from './item';
export * as Job from './job';
export * as Market from './market';
export * as Product from './product';
export * as Profile from './profile';
export * as Raffle from './raffle';
export * as Skill from './skill';
export * as Video from './video';
export * as Trek from './trek';
export * as Evolution from './evolution';
export * as Infinite from './infinite';
export * as Oasis from './oasis';

export { Application } from './types';

export type { Types };

export { createRouter } from './router';

export type Router = ReturnType<typeof createRouter2>;
export type RouterInput = Schema.inferRouterInputs<Router>;
export type RouterOutput = Schema.inferRouterOutputs<Router>;

dotenv.config();
