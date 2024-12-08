import * as Arken from '@arken/node';
import { Router, RouterInput, RouterOutput } from './router';
import * as Evolution from './modules/evolution';
import * as Infinite from './modules/infinite';
import * as Oasis from './modules/oasis';

export type { Router, RouterInput, RouterOutput };

export type ApplicationServiceType = Partial<{
  Evolution: Evolution.Service;
  Infinite: Infinite.Service;
  Oasis: Oasis.Service;
}> &
  Arken.ApplicationServiceType;

export type ApplicationModelType = Partial<Evolution.Types.Mappings & Infinite.Types.Mappings> &
  Arken.ApplicationModelType;

export interface Application {
  model: ApplicationModelType;
  service: ApplicationServiceType;
}

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

export type Seer = Application & {
  service: ApplicationServiceType;
  model: ApplicationModelType;
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
};
