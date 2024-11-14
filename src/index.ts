import util from '@arken/node/util';
import { initTRPC } from '@trpc/server';
import { serialize, deserialize } from '@arken/node/util/rpc';
import type { Application, ApplicationModelType, ApplicationServiceType } from '@arken/node/types';
import { z } from 'zod';
import { createRouter as createEvolutionRouter } from './modules/evolution/evolution.router';
import type * as Arken from '@arken/node/types';
import * as dotenv from 'dotenv';
import { Router as Router2 } from './router';

export { type Router, createRouter } from './router';

dotenv.config();

export default class Server implements Application {
  router: Router2;
  service: ApplicationServiceType = {};
  model: ApplicationModelType = {};

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
}
