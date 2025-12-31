import * as Arken from '@arken/node';
import { Router, RouterInput, RouterOutput } from './router';
import * as Evolution from './modules/evolution';
import * as Infinite from './modules/infinite';
import * as Oasis from './modules/oasis';
import * as Trek from './modules/trek';
import type * as Types from './types';

export type { Router, RouterInput, RouterOutput };

export type ApplicationServiceType = Partial<{
  Trek: Trek.Service;
  Evolution: Evolution.Service;
  Infinite: Infinite.Service;
  Oasis: Oasis.Service;
}> &
  Arken.ApplicationServiceType;

export type ApplicationModelType = Partial<Evolution.Types.Mappings & Infinite.Types.Mappings> &
  Arken.ApplicationModelType;

export class Application {
  router: Router;
  service: ApplicationServiceType = {};
  model: ApplicationModelType = {};
  realms: Arken.Core.Types.Realm[] = [];

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
  data: any;
  signers: any;
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
  app: Application;
} & Arken.RouterContext;

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
