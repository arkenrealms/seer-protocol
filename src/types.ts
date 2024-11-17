import type * as Arken from '@arken/node/types';
import { Router, RouterInput, RouterOutput } from './router';

export type { Router, RouterInput, RouterOutput };

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

export type Seer = Arken.Application & {
  service: Arken.ApplicationServiceType;
  model: Arken.ApplicationModelType;
  realms: Arken.Core.Types.Realm[];

  server: any;
  http: any;
  https: any;
  isHttps: boolean;
  cache: any;
  db: any;
  services: any;
  applications: any;
  application: any;
  filters: Record<string, any>;

  getRealms(input: RouterInput['getRealms'], ctx: ServiceContext): Promise<RouterOutput['getRealms']>;
  updateRealm(input: RouterInput['updateRealm'], ctx: ServiceContext): Promise<RouterOutput['updateRealm']>;
};
