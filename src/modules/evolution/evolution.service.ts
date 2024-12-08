import type { RouterContext, RouterInput, RouterOutput } from './evolution.types';
import { getFilter } from '@arken/node/util/api';
import { ARXError } from '@arken/node/util/rpc';
import * as Arken from '@arken/node';

export class Service {
  async saveRound(input: RouterInput['saveRound'], ctx: RouterContext): Promise<RouterOutput['saveRound']> {
    console.log('Evolution.Service.saveRound', input);
  }

  async interact(input: RouterInput['interact'], ctx: RouterContext): Promise<RouterOutput['interact']> {
    console.log('Evolution.Service.interact', input);
  }

  async getScene(input: RouterInput['getScene'], ctx: RouterContext): Promise<RouterOutput['getScene']> {
    if (!input) throw new Error('Input should not be void');
    console.log('Evolution.Service.getScene', input);

    let data = {};

    if (input.data.applicationId === '668e4e805f9a03927caf883b') {
      data = {
        ...data,
        objects: [
          {
            id: 'adsad',
            file: 'asdasdas.fbx',
            position: {
              x: 1000,
              y: 1000,
              z: 1000,
            },
          },
        ] as Arken.Core.Types.Object,
      };
    }

    return data;
  }
}
