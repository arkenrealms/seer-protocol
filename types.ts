// arken/packages/seer/protocol/types.ts
//
// import * as Arken from '@arken/node';
// import { Router, RouterInput, RouterOutput } from './router';

import { Model } from './util/mongo';

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
import * as Evolution from './evolution';
import * as Infinite from './infinite';
import * as Oasis from './oasis';
import * as Trek from './trek';

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
export * as Evolution from './evolution';
export * as Infinite from './infinite';
export * as Oasis from './oasis';
export * as Trek from './trek';

export class Application<ServiceType> {
  router: Router;
  service: ServiceType;
  model: ApplicationModelType = {};
  realms: Core.Types.Realm[] = [];

  server: any;
  http: any;
  https: any;
  isHttps: boolean;
  cache: any;
  db: any;
  services: any;
  applications: any;
  application: any;
  contracts: any;
  contractInfo: any;
  contractMetadata: any;
  ethersProvider: any;
  data: any;
  signers: any;
  web3: any;
  filters: Record<string, any> = { applicationId: null };

  // async getRealms(
  //   input: Types.RouterInput['getRealms'],
  //   ctx: Types.ServiceContext
  // ): Promise<Types.RouterOutput['getRealms']> {
  //   throw new Error('Not implemented');
  // }

  // async updateRealm(
  //   input: Types.RouterInput['updateRealm'],
  //   ctx: Types.ServiceContext
  // ): Promise<Types.RouterOutput['updateRealm']> {
  //   throw new Error('Not implemented');
  // }
}

export type ApplicationType = typeof Application;
// export type Seer =
// export type Seer = {
//   service: ApplicationServiceType;
//   model: ApplicationModelType;
//   realms: Arken.Core.Types.Realm[];

//   server: any;
//   http: any;
//   https: any;
//   isHttps: boolean;
//   cache: any;
//   db: any;
//   services: any;
//   applications: any;
//   application: any;
//   filters: Record<string, any>;
//   contracts: any;
//   contractInfo: any;
//   contractMetadata: any;
//   signers: any;
// };

export type RouterContext = {
  app: Application<any>;
  client?: RouterClient;
  profile?: Profile.Types.Profile;
};

export interface Client {
  id: string;
  name: string;
  ip: string;
  socket: any;
  endpoint: string;
  ioCallbacks: any;
  info: any;
  lastReportedTime: number;
  isMod: boolean;
  isAdmin: boolean;
  isSeer: boolean;
  log: {
    clientDisconnected: number;
  };
}

export interface ServiceContext {
  client: Client;
}

import { createRouter } from './router';

export type * as Schema from './schema';

export type Router = ReturnType<typeof createRouter>;

export type ApplicationModelType = Partial<
  Area.Types.Mappings &
    Asset.Types.Mappings &
    Chain.Types.Mappings &
    Character.Types.Mappings &
    Chat.Types.Mappings &
    Collection.Types.Mappings &
    Core.Types.Mappings &
    Game.Types.Mappings &
    Interface.Types.Mappings &
    Item.Types.Mappings &
    Job.Types.Mappings &
    Market.Types.Mappings &
    Product.Types.Mappings &
    Profile.Types.Mappings &
    Raffle.Types.Mappings &
    Skill.Types.Mappings &
    Video.Types.Mappings &
    Evolution.Types.Mappings &
    Infinite.Types.Mappings
>;

export type RouterClient = {
  socket: any;
  roles: string[];
  permissions: any;
  profile?: Profile.Types.ProfileDocument;
  emit: any;
};

export interface Signature {
  hash?: string;
  address?: string;
}

export type Position = {
  x: number;
  y: number;
  z?: number;
};

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type PatchOp =
  | { op: 'set'; key: string; value: any }
  | { op: 'unset'; key: string }
  | { op: 'inc'; key: string; value: number }
  | { op: 'push'; key: string; value: any }
  | { op: 'merge'; key: string; value: Record<string, any> };

export type EntityPatch = {
  entityType: string; // allow any string
  entityId: string;
  baseVersion?: number;
  ops: PatchOp[];
  claimable?: boolean;
};

export type GameObjectDef = {
  id: string;
  type: string; // allow any string
  name: string;
  position: { x: number; y: number };
  radius?: number; // interaction distance
  tags?: string[];
  meta?: Record<string, any>;
};

export type Requirement =
  | { kind: 'exists'; key: string }
  | { kind: 'touchedObject'; objectId: string; afterKey?: string; writeKey: string };

// Generic effects (can be positive or negative)
export type Effect =
  | { kind: 'item.grant'; itemKey: string; quantity?: number }
  | { kind: 'currency.grant'; key: string; amount: number } // negative amount allowed
  | { kind: 'reputation.delta'; npcId: string; amount: number } // negative allowed
  | { kind: 'state.patch'; patch: EntityPatch } // generic patch against any entityType
  | { kind: 'ui.unlock'; uiKey: string } // optional, future
  | { kind: 'emit'; eventType: string; payload?: any }; // optional, future

export type QuestDef = {
  id: string;
  metaverseId: string;
  name: string;

  // Requirements can be checked shard-side (for anti-cheat) AND client-side (for UI state)
  requirements: Requirement[];

  // Effects are applied on completion/claim (seer-side)
  effects: Effect[];

  // keys shard will write (auditing + permissions)
  writes?: string[];
};

type QuestCompleteOp = {
  kind: 'quest.complete';
  id: string;
  ts: number;
  questId: string;
  metaverseId: string;
  evidence?: Record<string, any>;
  effects?: any[]; // can include effect refs for replay/debug
};
