import type { RouterContext, RouterInput, RouterOutput } from './evolution.types';
import { getFilter } from '@arken/node/util/api';
import { ARXError } from '@arken/node/util/rpc';
import * as Arken from '@arken/node';
import { generateShortId } from '@arken/node/util/db';

export class Service {
  async info(input: RouterInput['info'], ctx: RouterContext): Promise<RouterOutput['info']> {
    console.log('Evolution.Service.info', input);

    if (!ctx.client?.roles?.includes('admin')) throw new Error('Not authorized');

    const evolutionData = await ctx.app.model.Data.findOne({ key: 'evolution', mod: 'evolution' });

    evolutionData.data = {
      roundId: generateShortId(),
      maxClients: 100,
      rewardItemAmount: 0,
      rewardWinnerAmount: 300,
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
            type: 'token',
            symbol: 'pepe',
            quantity: 10000000,
            value: 0.00002,
          },
          {
            type: 'token',
            symbol: 'doge',
            quantity: 1000,
            value: 0.3,
          },
          {
            type: 'token',
            symbol: 'harold',
            quantity: 100000,
            value: 0.013,
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
      ...evolutionData.data,
    };

    // for (const key in data) {
    //   if (!evolutionData.data[key]) {
    //     evolutionData.data[key] = data[key];
    //   }
    // }

    evolutionData.markModified('data');

    await evolutionData.save();

    return evolutionData.data;
  }

  // {
  //   "shardId": "676cca983a7ff7b07727361a",
  //   "round": {
  //     "id": "676ccad6040be4e1feb4fb07",
  //     "startedAt": 1735183062,
  //     "endedAt": 1735183092,
  //     "clients": [
  //       {
  //         "id": "sa00CgPFKF606oOSAAAD",
  //         "name": "returnportal",
  //         "joinedRoundAt": 1735183062215,
  //         "points": 0,
  //         "kills": 0,
  //         "killStreak": 0,
  //         "deaths": 0,
  //         "evolves": 1,
  //         "rewards": 0,
  //         "orbs": 0,
  //         "powerups": 10,
  //         "baseSpeed": 0.8,
  //         "decayPower": 1,
  //         "pickups": [],
  //         "xp": 22.560000000000606,
  //         "maxHp": 100,
  //         "avatar": 0,
  //         "speed": 3.2,
  //         "cameraSize": 2.5,
  //         "log": {
  //           "kills": [],
  //           "deaths": [],
  //           "revenge": 0,
  //           "resetPosition": 0,
  //           "phases": 0,
  //           "stuck": 0,
  //           "collided": 0,
  //           "timeoutDisconnect": 0,
  //           "speedProblem": 0,
  //           "clientDistanceProblem": 0,
  //           "outOfBounds": 0,
  //           "ranOutOfHealth": 0,
  //           "notReallyTrying": 0,
  //           "tooManyKills": 0,
  //           "killingThemselves": 0,
  //           "sameNetworkDisconnect": 0,
  //           "connectedTooSoon": 0,
  //           "clientDisconnected": 0,
  //           "positionJump": 0,
  //           "pauses": 0,
  //           "connects": 0,
  //           "path": "",
  //           "positions": 368,
  //           "spectating": 0,
  //           "recentJoinProblem": 0,
  //           "usernameProblem": 0,
  //           "maintenanceJoin": 0,
  //           "signatureProblem": 0,
  //           "signinProblem": 0,
  //           "versionProblem": 0,
  //           "failedRealmCheck": 0,
  //           "addressProblem": 0,
  //           "replay": []
  //         }
  //       }
  //     ],
  //     "events": [],
  //     "states": []
  //   },
  //   "rewardWinnerAmount": 100,
  //   "lastClients": [
  //     {
  //       "id": "7qYr9V8pTyZtbUlRAAAB",
  //       "name": "Unknown812",
  //       "joinedRoundAt": 1735183032188,
  //       "points": 0,
  //       "kills": 0,
  //       "killStreak": 0,
  //       "deaths": 0,
  //       "evolves": 0,
  //       "rewards": 0,
  //       "orbs": 0,
  //       "powerups": 0,
  //       "baseSpeed": 0.8,
  //       "decayPower": 1,
  //       "pickups": [],
  //       "xp": 50,
  //       "maxHp": 100,
  //       "avatar": 0,
  //       "speed": 2.4,
  //       "cameraSize": 3,
  //       "log": {
  //         "kills": [],
  //         "deaths": [],
  //         "revenge": 0,
  //         "resetPosition": 0,
  //         "phases": 0,
  //         "stuck": 0,
  //         "collided": 0,
  //         "timeoutDisconnect": 0,
  //         "speedProblem": 0,
  //         "clientDistanceProblem": 0,
  //         "outOfBounds": 0,
  //         "ranOutOfHealth": 0,
  //         "notReallyTrying": 0,
  //         "tooManyKills": 0,
  //         "killingThemselves": 0,
  //         "sameNetworkDisconnect": 0,
  //         "connectedTooSoon": 0,
  //         "clientDisconnected": 0,
  //         "positionJump": 0,
  //         "pauses": 0,
  //         "connects": 0,
  //         "path": "",
  //         "positions": 0,
  //         "spectating": 0,
  //         "recentJoinProblem": 0,
  //         "usernameProblem": 0,
  //         "maintenanceJoin": 0,
  //         "signatureProblem": 0,
  //         "signinProblem": 0,
  //         "versionProblem": 0,
  //         "failedRealmCheck": 0,
  //         "addressProblem": 0,
  //         "replay": []
  //       },
  //       "shardId": "676cca983a7ff7b07727361a"
  //     },
  //     {
  //       "id": "sa00CgPFKF606oOSAAAD",
  //       "name": "returnportal",
  //       "joinedRoundAt": 1735183032189,
  //       "points": 68,
  //       "kills": 0,
  //       "killStreak": 0,
  //       "deaths": 0,
  //       "evolves": 7,
  //       "rewards": 1,
  //       "orbs": 0,
  //       "powerups": 56,
  //       "baseSpeed": 0.8,
  //       "decayPower": 1,
  //       "pickups": [
  //         {
  //           "type": "token",
  //           "symbol": "pepe",
  //           "quantity": 1,
  //           "rewardItemType": 0,
  //           "id": "676ccaa32b9c5454607eaa05",
  //           "enabledDate": 1735183011161,
  //           "rewardItemName": "pepe",
  //           "position": {
  //             "x": -9.420004,
  //             "y": -6.517404
  //           },
  //           "winner": "returnportal"
  //         }
  //       ],
  //       "xp": 93.60000000000002,
  //       "maxHp": 100,
  //       "avatar": 1,
  //       "speed": 2.4,
  //       "cameraSize": 3,
  //       "log": {
  //         "kills": [],
  //         "deaths": [],
  //         "revenge": 0,
  //         "resetPosition": 0,
  //         "phases": 0,
  //         "stuck": 0,
  //         "collided": 0,
  //         "timeoutDisconnect": 0,
  //         "speedProblem": 0,
  //         "clientDistanceProblem": 0,
  //         "outOfBounds": 0,
  //         "ranOutOfHealth": 0,
  //         "notReallyTrying": 0,
  //         "tooManyKills": 0,
  //         "killingThemselves": 0,
  //         "sameNetworkDisconnect": 0,
  //         "connectedTooSoon": 0,
  //         "clientDisconnected": 0,
  //         "positionJump": 0,
  //         "pauses": 0,
  //         "connects": 0,
  //         "path": "",
  //         "positions": 368,
  //         "spectating": 0,
  //         "recentJoinProblem": 0,
  //         "usernameProblem": 0,
  //         "maintenanceJoin": 0,
  //         "signatureProblem": 0,
  //         "signinProblem": 0,
  //         "versionProblem": 0,
  //         "failedRealmCheck": 0,
  //         "addressProblem": 0,
  //         "replay": []
  //       },
  //       "shardId": "676cca983a7ff7b07727361a"
  //     }
  //   ]
  // }
  async saveRound(input: RouterInput['saveRound'], ctx: RouterContext): Promise<RouterOutput['saveRound']> {
    if (!input) throw new Error('Input should not be void');

    console.log('Evolution.Service.saveRound', input);

    if (!ctx.client?.roles?.includes('admin')) throw new Error('Not authorized');

    const evolutionData: any = await ctx.app.model.Data.findOne({ key: 'evolution', mod: 'evolution' });

    if (input.round.id !== evolutionData.data.roundId) throw new Error('Invalid Round ID');

    evolutionData.data = {
      ...evolutionData.data,
      roundId: generateShortId(),
    };

    if (!evolutionData.data.rewards.tokens)
      evolutionData.data.rewards.tokens = [
        {
          type: 'token',
          symbol: 'pepe',
          quantity: 10000000,
        },
        {
          type: 'token',
          symbol: 'doge',
          quantity: 1000,
        },
        {
          type: 'token',
          symbol: 'harold',
          quantity: 100000,
        },
      ];

    evolutionData.markModified('data');

    await evolutionData.save();

    const res = {
      roundId: evolutionData.data.roundId,
    };

    if (input.clients.length === 0) {
      console.log('Round skipped');

      return res;
    }

    const rewardWinnerMap = {
      0: Math.round(evolutionData.data.rewardWinnerAmount * 1 * 1000) / 1000,
      1: Math.round(evolutionData.data.rewardWinnerAmount * 0.25 * 1000) / 1000,
      2: Math.round(evolutionData.data.rewardWinnerAmount * 0.15 * 1000) / 1000,
      3: Math.round(evolutionData.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      4: Math.round(evolutionData.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      5: Math.round(evolutionData.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      6: Math.round(evolutionData.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      7: Math.round(evolutionData.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      8: Math.round(evolutionData.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      9: Math.round(evolutionData.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
    };

    const winners = input.clients
      // .filter((p) => p.lastUpdate >= fiveSecondsAgo)
      .sort((a, b) => b.points - a.points);

    // iterate clients, save rewards
    for (const client of winners) {
      const index = winners.findIndex((winner) => winner.address === client.address);
      const profile = await ctx.app.model.Profile.findOne({ address: client.address });

      if (!profile.meta) profile.meta = {};
      if (!profile.meta.rewards) profile.meta.rewards = {};
      if (!profile.meta.rewards.tokens) profile.meta.rewards.tokens = {};
      if (!profile.meta.rewards.tokens['pepe']) profile.meta.rewards.tokens['pepe'] = 0;
      if (profile.meta.rewards.tokens['pepe'] < 0) profile.meta.rewards.tokens['pepe'] = 0;

      profile.meta.rewards.tokens['pepe'] += index <= 9 ? rewardWinnerMap[index] : 0;

      for (const pickup of client.pickups) {
        if (pickup.type === 'token') {
          // TODO: change to authoritative
          // if (pickup.quantity > input.round.clients.length * evolutionData.data.rewardItemAmountPerLegitPlayer * 2) {
          //   log(
          //     pickup.quantity,
          //     evolutionData.data.rewardItemAmountPerLegitPlayer,
          //     input.round.clients.length,
          //     JSON.stringify(input.round.clients)
          //   );
          //   throw new Error('Big problem with item reward amount');
          // }

          // if (pickup.quantity > input.round.clients.length * evolutionData.data.rewardItemAmountMax) {
          //   log(pickup.quantity, input.round.clients.length, evolutionData.data.rewardItemAmountMax);
          //   throw new Error('Big problem with item reward amount 2');
          // }

          const tokenSymbol = pickup.rewardItemName.toLowerCase();

          if (!evolutionData.data.rewards.tokens.find((t) => t.symbol === tokenSymbol)) {
            throw new Error('Problem finding a reward token');
            continue;
          }

          if (!profile.meta.rewards.tokens[tokenSymbol] || profile.meta.rewards.tokens[tokenSymbol] < 0.000000001) {
            profile.meta.rewards.tokens[tokenSymbol] = 0;
          }

          profile.meta.rewards.tokens[tokenSymbol] += pickup.quantity;

          // if (!profile.lifetimeRewards.tokens[tokenSymbol] || profile.lifetimeRewards.tokens[tokenSymbol] < 0.000000001) {
          //   profile.lifetimeRewards.tokens[tokenSymbol] = 0
          // }

          // profile.lifetimeRewards.tokens[tokenSymbol] += pickup.quantity

          // evolutionData.data.rewards.tokens[tokenSymbol.toLowerCase()] -= pickup.quantity

          // app.db.oracle.outflow.evolutionRewards.tokens.week[tokenSymbol.toLowerCase()] += pickup.quantity
        } else {
          if (pickup.name === 'Santa Christmas 2024 Ticket') {
            if (!profile.meta.rewards.tokens['christmas2024']) profile.meta.rewards.tokens['christmas2024'] = 0;

            profile.meta.rewards.tokens['christmas2024'] += 1;
          }
        }
      }

      profile.markModified('meta');

      await profile.save();
    }

    return res;
  }

  async interact(input: RouterInput['interact'], ctx: RouterContext): Promise<RouterOutput['interact']> {
    console.log('Evolution.Service.interact', input);
  }

  async getScene(input: RouterInput['getScene'], ctx: RouterContext): Promise<RouterOutput['getScene']> {
    if (!input) throw new Error('Input should not be void');
    console.log('Evolution.Service.getScene', input);

    let data = {};

    if (input.applicationId === '668e4e805f9a03927caf883b') {
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
