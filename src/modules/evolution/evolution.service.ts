import type { RouterContext, RouterInput, RouterOutput } from './evolution.types';
import { getFilter } from '@arken/node/util/api';
import { ARXError } from '@arken/node/util/rpc';
import * as Arken from '@arken/node';
import { generateShortId } from '@arken/node/util/db';

export class Service {
  async info(input: RouterInput['info'], ctx: RouterContext): Promise<RouterOutput['info']> {
    console.log('Evolution.Service.info', input);

    const evolutionData = await ctx.app.model.Data.find({ key: 'evolution' });

    let data: any = {
      roundId: generateShortId(),
      maxClients: 100,
      rewardItemAmount: 0,
      rewardWinnerAmount: 0,
      rewardItemAmountPerLegitPlayer: 0,
      rewardItemAmountMax: 0,
      rewardWinnerAmountPerLegitPlayer: 0,
      rewardWinnerAmountMax: 0,
      drops: {
        guardian: 0,
        earlyAccess: 0,
        trinket: 0,
        santa: 0,
      },
      totalLegitPlayers: 0,
      isBattleRoyale: false,
      isGodParty: false,
      level2open: false,
      isRoundPaused: false,
      gameMode: 'Deathmatch',
      maxEvolves: 0,
      pointsPerEvolve: 0,
      pointsPerKill: 0,
      decayPower: 0,
      dynamicDecayPower: true,
      baseSpeed: 0,
      avatarSpeedMultiplier: {},
      avatarDecayPower: {},
      preventBadKills: false,
      antifeed1: false,
      antifeed2: false,
      antifeed3: false,
      noDecay: false,
      noBoot: false,
      rewardSpawnLoopSeconds: 0,
      orbOnDeathPercent: 0,
      orbTimeoutSeconds: 0,
      orbCutoffSeconds: 0,
      orbLookup: {},
      roundLoopSeconds: 0,
      fastLoopSeconds: 0,
      leadercap: false,
      hideMap: false,
      checkPositionDistance: 0,
      checkInterval: 0,
      resetInterval: 0,
      loggableEvents: [],
      mapBoundary: {
        x: { min: 0, max: 0 },
        y: { min: 0, max: 0 },
      },
      spawnBoundary1: {
        x: { min: 0, max: 0 },
        y: { min: 0, max: 0 },
      },
      spawnBoundary2: {
        x: { min: 0, max: 0 },
        y: { min: 0, max: 0 },
      },
      rewards: {
        tokens: [
          {
            type: 'rune',
            symbol: 'pepe',
            quantity: 10000,
          },
          {
            type: 'rune',
            symbol: 'doge',
            quantity: 10000,
          },
          {
            type: 'rune',
            symbol: 'harold',
            quantity: 10000,
          },
        ],
        items: [],
        characters: [
          {
            type: 'character',
            tokenId: '1',
          },
        ],
      },
      ...(evolutionData || {}),
    };

    return data;
  }

  async saveRound(input: RouterInput['saveRound'], ctx: RouterContext): Promise<RouterOutput['saveRound']> {
    console.log('Evolution.Service.saveRound', input);

    const evolutionData: any = await ctx.app.model.Data.findOne({ key: 'evolution', mod: 'evolution' });

    evolutionData.roundId = generateShortId();

    await evolutionData.save();

    // iterate clients, save rewards

    return {
      roundId: evolutionData.roundId,
    };
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
            id: 'axl',
            file: 'axl.fbx',
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
