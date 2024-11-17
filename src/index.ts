import type { Application, ApplicationModelType, ApplicationServiceType } from '@arken/node/types';
import type * as Arken from '@arken/node/types';
import * as dotenv from 'dotenv';
import { Router as Router2 } from './router';
import type * as Types from './types';

export type { Types };

export { createRouter } from './router';

dotenv.config();

export class SeerBase implements Types.Seer {
  router: Router2;
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
  filters: Record<string, any> = { applicationId: null };

  async getRealms(
    input: Types.RouterInput['getRealms'],
    ctx: Types.ServiceContext
  ): Promise<Types.RouterOutput['getRealms']> {
    throw new Error('Not implemented');
  }

  async updateRealm(
    input: Types.RouterInput['updateRealm'],
    ctx: Types.ServiceContext
  ): Promise<Types.RouterOutput['updateRealm']> {
    throw new Error('Not implemented');
  }
}
