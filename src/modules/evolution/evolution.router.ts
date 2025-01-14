import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '@arken/node/util/rpc';
import * as Arken from '@arken/node';
import { Query, getQueryInput, inferRouterOutputs, inferRouterInputs } from '@arken/node/schema';
import { RouterContext } from '../../types';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    info: procedure.query(({ input, ctx }) => (ctx.app.service.Evolution.info as any)(input, ctx)),

    updateConfig: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.any())
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.updateConfig as any)(input, ctx)),

    updateGameStats: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.updateGameStats as any)(input, ctx)),

    monitorChest: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.monitorChest as any)(input, ctx)),

    monitorParties: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .query(({ input, ctx }) => (ctx.app.service.Evolution.monitorParties as any)(input, ctx)),

    getParties: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Arken.Core.Schemas.Party))
      .output(z.array(Arken.Core.Schemas.Party))
      .query(({ input, ctx }) => (ctx.app.service.Evolution.getParties as any)(input, ctx)),

    createParty: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Arken.Core.Schemas.Party))
      .output(Arken.Core.Schemas.Party.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.createParty as any)(input, ctx)),

    joinParty: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Arken.Core.Schemas.Party))
      .output(Arken.Core.Schemas.Party.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.joinParty as any)(input, ctx)),

    leaveParty: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Arken.Core.Schemas.Party))
      .output(Arken.Core.Schemas.Party.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.leaveParty as any)(input, ctx)),

    getPayments: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .query(({ input, ctx }) => (ctx.app.service.Evolution.getPayments as any)(input, ctx)),

    processPayments: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.processPayments as any)(input, ctx)),

    cancelPaymentRequest: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          tokenKeys: z.any(),
          tokenAmounts: z.any(),
          // tokenIds: z.any(),
          // itemIds: z.any(),
          to: z.any(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.cancelPaymentRequest as any)(input, ctx)),

    createPaymentRequest: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          chain: z.string(),
          tokenKeys: z.any(),
          tokenAmounts: z.any(),
          // tokenIds: z.any(),
          // itemIds: z.any(),
          to: z.any(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.createPaymentRequest as any)(input, ctx)),

    saveRound: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          shardId: z.string(),
          round: z.any(),
        })
      )
      // .output(Arken.Profile.Schemas.Profile)
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.saveRound as any)(input, ctx)),

    interact: t.procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({}))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.interact as any)(input, ctx)),

    getScene: t.procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ applicationId: z.string() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Evolution.getScene as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;

// unbanClient: t.procedure
//   .input(z.object({ data: z.object({ target: z.string() }), id: z.string() }))
//   .mutation(({ input, ctx }) => {
//     service.unbanClient(ctx.app, input);
//   }),

// mod: t.procedure
//   .input(
//     z.object({
//       data: z.object({
//         body: z.object({ signature: z.object({ address: z.string() }) }),
//         params: z.object({ method: z.string() }),
//       }),
//     })
//   )
//   .mutation(({ input, ctx }) => {
//     service.mod(ctx.app, input);
//   }),

// banClient: t.procedure
//   .input(
//     z.object({
//       data: z.object({ target: z.string(), reason: z.string(), until: z.number().optional() }),
//       id: z.string(),
//     })
//   )
//   .mutation(({ input, ctx }) => {
//     service.banClient(ctx.app, input);
//   }),

// getCharacter: t.procedure
//   .input(z.object({ data: z.object({ address: z.string() }), id: z.string() }))
//   .mutation(({ input, ctx }) => {
//     service.getCharacter(ctx.app, input);
//   }),

// saveRound: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//   service.saveRound(ctx.app, input);
// }),

// Add more procedures as necessary

// Add the router type export if necessary
// export type Router = ReturnType<typeof createRouter>;

// class service {
//   private characters: Record<string, any> = {};

//   async pingRequest(msg: any) {
//     log('PingRequest', msg);
//   }

//   async pongRequest(msg: any) {
//     log('PongRequest', msg);
//   }

//   async unbanClient(app: Application, req: { data: { target: string }; id: string }) {
//     log('unbanClient', req);

//     const user = await app.db.loadUser(req.data.target);
//     delete user.isBanned;
//     delete user.bannedReason;
//     await app.db.saveUser(user);

//     app.db.removeBanList('evolution', req.data.target);
//     app.db.saveBanList();

//     return { status: 1 };
//   }

//   async mod(app: Application, req: { data: { body: { signature: { address: string } }; params: { method: string } } }) {
//     log('mod', req);

//     const user = await app.db.loadUser(req.data.body.signature.address);
//     app.emitAll.playerAction({
//       key: 'moderator-action',
//       createdAt: new Date().getTime() / 1000,
//       address: user.address,
//       username: user.username,
//       method: req.data.params.method,
//       message: `${user.username} called ${req.data.params.method}`,
//     });

//     return { status: 1 };
//   }

//   async banClient(app: Application, req: { data: { target: string; reason: string; until?: number }; id: string }) {
//     log('banClient', req);

//     const user = await app.db.loadUser(req.data.target);
//     user.isBanned = true;
//     user.bannedReason = req.data.reason;
//     user.banExpireDate = req.data.until || new Date().getTime() + 100 * 365 * 24 * 60 * 60; // 100 years by default

//     await app.db.saveUser(user);

//     app.db.addBanList('evolution', {
//       address: req.data.target,
//       reason: req.data.reason,
//       until: req.data.until,
//     });
//     app.db.saveBanList();

//     return { status: 1 };
//   }

//   async getCharacter(app: Application, req: { data: { address: string }; id: string }) {
//     log('GetCharacterRequest', req);

//     let character = this.characters[req.data.address];
//     if (!character) {
//       character = await this.fetchCharacter(app, req.data.address);
//       this.characters[req.data.address] = character;
//     }

//     return { status: 1 };
//   }

//   private async fetchCharacter(app: Application, address: string) {
//     // Implement character fetching logic here based on your application's needs
//     return {};
//   }

//   async saveRound(app: Application, req: any) {
//     log('SaveRoundRequest', req);

//     if (!(await isValidRequest(app.web3, req)) && app.db.evolution.modList.includes(req.signature.address)) {
//       log('Round invalid');
//       return { status: 0, message: 'Invalid signature' };
//       return;
//     }

//     return { status: 1 };
//   }
// }

// export const evolutionService = new EvolutionService();

// export const evolutionRouter = t.router({
//   pingRequest: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//     evolutionService.pingRequest(input);
//   }),

//   pongRequest: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//     evolutionService.pongRequest(input);
//   }),

//   unbanClient: t.procedure
//     .input(z.object({ data: z.object({ target: z.string() }), id: z.string() }))
//     .mutation(({ input, ctx }) => {
//       evolutionService.unbanClient(ctx.app, input);
//     }),

//   mod: t.procedure
//     .input(
//       z.object({
//         data: z.object({
//           body: z.object({ signature: z.object({ address: z.string() }) }),
//           params: z.object({ method: z.string() }),
//         }),
//       })
//     )
//     .mutation(({ input, ctx }) => {
//       evolutionService.mod(ctx.app, input);
//     }),

//   banClient: t.procedure
//     .input(
//       z.object({
//         data: z.object({ target: z.string(), reason: z.string(), until: z.number().optional() }),
//         id: z.string(),
//       })
//     )
//     .mutation(({ input, ctx }) => {
//       evolutionService.banClient(ctx.app, input);
//     }),

//   getCharacter: t.procedure
//     .input(z.object({ data: z.object({ address: z.string() }), id: z.string() }))
//     .mutation(({ input, ctx }) => {
//       evolutionService.getCharacter(ctx.app, input);
//     }),

//   saveRound: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//     evolutionService.saveRound(ctx.app, input);
//   }),

//   // Add more procedures as necessary
// });

// // Add the router type export if necessary
// export type EvolutionRouter = typeof evolutionRouter;

// const shortId = require('shortid');

// let CharacterCache = {};
// const ioCallbacks = {};

// async function rsCall(app, realm, name, data = undefined) {
//   try {
//     const id = shortId();
//     const signature =
//       data !== undefined && data !== null
//         ? await getSignedRequest(
//             app.web3,
//             app.secrets.find((s) => s.id === 'evolution-signer'),
//             data
//           )
//         : null;

//     return new Promise(async (resolve) => {
//       ioCallbacks[id] = {};

//       ioCallbacks[id].resolve = resolve;

//       ioCallbacks[id].reqTimeout = setTimeout(function () {
//         log('Request timeout');
//         resolve({ status: 0, message: 'Request timeout' });

//         delete ioCallbacks[id];
//       }, 60 * 1000);

//       if (!realm.client.socket?.connected) {
//         log('Not connected to realm server: ' + realm.key);
//         return;
//       }

//       log('Emit Realm', realm.key, name, { id, data });

//       realm.client.socket.emit(name, { id, signature, data });
//     });
//   } catch (e) {
//     log(e);
//   }
// }

// function setRealmOffline(realm) {
//   if (realm.status === 'inactive' || realm.updateMode === 'manual') return;

//   realm.status = 'offline';
//   realm.playerCount = 0;
//   realm.speculatorCount = 0;
//   realm.rewardItemAmount = 0;
//   realm.rewardWinnerAmount = 0;
// }

// async function setRealmConfig(app, realm) {
//   const configRes = (await rsCall(app, app.games.evolution.realms[realm.key], 'SetConfigRequest', {
//     config: { ...app.db.evolution.config, roundId: realm.roundId },
//   })) as any;

//   if (configRes.status !== 1) {
//     setRealmOffline(realm);
//     return;
//   }
// }

// async function updateRealm(app, realm) {
//   try {
//     realm.games = [];

//     const infoRes = (await rsCall(app, app.games.evolution.realms[realm.key], 'InfoRequest', { config: {} })) as any; // roundId: realm.roundId

//     if (!infoRes || infoRes.status !== 1) {
//       setRealmOffline(realm);
//       return;
//     }

//     log('infoRes', infoRes.data.games);

//     const { data } = infoRes;

//     realm.playerCount = data.playerCount;
//     realm.speculatorCount = data.speculatorCount;
//     realm.version = data.version;

//     realm.games = data.games.map((game) => ({
//       id: game.id,
//       playerCount: game.playerCount,
//       speculatorCount: game.speculatorCount,
//       version: game.version,
//       rewardItemAmount: game.rewardItemAmount,
//       rewardWinnerAmount: game.rewardWinnerAmount,
//       gameMode: game.gameMode,
//       connectedPlayers: game.connectedPlayers,
//       roundId: game.round.id,
//       roundStartedAt: game.round.startedAt,
//       timeLeft: ~~(5 * 60 - (new Date().getTime() / 1000 - game.round.startedAt)),
//       timeLeftText: fancyTimeFormat(5 * 60 - (new Date().getTime() / 1000 - game.round.startedAt)),
//       endpoint: (function () {
//         const url = new URL((process.env.ARKEN_ENV === 'local' ? 'http://' : 'https://') + realm.endpoint);
//         url.port = game.port;
//         return url.toString();
//       })()
//         .replace('http://', '')
//         .replace('https://', '')
//         .replace('/', ''),
//     }));

//     delete realm.timeLeftFancy;

//     realm.status = 'online';
//   } catch (e) {
//     log('Error', e);

//     setRealmOffline(realm);
//   }

//   // log('Updated server', server)

//   return realm;
// }

// async function updateRealms(app) {
//   try {
//     log('Updating Evolution realms');

//     let playerCount = 0;

//     for (const realm of app.db.evolution.realms) {
//       // if (realm.key.indexOf('ptr') !== -1 || realm.key.indexOf('tournament') !== -1) continue
//       if (realm.status === 'inactive' || realm.updateMode === 'manual') continue;

//       await updateRealm(app, realm);

//       const hist = jetpack.read(path.resolve(`./db/evolution/${realm.key}/historical.json`), 'json') || {};

//       if (!hist.playerCount) hist.playerCount = [];

//       const oldTime = new Date(hist.playerCount[hist.playerCount.length - 1]?.[0] || 0).getTime();
//       const newTime = new Date().getTime();
//       const diff = newTime - oldTime;
//       if (diff / (1000 * 60 * 60 * 1) > 1) {
//         hist.playerCount.push([newTime, realm.playerCount]);
//       }

//       jetpack.write(path.resolve(`./db/evolution/${realm.key}/historical.json`), JSON.stringify(hist), {
//         atomic: true,
//         jsonIndent: 0,
//       });

//       playerCount += realm.playerCount;

//       log(`Realm ${realm.key} updated`, realm);
//     }

//     app.db.evolution.playerCount = playerCount;

//     for (const server of app.db.evolution.servers) {
//       if (server.status === 'inactive' || server.updateMode === 'manual') continue;
//       // if (server.key.indexOf('tournament') !== -1) continue

//       server.status = 'offline';
//       server.playerCount = 0;
//     }

//     const evolutionServers = app.db.evolution.realms
//       .filter((r) => r.status !== 'inactive')
//       .map((r) =>
//         r.games.length > 0
//           ? {
//               ...(app.db.evolution.servers.find((e) => e.key === r.key) || {}),
//               ...r.games[0],
//               key: r.key,
//               name: r.name,
//               status: r.status,
//               regionId: r.regionId,
//             }
//           : {}
//       );

//     for (const evolutionServer of evolutionServers) {
//       const server = app.db.evolution.servers.find((s) => s.key === evolutionServer.key);

//       if (!server) {
//         if (evolutionServer.key) {
//           app.db.evolution.servers.push(evolutionServer);
//         }
//         continue;
//       }

//       if (evolutionServer.status === 'inactive' || evolutionServer.updateMode === 'manual') continue;

//       server.status = evolutionServer.status;
//       server.version = evolutionServer.version;
//       server.rewardItemAmount = evolutionServer.rewardItemAmount;
//       server.rewardWinnerAmount = evolutionServer.rewardWinnerAmount;
//       server.gameMode = evolutionServer.gameMode;
//       server.roundId = evolutionServer.roundId;
//       server.roundStartedAt = evolutionServer.roundStartedAt;
//       server.roundStartedDate = evolutionServer.roundStartedDate;
//       server.timeLeft = evolutionServer.timeLeft;
//       server.timeLeftText = evolutionServer.timeLeftText;
//       server.playerCount = evolutionServer.playerCount;
//       server.speculatorCount = evolutionServer.speculatorCount;
//       server.endpoint = evolutionServer.endpoint;
//     }

//     jetpack.write(path.resolve('./db/evolution/realms.json'), JSON.stringify(app.db.evolution.realms), {
//       atomic: true,
//       jsonIndent: 0,
//     });

//     // Update old servers file
//     jetpack.write(path.resolve('./db/evolution/servers.json'), JSON.stringify(app.db.evolution.servers), {
//       atomic: true,
//       jsonIndent: 0,
//     });

//     log('Realm and server info generated');

//     // Update overall historics
//     const hist = jetpack.read(path.resolve(`./db/evolution/historical.json`), 'json') || {};

//     if (!hist.playerCount) hist.playerCount = [];

//     const oldTime = new Date(hist.playerCount[hist.playerCount.length - 1]?.[0] || 0).getTime();
//     const newTime = new Date().getTime();
//     const diff = newTime - oldTime;
//     if (diff / (1000 * 60 * 60 * 1) > 1) {
//       hist.playerCount.push([newTime, playerCount]);
//     }

//     jetpack.write(path.resolve(`./db/evolution/historical.json`), JSON.stringify(hist), {
//       atomic: true,
//       jsonIndent: 0,
//     });
//   } catch (e) {
//     log('Error', e);
//   }
// }

// function cleanupClient(client) {
//   log('Cleaning up', client.key);

//   client.socket?.close();
//   client.isConnected = false;
//   client.isConnecting = false;
//   client.isAuthed = false;

//   clearTimeout(client.timeout);
//   clearTimeout(client.pingReplyTimeout);
//   clearTimeout(client.pingerTimeout);
// }

// function disconnectClient(client) {
//   log('Disconnecting client', client.key);

//   cleanupClient(client);
// }

// async function getCharacter(app, address) {
//   const equipment = await app.barracks.getPlayerEquipment(app, address);
//   const meta = await app.barracks.getMetaFromEquipment(app, equipment);

//   // if (address === '0x1a367CA7bD311F279F1dfAfF1e60c4d797Faa6eb') {
//   //   meta[1030] = 100
//   // }

//   let error;
//   if (meta[1030] > 100) error = `Problem with EvolutionMovementSpeedIncrease: ${address} ${meta[1030]}`;
//   if (meta[1102] > 100) error = `Problem with DeathPenaltyAvoid: ${address} ${meta[1102]}`;
//   if (meta[1104] > 100) error = `Problem with EnergyDecayDecrease: ${address} ${meta[1104]}`;
//   if (meta[1105] > 100) error = `Problem with EnergyDecayIncrease: ${address} ${meta[1105]}`;
//   if (meta[1150] > 100) error = `Problem with WinRewardsIncrease: ${address} ${meta[1150]}`;
//   if (meta[1160] > 100) error = `Problem with WinRewardsDecrease: ${address} ${meta[1160]}`;
//   if (meta[1222] > 100) error = `Problem with IncreaseMovementSpeedOnKill: ${address} ${meta[1222]}`;
//   if (meta[1223] > 100) error = `Problem with EvolveMovementBurst: ${address} ${meta[1223]}`;
//   if (meta[1164] > 100) error = `Problem with DoublePickupChance: ${address} ${meta[1164]}`;
//   if (meta[1219] > 100) error = `Problem with IncreaseHealthOnKill: ${address} ${meta[1219]}`;
//   if (meta[1117] > 100) error = `Problem with SpriteFuelIncrease: ${address} ${meta[1117]}`;
//   if (meta[1118] > 100) error = `Problem with SpriteFuelDecrease: ${address} ${meta[1118]}`;

//   if (error) {
//     log('Error with character gear:', error);
//     process.exit(6);
//   }

//   return {
//     equipment,
//     meta,
//   };
// }

// const runes = [
//   'el',
//   'eld',
//   'tir',
//   'nef',
//   'ith',
//   'tal',
//   'ral',
//   'ort',
//   'thul',
//   'amn',
//   'sol',
//   'shael',
//   'dol',
//   'hel',
//   'io',
//   'lum',
//   'ko',
//   'fal',
//   'lem',
//   'pul',
//   'um',
//   'mal',
//   'ist',
//   'gul',
//   'vex',
//   'ohm',
//   'lo',
//   'sur',
//   'ber',
//   'jah',
//   'cham',
//   'zod',
// ];

// export async function connectRealm(app, realm) {
//   if (realm.status === 'inactive' || realm.ignore) return;

//   log('Connecting to realm', realm);
//   const { client } = app.games.evolution.realms[realm.key];

//   if (client.isConnected || client.socket?.connected) {
//     log(`Realm ${realm.key} already connected, disconnecting`);
//     cleanupClient(client);
//   }

//   client.isConnecting = true;
//   client.socket = getClientSocket((process.env.ARKEN_ENV === 'local' ? 'http://' : 'https://') + realm.endpoint); // TODO: RS should be running things

//   client.socket.on('connect', async () => {
//     try {
//       client.isConnected = true;

//       log('Connected: ' + realm.key);

//       const res = (await rsCall(app, app.games.evolution.realms[realm.key], 'AuthRequest', 'myverysexykey')) as any;

//       if (res.status === 1) {
//         client.isAuthed = true;

//         clearTimeout(client.connectTimeout);

//         await setRealmConfig(app, realm);
//         await updateRealm(app, realm);
//       }

//       client.isConnecting = false;

//       const pinger = async () => {
//         try {
//           clearTimeout(client.pingReplyTimeout);

//           client.pingReplyTimeout = setTimeout(function () {
//             log(`Realm ${realm.key} didnt respond in time, disconnecting`);
//             cleanupClient(client);
//           }, 70 * 1000);

//           await rsCall(app, app.games.evolution.realms[realm.key], 'PingRequest');

//           clearTimeout(client.pingReplyTimeout);

//           if (!client.isConnected) return;

//           client.pingerTimeout = setTimeout(async () => await pinger(), 15 * 1000);
//         } catch (e) {
//           log(e);
//         }
//       };

//       clearTimeout(client.pingerTimeout);
//       clearTimeout(client.pingReplyTimeout);

//       client.pingerTimeout = setTimeout(async () => await pinger(), 15 * 1000);
//     } catch (e) {
//       log('Error', e);
//       log(`Disconnecting ${realm.key} due to error`);
//       cleanupClient(client);
//     }
//   });

//   client.socket.on('disconnect', () => {
//     log('Disconnected: ' + realm.key);
//     cleanupClient(client);
//   });

//   // client.socket.on('banClient', async function (req) {
//   //   console.log(req)
//   //   try {
//   //     log('Ban', realm.key, req)

//   //     if (await isValidRequest(app.web3, req) && app.db.evolution.modList.includes(req.signature.address)) {
//   //       app.db.addBanList('evolution', req.data.target)

//   //       app.db.saveBanList()

//   //       app.realm.emitAll('BanUserRequest', {
//   //         signature: await getSignedRequest(app.web3, app.secrets, md5(JSON.stringify({ target: req.data.target }))),
//   //         data: {
//   //           target: req.data.target
//   //         }
//   //       })

//   //       client.socket.emit('BanUserResponse', {
//   //         id: req.id,
//   //         data: { status: 1 }
//   //       })
//   //     } else {
//   //       client.socket.emit('BanUserResponse', {
//   //         id: req.id,
//   //         data: { status: 0, message: 'Invalid signature' }
//   //       })
//   //     }
//   //   } catch (e) {
//   //     log('Error', e)

//   //     client.socket.emit('BanUserResponse', {
//   //       id: req.id,
//   //       data: { status: 0, message: e }
//   //     })
//   //   }
//   // })

//   client.socket.on('PingRequest', function (msg) {
//     log('PingRequest', realm.key, msg);

//     client.socket.emit('PingResponse');
//   });

//   client.socket.on('PongRequest', function (msg) {
//     log('PongRequest', realm.key, msg);

//     client.socket.emit('PongResponse');
//   });

//   client.socket.on('unbanClient', async function (req) {
//     try {
//       log('Ban', realm.key, req);

//       const user = await app.db.loadUser(req.data.target);

//       delete user.isBanned;
//       delete user.bannedReason;

//       await app.db.saveUser(user);

//       app.db.removeBanList('evolution', req.data.target);
//       app.db.saveBanList();

//       app.realm.emitAll('UnbanUserRequest', {
//         data: {
//           target: req.data.target,
//         },
//       });

//       client.socket.emit('UnbanClientResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('UnbanClientResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });
//     }
//   });

//   client.socket.on('mod', async function (req) {
//     try {
//       log('mod', realm.key, req);

//       const user = await app.db.loadUser(req.data.body.signature.address);

//       app.api.emitAll('playerAction', {
//         key: 'moderator-action',
//         createdAt: new Date().getTime() / 1000,
//         address: user.address,
//         username: user.username,
//         method: req.data.params.method,
//         realmKey: realm.key,
//         message: `${user.username} called ${req.data.params.method}`,
//       });

//       client.socket.emit('ModResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('ModResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });
//     }
//   });

//   client.socket.on('banClient', async function (req) {
//     try {
//       log('banClient', realm.key, req);

//       const user = await app.db.loadUser(req.data.target);

//       user.isBanned = true;
//       user.bannedReason = req.data.reason;
//       user.bannedUntil = req.data.until ? parseInt(req.data.until) : new Date().getTime() + 100 * 365 * 24 * 60 * 60; // 100 year ban by default

//       await app.db.saveUser(user);

//       app.db.addBanList('evolution', { address: req.data.target, reason: req.data.reason, until: req.data.until });
//       app.db.saveBanList();

//       app.realm.emitAll('BanUserRequest', {
//         data: {
//           target: req.data.target,
//           createdAt: new Date().getTime(),
//           bannedUntil: user.bannedUntil,
//           bannedReason: user.bannedReason,
//         },
//       });

//       client.socket.emit('BanPlayerResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('BanPlayerResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });
//     }
//   });

//   client.socket.on('reportClient', function (msg) {
//     log('reportClient', realm.key, msg);

//     const { currentGamePlayers, currentPlayer, reportedPlayer } = msg;

//     if (currentPlayer.name.indexOf('Guest') !== -1 || currentPlayer.name.indexOf('Unknown') !== -1) return; // No guest reports

//     if (!app.db.evolution.reportList[reportedPlayer.address]) app.db.evolution.reportList[reportedPlayer.address] = [];

//     if (!app.db.evolution.reportList[reportedPlayer.address].includes(currentPlayer.address))
//       app.db.evolution.reportList[reportedPlayer.address].push(currentPlayer.address);

//     // if (app.db.evolution.reportList[reportedPlayer.address].length >= 6) {
//     //   app.db.evolution.banList.push(reportedPlayer.address)

//     //   disconnectPlayer(reportedPlayer)
//     //   // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
//     //   return
//     // }

//     // if (currentGamePlayers.length >= 4) {
//     //   const reportsFromCurrentGamePlayers = app.db.evolution.reportList[reportedPlayer.address].filter(function(n) {
//     //     return currentGamePlayers.indexOf(n) !== -1;
//     //   })

//     //   if (reportsFromCurrentGamePlayers.length >= currentGamePlayers.length / 3) {
//     //     app.db.evolution.banList.push(reportedPlayer.address)

//     //     disconnectPlayer(reportedPlayer)
//     //     // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
//     //     return
//     //   }
//     // }

//     // Relay the report to connected realm servers
//   });

//   client.socket.on('GetCharacterRequest', async function (req) {
//     log('GetCharacterRequest', req);

//     try {
//       let character = CharacterCache[req.data.address];

//       if (!character) {
//         // if (req.data.address === '0x1a367CA7bD311F279F1dfAfF1e60c4d797Faa6eb') {
//         //   meta[1030] = 100
//         // }

//         // if (req.data.address === '0x6f756AFaC862A2486f4c1C96b46E00A98a70bEA2') {
//         //   meta[1030] = 100
//         // }

//         character = await getCharacter(app, req.data.address);

//         CharacterCache[req.data.address] = character;
//       }

//       log('GetCharacterResponse', character);

//       client.socket.emit('GetCharacterResponse', {
//         id: req.id,
//         data: { status: 1, character },
//       });
//     } catch (e) {
//       client.socket.emit('GetCharacterResponse', {
//         id: req.id,
//         data: { status: 0, message: 'Error' },
//       });
//     }
//   });

//   client.socket.on('SaveRoundRequest', async function (req) {
//     // Iterate the items found, add to user.evolution.rewards
//     // Itereate the runes found, add to user.evolution.runes
//     // Iterate the winners, add to the user.evolution.runes
//     // Add winning stats to user.evolution
//     try {
//       log('SaveRoundRequest', realm.key, req);

//       if (!(await isValidRequest(app.web3, req)) && app.db.evolution.modList.includes(req.signature.address)) {
//         log('Round invalid');

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 0, message: 'Invalid signature' },
//         });
//         return;
//       }

//       if (!req.data.lastClients) {
//         log('Round no clients');

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 0, message: 'Error processing' },
//         });
//         return;
//       }

//       if (req.data.round.winners.length === 0) {
//         realm.roundId += 1;

//         log('Round skipped');

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 1 },
//         });
//         return;
//       }

//       if (req.data.rewardWinnerAmount > app.db.evolution.config.rewardWinnerAmountMax) {
//         log(req.data.rewardWinnerAmount, app.db.evolution.config.rewardWinnerAmountMax);
//         throw new Error('Big problem with reward amount');
//       }

//       let totalLegitPlayers = 0;

//       for (const client of req.data.lastClients) {
//         if (client.name.indexOf('Guest') !== -1 || client.name.indexOf('Unknown') !== -1) continue;

//         if (
//           (client.powerups > 100 && client.kills > 1) ||
//           (client.evolves > 20 && client.powerups > 200) ||
//           (client.rewards > 3 && client.powerups > 200) ||
//           client.evolves > 100 ||
//           client.points > 1000
//         ) {
//           totalLegitPlayers += 1;
//         }
//       }

//       if (totalLegitPlayers === 0) {
//         totalLegitPlayers = 1;
//       }

//       if (req.data.rewardWinnerAmount > app.db.evolution.config.rewardWinnerAmountPerLegitPlayer * totalLegitPlayers) {
//         log(
//           req.data.rewardWinnerAmount,
//           app.db.evolution.config.rewardWinnerAmountPerLegitPlayer,
//           totalLegitPlayers,
//           req.data.lastClients.length,
//           JSON.stringify(req.data.lastClients)
//         );
//         throw new Error('Big problem with reward amount 2');
//       }

//       if (req.data.roundId > realm.roundId) {
//         realm.roundId = req.data.roundId;
//       } else if (req.data.roundId < realm.roundId) {
//         const err = `Round id too low (realm.roundId = ${realm.roundId})`;

//         log(err);

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 0, message: err },
//         });

//         await setRealmConfig(app, realm);

//         return;
//       } else {
//         realm.roundId += 1;
//       }

//       // if (req.data.roundId > realm.roundId) {
//       //   client.socket.emit('SaveRoundResponse', {
//       //     id: req.id,
//       //     data: { status: 0, message: 'Invalid round id' }
//       //   })
//       //   return
//       // }

//       const rewardWinnerMap = {
//         0: Math.round(req.data.rewardWinnerAmount * 1 * 1000) / 1000,
//         1: Math.round(req.data.rewardWinnerAmount * 0.25 * 1000) / 1000,
//         2: Math.round(req.data.rewardWinnerAmount * 0.15 * 1000) / 1000,
//         3: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         4: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         5: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         6: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         7: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         8: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         9: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       };

//       // const users = []

//       // Iterate the winners, determine the winning amounts, validate, save to user rewards
//       // Iterate all players and save their log / stats

//       const removeDupes2 = (list) => {
//         const seen = {};
//         return list.filter(function (item) {
//           // console.log(item)
//           const k1 = item.address;
//           const exists = seen.hasOwnProperty(k1);

//           if (!exists) {
//             seen[k1] = true;
//           }

//           return !exists;
//         });
//       };

//       req.data.round.players = removeDupes2(req.data.round.players); // [...new Set(req.data.round.players.map(obj => obj.key)) ] //

//       const winners = req.data.round.winners.slice(0, 10);

//       const rewardTweaks = {};

//       for (const winner of winners) {
//         let character = CharacterCache[winner.address];

//         if (!character) {
//           console.log('Getting char data');
//           character = await getCharacter(app, winner.address);
//           console.log('Got char data');

//           CharacterCache[winner.address] = character;
//         }

//         // if (character?.meta?.[1173] > 0) {
//         //   const portion = 0.05

//         //   for (const kill of winner.log.kills) {
//         //     const target = req.data.round.players.filter(p => p.hash === kill)

//         //     if (target?.address) {
//         //       if (!rewardTweaks[target.address]) rewardTweaks[target.address] = 0
//         //       if (!rewardTweaks[winner.address]) rewardTweaks[winner.address] = 0

//         //       rewardTweaks[target.address] -= portion
//         //       rewardTweaks[winner.address] += portion
//         //     }
//         //   }
//         // }
//       }

//       for (const player of req.data.round.players) {
//         console.log('Loading user');
//         const user = await app.db.loadUser(player.address);
//         console.log('Loaded user');
//         const now = new Date().getTime() / 1000;

//         if (user.lastGamePlayed > now - 4 * 60) continue; // Make sure this player isn't in 2 games or somehow getting double rewards

//         if (typeof user.username === 'object' || !user.username) user.username = await getUsername(user.address);

//         if (!user.username) continue; // Make sure cant earn without a character

//         app.db.setUserActive(user);

//         if (player.killStreak >= 10) {
//           app.api.emitAll('PlayerAction', {
//             key: 'evolution1-killstreak',
//             createdAt: new Date().getTime() / 1000,
//             address: user.address,
//             username: user.username,
//             message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
//           });
//           app.notices.add('evolution1-killstreak', {
//             key: 'evolution1-killstreak',
//             address: user.address,
//             username: user.username,
//             message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
//           });
//         }

//         for (const pickup of player.pickups) {
//           if (pickup.type === 'rune') {
//             // TODO: change to authoritative
//             if (
//               pickup.quantity >
//               req.data.round.players.length * app.db.evolution.config.rewardItemAmountPerLegitPlayer * 2
//             ) {
//               log(
//                 pickup.quantity,
//                 app.db.evolution.config.rewardItemAmountPerLegitPlayer,
//                 req.data.round.players.length,
//                 JSON.stringify(req.data.round.players)
//               );
//               throw new Error('Big problem with item reward amount');
//             }

//             if (pickup.quantity > req.data.round.players.length * app.db.evolution.config.rewardItemAmountMax) {
//               log(pickup.quantity, req.data.round.players.length, app.db.evolution.config.rewardItemAmountMax);
//               throw new Error('Big problem with item reward amount 2');
//             }

//             const runeSymbol = pickup.rewardItemName.toLowerCase();

//             if (!runes.includes(runeSymbol)) {
//               continue;
//             }

//             if (!user.rewards.runes[runeSymbol] || user.rewards.runes[runeSymbol] < 0.000000001) {
//               user.rewards.runes[runeSymbol] = 0;
//             }

//             user.rewards.runes[runeSymbol] += pickup.quantity;

//             if (!user.lifetimeRewards.runes[runeSymbol] || user.lifetimeRewards.runes[runeSymbol] < 0.000000001) {
//               user.lifetimeRewards.runes[runeSymbol] = 0;
//             }

//             user.lifetimeRewards.runes[runeSymbol] += pickup.quantity;

//             app.db.evolution.config.itemRewards.runes[runeSymbol.toLowerCase()] -= pickup.quantity;

//             app.db.oracle.outflow.evolutionRewards.tokens.week[runeSymbol.toLowerCase()] += pickup.quantity;
//           } else {
//             user.rewards.items[pickup.id] = {
//               name: pickup.name,
//               rarity: pickup.rarity,
//               quantity: pickup.quantity,
//             };

//             user.lifetimeRewards.items[pickup.id] = {
//               name: pickup.name,
//               rarity: pickup.rarity,
//               quantity: pickup.quantity,
//             };
//           }

//           // user.rewardTracking.push(req.tracking)
//         }

//         user.lastGamePlayed = now;

//         if (!user.evolution.hashes) user.evolution.hashes = [];
//         if (!user.evolution.hashes.includes(player.hash)) user.evolution.hashes.push(player.hash);

//         user.evolution.hashes = user.evolution.hashes.filter(function (item, pos) {
//           return user.evolution.hashes.indexOf(item) === pos;
//         });

//         // users.push(user)

//         if (!app.games.evolution.realms[realm.key].leaderboard.names)
//           app.games.evolution.realms[realm.key].leaderboard.names = {};

//         app.games.evolution.realms[realm.key].leaderboard.names[user.address] = user.username;

//         if (!app.games.evolution.realms[realm.key].leaderboard.raw.points[user.address]) {
//           // 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency'
//           app.games.evolution.realms[realm.key].leaderboard.raw.monetary[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.wins[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.rounds[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.kills[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.points[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.deaths[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.powerups[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.evolves[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.rewards[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.pickups[user.address] = 0;
//         }

//         // Update leaderboard stats
//         app.games.evolution.realms[realm.key].leaderboard.raw.rounds[user.address] += 1;
//         app.games.evolution.realms[realm.key].leaderboard.raw.kills[user.address] += player.kills;
//         app.games.evolution.realms[realm.key].leaderboard.raw.points[user.address] += player.points;
//         app.games.evolution.realms[realm.key].leaderboard.raw.deaths[user.address] += player.deaths;
//         app.games.evolution.realms[realm.key].leaderboard.raw.powerups[user.address] += player.powerups;
//         app.games.evolution.realms[realm.key].leaderboard.raw.evolves[user.address] += player.evolves;
//         app.games.evolution.realms[realm.key].leaderboard.raw.rewards[user.address] += player.rewards;
//         app.games.evolution.realms[realm.key].leaderboard.raw.pickups[user.address] += player.pickups.length;

//         if (!app.games.evolution.global.leaderboard.names) app.games.evolution.global.leaderboard.names = {};

//         app.games.evolution.global.leaderboard.names[user.address] = user.username;

//         if (!app.games.evolution.global.leaderboard.raw.points[user.address]) {
//           // 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency'
//           app.games.evolution.global.leaderboard.raw.monetary[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.wins[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.rounds[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.kills[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.points[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.deaths[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.powerups[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.evolves[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.rewards[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.pickups[user.address] = 0;
//         }

//         // Update leaderboard stats
//         app.games.evolution.global.leaderboard.raw.rounds[user.address] += 1;
//         app.games.evolution.global.leaderboard.raw.kills[user.address] += player.kills;
//         app.games.evolution.global.leaderboard.raw.points[user.address] += player.points;
//         app.games.evolution.global.leaderboard.raw.deaths[user.address] += player.deaths;
//         app.games.evolution.global.leaderboard.raw.powerups[user.address] += player.powerups;
//         app.games.evolution.global.leaderboard.raw.evolves[user.address] += player.evolves;
//         app.games.evolution.global.leaderboard.raw.rewards[user.address] += player.rewards;
//         app.games.evolution.global.leaderboard.raw.pickups[user.address] += player.pickups.length;

//         if (winners.find((winner) => winner.address === player.address)) {
//           const index = winners.findIndex((winner) => winner.address === player.address);
//           // const player = req.data.round.winners[index]
//           // const user = users.find(u => u.address === player.address)

//           // if (!user) continue // He wasn't valid
//           if (user.username) {
//             // Make sure cant earn without a character
//             // if (req.data.round.winners[0].address === player.address) {
//             let character = CharacterCache[player.address];

//             if (!character) {
//               console.log('Getting char data');
//               character = await getCharacter(app, player.address);
//               console.log('Got char data');

//               CharacterCache[player.address] = character;
//             }

//             const WinRewardsIncrease = character?.meta?.[1150] || 0;
//             const WinRewardsDecrease = character?.meta?.[1160] || 0;

//             console.log('bbbb', rewardWinnerMap[index]);
//             const rewardMultiplier = 1 + (WinRewardsIncrease - WinRewardsDecrease) / 100;

//             if (rewardMultiplier > 2 || rewardMultiplier < 0) {
//               log(
//                 'Error with reward multiplier.. bad things happened: ',
//                 rewardMultiplier,
//                 rewardMultiplier,
//                 WinRewardsDecrease
//               );
//               process.exit(5);
//             }

//             rewardWinnerMap[index] *= rewardMultiplier;
//             console.log('cccc', rewardWinnerMap[index]);
//             // }

//             if (!user.rewards.runes['zod']) {
//               user.rewards.runes['zod'] = 0;
//             }

//             if (user.rewards.runes['zod'] < 0) {
//               user.rewards.runes['zod'] = 0;
//             }

//             user.rewards.runes['zod'] += rewardWinnerMap[index];

//             if (!user.lifetimeRewards.runes['zod']) {
//               user.lifetimeRewards.runes['zod'] = 0;
//             }

//             user.lifetimeRewards.runes['zod'] += rewardWinnerMap[index];

//             app.db.oracle.outflow.evolutionRewards.tokens.week['zod'] += rewardWinnerMap[index];

//             app.games.evolution.global.leaderboard.raw.monetary[user.address] += rewardWinnerMap[index];

//             app.games.evolution.realms[realm.key].leaderboard.raw.monetary[user.address] += rewardWinnerMap[index];

//             app.api.emitAll('PlayerAction', {
//               key: 'evolution1-winner',
//               createdAt: new Date().getTime() / 1000,
//               address: user.address,
//               username: user.username,
//               realmKey: realm.key,
//               placement: index + 1,
//               message: `${user.username} placed #${index + 1} for ${rewardWinnerMap[index].toFixed(
//                 4
//               )} ZOD in Evolution`,
//             });

//             if (rewardWinnerMap[index] > 0.1) {
//               app.notices.add('evolution1-winner', {
//                 key: 'evolution1-winner',
//                 address: user.address,
//                 username: user.username,
//                 realmKey: realm.key,
//                 placement: index + 1,
//                 message: `${user.username} won ${rewardWinnerMap[index].toFixed(4)} ZOD in Evolution`,
//               });
//             }

//             if (req.data.round.winners[0].address === player.address) {
//               if (!app.games.evolution.realms[realm.key].leaderboard.raw)
//                 app.games.evolution.realms[realm.key].leaderboard.raw = {};
//               if (!app.games.evolution.realms[realm.key].leaderboard.raw.wins)
//                 app.games.evolution.realms[realm.key].leaderboard.raw.wins = 0;

//               app.games.evolution.realms[realm.key].leaderboard.raw.wins[user.address] += 1;

//               if (!app.games.evolution.global.leaderboard.raw) app.games.evolution.global.leaderboard.raw = {};
//               if (!app.games.evolution.global.leaderboard.raw.wins) app.games.evolution.global.leaderboard.raw.wins = 0;

//               app.games.evolution.global.leaderboard.raw.wins[user.address] += 1;
//             }
//           }
//         }

//         await app.db.saveUser(user);
//       }

//       log('Round saved');

//       client.socket.emit('SaveRoundResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('SaveRoundResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });

//       disconnectClient(client);
//     }
//   });

// import type * as Arken from '@arken/node/types';
// import { isDebug, log } from '@arken/node/util';
// import * as dotenv from 'dotenv';
// import { catchExceptions, subProcesses } from '@arken/node/util/process';
// import fetch from 'node-fetch';

// import path from 'path';
// import jetpack, { find } from 'fs-jetpack';
// import beautify from 'json-beautify';
// import { fancyTimeFormat } from '@arken/node/util/time';
// import md5 from 'js-md5';
// import { getClientSocket } from '@arken/node/util/websocket';
// import { isValidRequest, getSignedRequest } from '@arken/node/util/web3';
// import getUsername from '@arken/node/legacy/getOldUsername';
// import { z } from 'zod';

// export async function monitorEvolutionRealms(app) {}

// export const createRouter = (t: any) =>
//   t.router({
//     saveRound: t.procedure
//       .input(
//         z.object({
//           shardId: z.string(),
//           roundId: z.number(),
//           round: z.any(),
//           rewardWinnerAmount: z.number(),
//           lastClients: z.any(),
//         })
//       )
//       .mutation(({ input, ctx }) => {
//         return { status: 1 };
//       }),

//     getProfile: t.procedure.input(z.string()).query(({ input, ctx }) => {
//       return { status: 1, data: {} as Arken.Profile.Types.Profile };
//     }),

// unbanClient: t.procedure
//   .input(z.object({ data: z.object({ target: z.string() }), id: z.string() }))
//   .mutation(({ input, ctx }) => {
//     service.unbanClient(ctx.app, input);
//   }),

// mod: t.procedure
//   .input(
//     z.object({
//       data: z.object({
//         body: z.object({ signature: z.object({ address: z.string() }) }),
//         params: z.object({ method: z.string() }),
//       }),
//     })
//   )
//   .mutation(({ input, ctx }) => {
//     service.mod(ctx.app, input);
//   }),

// banClient: t.procedure
//   .input(
//     z.object({
//       data: z.object({ target: z.string(), reason: z.string(), until: z.number().optional() }),
//       id: z.string(),
//     })
//   )
//   .mutation(({ input, ctx }) => {
//     service.banClient(ctx.app, input);
//   }),

// getCharacter: t.procedure
//   .input(z.object({ data: z.object({ address: z.string() }), id: z.string() }))
//   .mutation(({ input, ctx }) => {
//     service.getCharacter(ctx.app, input);
//   }),

// saveRound: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//   service.saveRound(ctx.app, input);
// }),

// Add more procedures as necessary
// });

// Add the router type export if necessary
// export type Router = ReturnType<typeof createRouter>;

// class service {
//   private characters: Record<string, any> = {};

//   async pingRequest(msg: any) {
//     log('PingRequest', msg);
//   }

//   async pongRequest(msg: any) {
//     log('PongRequest', msg);
//   }

//   async unbanClient(app: Application, req: { data: { target: string }; id: string }) {
//     log('unbanClient', req);

//     const user = await app.db.loadUser(req.data.target);
//     delete user.isBanned;
//     delete user.bannedReason;
//     await app.db.saveUser(user);

//     app.db.removeBanList('evolution', req.data.target);
//     app.db.saveBanList();

//     return { status: 1 };
//   }

//   async mod(app: Application, req: { data: { body: { signature: { address: string } }; params: { method: string } } }) {
//     log('mod', req);

//     const user = await app.db.loadUser(req.data.body.signature.address);
//     app.emitAll.playerAction({
//       key: 'moderator-action',
//       createdAt: new Date().getTime() / 1000,
//       address: user.address,
//       username: user.username,
//       method: req.data.params.method,
//       message: `${user.username} called ${req.data.params.method}`,
//     });

//     return { status: 1 };
//   }

//   async banClient(app: Application, req: { data: { target: string; reason: string; until?: number }; id: string }) {
//     log('banClient', req);

//     const user = await app.db.loadUser(req.data.target);
//     user.isBanned = true;
//     user.bannedReason = req.data.reason;
//     user.banExpireDate = req.data.until || new Date().getTime() + 100 * 365 * 24 * 60 * 60; // 100 years by default

//     await app.db.saveUser(user);

//     app.db.addBanList('evolution', {
//       address: req.data.target,
//       reason: req.data.reason,
//       until: req.data.until,
//     });
//     app.db.saveBanList();

//     return { status: 1 };
//   }

//   async getCharacter(app: Application, req: { data: { address: string }; id: string }) {
//     log('GetCharacterRequest', req);

//     let character = this.characters[req.data.address];
//     if (!character) {
//       character = await this.fetchCharacter(app, req.data.address);
//       this.characters[req.data.address] = character;
//     }

//     return { status: 1 };
//   }

//   private async fetchCharacter(app: Application, address: string) {
//     // Implement character fetching logic here based on your application's needs
//     return {};
//   }

//   async saveRound(app: Application, req: any) {
//     log('SaveRoundRequest', req);

//     if (!(await isValidRequest(app.web3, req)) && app.db.evolution.modList.includes(req.signature.address)) {
//       log('Round invalid');
//       return { status: 0, message: 'Invalid signature' };
//       return;
//     }

//     return { status: 1 };
//   }
// }

// export const evolutionService = new EvolutionService();

// export const evolutionRouter = t.router({
//   pingRequest: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//     evolutionService.pingRequest(input);
//   }),

//   pongRequest: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//     evolutionService.pongRequest(input);
//   }),

//   unbanClient: t.procedure
//     .input(z.object({ data: z.object({ target: z.string() }), id: z.string() }))
//     .mutation(({ input, ctx }) => {
//       evolutionService.unbanClient(ctx.app, input);
//     }),

//   mod: t.procedure
//     .input(
//       z.object({
//         data: z.object({
//           body: z.object({ signature: z.object({ address: z.string() }) }),
//           params: z.object({ method: z.string() }),
//         }),
//       })
//     )
//     .mutation(({ input, ctx }) => {
//       evolutionService.mod(ctx.app, input);
//     }),

//   banClient: t.procedure
//     .input(
//       z.object({
//         data: z.object({ target: z.string(), reason: z.string(), until: z.number().optional() }),
//         id: z.string(),
//       })
//     )
//     .mutation(({ input, ctx }) => {
//       evolutionService.banClient(ctx.app, input);
//     }),

//   getCharacter: t.procedure
//     .input(z.object({ data: z.object({ address: z.string() }), id: z.string() }))
//     .mutation(({ input, ctx }) => {
//       evolutionService.getCharacter(ctx.app, input);
//     }),

//   saveRound: t.procedure.input(z.any()).mutation(({ input, ctx }) => {
//     evolutionService.saveRound(ctx.app, input);
//   }),

//   // Add more procedures as necessary
// });

// // Add the router type export if necessary
// export type EvolutionRouter = typeof evolutionRouter;

// const shortId = require('shortid');

// let CharacterCache = {};
// const ioCallbacks = {};

// async function rsCall(app, realm, name, data = undefined) {
//   try {
//     const id = shortId();
//     const signature =
//       data !== undefined && data !== null
//         ? await getSignedRequest(
//             app.web3,
//             app.secrets.find((s) => s.id === 'evolution-signer'),
//             data
//           )
//         : null;

//     return new Promise(async (resolve) => {
//       ioCallbacks[id] = {};

//       ioCallbacks[id].resolve = resolve;

//       ioCallbacks[id].reqTimeout = setTimeout(function () {
//         log('Request timeout');
//         resolve({ status: 0, message: 'Request timeout' });

//         delete ioCallbacks[id];
//       }, 60 * 1000);

//       if (!realm.client.socket?.connected) {
//         log('Not connected to realm server: ' + realm.key);
//         return;
//       }

//       log('Emit Realm', realm.key, name, { id, data });

//       realm.client.socket.emit(name, { id, signature, data });
//     });
//   } catch (e) {
//     log(e);
//   }
// }

// function setRealmOffline(realm) {
//   if (realm.status === 'inactive' || realm.updateMode === 'manual') return;

//   realm.status = 'offline';
//   realm.playerCount = 0;
//   realm.speculatorCount = 0;
//   realm.rewardItemAmount = 0;
//   realm.rewardWinnerAmount = 0;
// }

// async function setRealmConfig(app, realm) {
//   const configRes = (await rsCall(app, app.games.evolution.realms[realm.key], 'SetConfigRequest', {
//     config: { ...app.db.evolution.config, roundId: realm.roundId },
//   })) as any;

//   if (configRes.status !== 1) {
//     setRealmOffline(realm);
//     return;
//   }
// }

// async function updateRealm(app, realm) {
//   try {
//     realm.games = [];

//     const infoRes = (await rsCall(app, app.games.evolution.realms[realm.key], 'InfoRequest', { config: {} })) as any; // roundId: realm.roundId

//     if (!infoRes || infoRes.status !== 1) {
//       setRealmOffline(realm);
//       return;
//     }

//     log('infoRes', infoRes.data.games);

//     const { data } = infoRes;

//     realm.playerCount = data.playerCount;
//     realm.speculatorCount = data.speculatorCount;
//     realm.version = data.version;

//     realm.games = data.games.map((game) => ({
//       id: game.id,
//       playerCount: game.playerCount,
//       speculatorCount: game.speculatorCount,
//       version: game.version,
//       rewardItemAmount: game.rewardItemAmount,
//       rewardWinnerAmount: game.rewardWinnerAmount,
//       gameMode: game.gameMode,
//       connectedPlayers: game.connectedPlayers,
//       roundId: game.round.id,
//       roundStartedAt: game.round.startedAt,
//       timeLeft: ~~(5 * 60 - (new Date().getTime() / 1000 - game.round.startedAt)),
//       timeLeftText: fancyTimeFormat(5 * 60 - (new Date().getTime() / 1000 - game.round.startedAt)),
//       endpoint: (function () {
//         const url = new URL((process.env.ARKEN_ENV === 'local' ? 'http://' : 'https://') + realm.endpoint);
//         url.port = game.port;
//         return url.toString();
//       })()
//         .replace('http://', '')
//         .replace('https://', '')
//         .replace('/', ''),
//     }));

//     delete realm.timeLeftFancy;

//     realm.status = 'online';
//   } catch (e) {
//     log('Error', e);

//     setRealmOffline(realm);
//   }

//   // log('Updated server', server)

//   return realm;
// }

// async function updateRealms(app) {
//   try {
//     log('Updating Evolution realms');

//     let playerCount = 0;

//     for (const realm of app.db.evolution.realms) {
//       // if (realm.key.indexOf('ptr') !== -1 || realm.key.indexOf('tournament') !== -1) continue
//       if (realm.status === 'inactive' || realm.updateMode === 'manual') continue;

//       await updateRealm(app, realm);

//       const hist = jetpack.read(path.resolve(`./db/evolution/${realm.key}/historical.json`), 'json') || {};

//       if (!hist.playerCount) hist.playerCount = [];

//       const oldTime = new Date(hist.playerCount[hist.playerCount.length - 1]?.[0] || 0).getTime();
//       const newTime = new Date().getTime();
//       const diff = newTime - oldTime;
//       if (diff / (1000 * 60 * 60 * 1) > 1) {
//         hist.playerCount.push([newTime, realm.playerCount]);
//       }

//       jetpack.write(path.resolve(`./db/evolution/${realm.key}/historical.json`), JSON.stringify(hist), {
//         atomic: true,
//         jsonIndent: 0,
//       });

//       playerCount += realm.playerCount;

//       log(`Realm ${realm.key} updated`, realm);
//     }

//     app.db.evolution.playerCount = playerCount;

//     for (const server of app.db.evolution.servers) {
//       if (server.status === 'inactive' || server.updateMode === 'manual') continue;
//       // if (server.key.indexOf('tournament') !== -1) continue

//       server.status = 'offline';
//       server.playerCount = 0;
//     }

//     const evolutionServers = app.db.evolution.realms
//       .filter((r) => r.status !== 'inactive')
//       .map((r) =>
//         r.games.length > 0
//           ? {
//               ...(app.db.evolution.servers.find((e) => e.key === r.key) || {}),
//               ...r.games[0],
//               key: r.key,
//               name: r.name,
//               status: r.status,
//               regionId: r.regionId,
//             }
//           : {}
//       );

//     for (const evolutionServer of evolutionServers) {
//       const server = app.db.evolution.servers.find((s) => s.key === evolutionServer.key);

//       if (!server) {
//         if (evolutionServer.key) {
//           app.db.evolution.servers.push(evolutionServer);
//         }
//         continue;
//       }

//       if (evolutionServer.status === 'inactive' || evolutionServer.updateMode === 'manual') continue;

//       server.status = evolutionServer.status;
//       server.version = evolutionServer.version;
//       server.rewardItemAmount = evolutionServer.rewardItemAmount;
//       server.rewardWinnerAmount = evolutionServer.rewardWinnerAmount;
//       server.gameMode = evolutionServer.gameMode;
//       server.roundId = evolutionServer.roundId;
//       server.roundStartedAt = evolutionServer.roundStartedAt;
//       server.roundStartedDate = evolutionServer.roundStartedDate;
//       server.timeLeft = evolutionServer.timeLeft;
//       server.timeLeftText = evolutionServer.timeLeftText;
//       server.playerCount = evolutionServer.playerCount;
//       server.speculatorCount = evolutionServer.speculatorCount;
//       server.endpoint = evolutionServer.endpoint;
//     }

//     jetpack.write(path.resolve('./db/evolution/realms.json'), JSON.stringify(app.db.evolution.realms), {
//       atomic: true,
//       jsonIndent: 0,
//     });

//     // Update old servers file
//     jetpack.write(path.resolve('./db/evolution/servers.json'), JSON.stringify(app.db.evolution.servers), {
//       atomic: true,
//       jsonIndent: 0,
//     });

//     log('Realm and server info generated');

//     // Update overall historics
//     const hist = jetpack.read(path.resolve(`./db/evolution/historical.json`), 'json') || {};

//     if (!hist.playerCount) hist.playerCount = [];

//     const oldTime = new Date(hist.playerCount[hist.playerCount.length - 1]?.[0] || 0).getTime();
//     const newTime = new Date().getTime();
//     const diff = newTime - oldTime;
//     if (diff / (1000 * 60 * 60 * 1) > 1) {
//       hist.playerCount.push([newTime, playerCount]);
//     }

//     jetpack.write(path.resolve(`./db/evolution/historical.json`), JSON.stringify(hist), {
//       atomic: true,
//       jsonIndent: 0,
//     });
//   } catch (e) {
//     log('Error', e);
//   }
// }

// function cleanupClient(client) {
//   log('Cleaning up', client.key);

//   client.socket?.close();
//   client.isConnected = false;
//   client.isConnecting = false;
//   client.isAuthed = false;

//   clearTimeout(client.timeout);
//   clearTimeout(client.pingReplyTimeout);
//   clearTimeout(client.pingerTimeout);
// }

// function disconnectClient(client) {
//   log('Disconnecting client', client.key);

//   cleanupClient(client);
// }

// async function getCharacter(app, address) {
//   const equipment = await app.barracks.getPlayerEquipment(app, address);
//   const meta = await app.barracks.getMetaFromEquipment(app, equipment);

//   // if (address === '0x1a367CA7bD311F279F1dfAfF1e60c4d797Faa6eb') {
//   //   meta[1030] = 100
//   // }

//   let error;
//   if (meta[1030] > 100) error = `Problem with EvolutionMovementSpeedIncrease: ${address} ${meta[1030]}`;
//   if (meta[1102] > 100) error = `Problem with DeathPenaltyAvoid: ${address} ${meta[1102]}`;
//   if (meta[1104] > 100) error = `Problem with EnergyDecayDecrease: ${address} ${meta[1104]}`;
//   if (meta[1105] > 100) error = `Problem with EnergyDecayIncrease: ${address} ${meta[1105]}`;
//   if (meta[1150] > 100) error = `Problem with WinRewardsIncrease: ${address} ${meta[1150]}`;
//   if (meta[1160] > 100) error = `Problem with WinRewardsDecrease: ${address} ${meta[1160]}`;
//   if (meta[1222] > 100) error = `Problem with IncreaseMovementSpeedOnKill: ${address} ${meta[1222]}`;
//   if (meta[1223] > 100) error = `Problem with EvolveMovementBurst: ${address} ${meta[1223]}`;
//   if (meta[1164] > 100) error = `Problem with DoublePickupChance: ${address} ${meta[1164]}`;
//   if (meta[1219] > 100) error = `Problem with IncreaseHealthOnKill: ${address} ${meta[1219]}`;
//   if (meta[1117] > 100) error = `Problem with SpriteFuelIncrease: ${address} ${meta[1117]}`;
//   if (meta[1118] > 100) error = `Problem with SpriteFuelDecrease: ${address} ${meta[1118]}`;

//   if (error) {
//     log('Error with character gear:', error);
//     process.exit(6);
//   }

//   return {
//     equipment,
//     meta,
//   };
// }

// const runes = [
//   'el',
//   'eld',
//   'tir',
//   'nef',
//   'ith',
//   'tal',
//   'ral',
//   'ort',
//   'thul',
//   'amn',
//   'sol',
//   'shael',
//   'dol',
//   'hel',
//   'io',
//   'lum',
//   'ko',
//   'fal',
//   'lem',
//   'pul',
//   'um',
//   'mal',
//   'ist',
//   'gul',
//   'vex',
//   'ohm',
//   'lo',
//   'sur',
//   'ber',
//   'jah',
//   'cham',
//   'zod',
// ];

// export async function connectRealm(app, realm) {
//   if (realm.status === 'inactive' || realm.ignore) return;

//   log('Connecting to realm', realm);
//   const { client } = app.games.evolution.realms[realm.key];

//   if (client.isConnected || client.socket?.connected) {
//     log(`Realm ${realm.key} already connected, disconnecting`);
//     cleanupClient(client);
//   }

//   client.isConnecting = true;
//   client.socket = getClientSocket((process.env.ARKEN_ENV === 'local' ? 'http://' : 'https://') + realm.endpoint); // TODO: RS should be running things

//   client.socket.on('connect', async () => {
//     try {
//       client.isConnected = true;

//       log('Connected: ' + realm.key);

//       const res = (await rsCall(app, app.games.evolution.realms[realm.key], 'AuthRequest', 'myverysexykey')) as any;

//       if (res.status === 1) {
//         client.isAuthed = true;

//         clearTimeout(client.connectTimeout);

//         await setRealmConfig(app, realm);
//         await updateRealm(app, realm);
//       }

//       client.isConnecting = false;

//       const pinger = async () => {
//         try {
//           clearTimeout(client.pingReplyTimeout);

//           client.pingReplyTimeout = setTimeout(function () {
//             log(`Realm ${realm.key} didnt respond in time, disconnecting`);
//             cleanupClient(client);
//           }, 70 * 1000);

//           await rsCall(app, app.games.evolution.realms[realm.key], 'PingRequest');

//           clearTimeout(client.pingReplyTimeout);

//           if (!client.isConnected) return;

//           client.pingerTimeout = setTimeout(async () => await pinger(), 15 * 1000);
//         } catch (e) {
//           log(e);
//         }
//       };

//       clearTimeout(client.pingerTimeout);
//       clearTimeout(client.pingReplyTimeout);

//       client.pingerTimeout = setTimeout(async () => await pinger(), 15 * 1000);
//     } catch (e) {
//       log('Error', e);
//       log(`Disconnecting ${realm.key} due to error`);
//       cleanupClient(client);
//     }
//   });

//   client.socket.on('disconnect', () => {
//     log('Disconnected: ' + realm.key);
//     cleanupClient(client);
//   });

//   // client.socket.on('banClient', async function (req) {
//   //   console.log(req)
//   //   try {
//   //     log('Ban', realm.key, req)

//   //     if (await isValidRequest(app.web3, req) && app.db.evolution.modList.includes(req.signature.address)) {
//   //       app.db.addBanList('evolution', req.data.target)

//   //       app.db.saveBanList()

//   //       app.realm.emitAll('BanUserRequest', {
//   //         signature: await getSignedRequest(app.web3, app.secrets, md5(JSON.stringify({ target: req.data.target }))),
//   //         data: {
//   //           target: req.data.target
//   //         }
//   //       })

//   //       client.socket.emit('BanUserResponse', {
//   //         id: req.id,
//   //         data: { status: 1 }
//   //       })
//   //     } else {
//   //       client.socket.emit('BanUserResponse', {
//   //         id: req.id,
//   //         data: { status: 0, message: 'Invalid signature' }
//   //       })
//   //     }
//   //   } catch (e) {
//   //     log('Error', e)

//   //     client.socket.emit('BanUserResponse', {
//   //       id: req.id,
//   //       data: { status: 0, message: e }
//   //     })
//   //   }
//   // })

//   client.socket.on('PingRequest', function (msg) {
//     log('PingRequest', realm.key, msg);

//     client.socket.emit('PingResponse');
//   });

//   client.socket.on('PongRequest', function (msg) {
//     log('PongRequest', realm.key, msg);

//     client.socket.emit('PongResponse');
//   });

//   client.socket.on('unbanClient', async function (req) {
//     try {
//       log('Ban', realm.key, req);

//       const user = await app.db.loadUser(req.data.target);

//       delete user.isBanned;
//       delete user.bannedReason;

//       await app.db.saveUser(user);

//       app.db.removeBanList('evolution', req.data.target);
//       app.db.saveBanList();

//       app.realm.emitAll('UnbanUserRequest', {
//         data: {
//           target: req.data.target,
//         },
//       });

//       client.socket.emit('UnbanClientResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('UnbanClientResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });
//     }
//   });

//   client.socket.on('mod', async function (req) {
//     try {
//       log('mod', realm.key, req);

//       const user = await app.db.loadUser(req.data.body.signature.address);

//       app.api.emitAll('playerAction', {
//         key: 'moderator-action',
//         createdAt: new Date().getTime() / 1000,
//         address: user.address,
//         username: user.username,
//         method: req.data.params.method,
//         realmKey: realm.key,
//         message: `${user.username} called ${req.data.params.method}`,
//       });

//       client.socket.emit('ModResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('ModResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });
//     }
//   });

//   client.socket.on('banClient', async function (req) {
//     try {
//       log('banClient', realm.key, req);

//       const user = await app.db.loadUser(req.data.target);

//       user.isBanned = true;
//       user.bannedReason = req.data.reason;
//       user.bannedUntil = req.data.until ? parseInt(req.data.until) : new Date().getTime() + 100 * 365 * 24 * 60 * 60; // 100 year ban by default

//       await app.db.saveUser(user);

//       app.db.addBanList('evolution', { address: req.data.target, reason: req.data.reason, until: req.data.until });
//       app.db.saveBanList();

//       app.realm.emitAll('BanUserRequest', {
//         data: {
//           target: req.data.target,
//           createdAt: new Date().getTime(),
//           bannedUntil: user.bannedUntil,
//           bannedReason: user.bannedReason,
//         },
//       });

//       client.socket.emit('BanPlayerResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('BanPlayerResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });
//     }
//   });

//   client.socket.on('reportClient', function (msg) {
//     log('reportClient', realm.key, msg);

//     const { currentGamePlayers, currentPlayer, reportedPlayer } = msg;

//     if (currentPlayer.name.indexOf('Guest') !== -1 || currentPlayer.name.indexOf('Unknown') !== -1) return; // No guest reports

//     if (!app.db.evolution.reportList[reportedPlayer.address]) app.db.evolution.reportList[reportedPlayer.address] = [];

//     if (!app.db.evolution.reportList[reportedPlayer.address].includes(currentPlayer.address))
//       app.db.evolution.reportList[reportedPlayer.address].push(currentPlayer.address);

//     // if (app.db.evolution.reportList[reportedPlayer.address].length >= 6) {
//     //   app.db.evolution.banList.push(reportedPlayer.address)

//     //   disconnectPlayer(reportedPlayer)
//     //   // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
//     //   return
//     // }

//     // if (currentGamePlayers.length >= 4) {
//     //   const reportsFromCurrentGamePlayers = app.db.evolution.reportList[reportedPlayer.address].filter(function(n) {
//     //     return currentGamePlayers.indexOf(n) !== -1;
//     //   })

//     //   if (reportsFromCurrentGamePlayers.length >= currentGamePlayers.length / 3) {
//     //     app.db.evolution.banList.push(reportedPlayer.address)

//     //     disconnectPlayer(reportedPlayer)
//     //     // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
//     //     return
//     //   }
//     // }

//     // Relay the report to connected realm servers
//   });

//   client.socket.on('GetCharacterRequest', async function (req) {
//     log('GetCharacterRequest', req);

//     try {
//       let character = CharacterCache[req.data.address];

//       if (!character) {
//         // if (req.data.address === '0x1a367CA7bD311F279F1dfAfF1e60c4d797Faa6eb') {
//         //   meta[1030] = 100
//         // }

//         // if (req.data.address === '0x6f756AFaC862A2486f4c1C96b46E00A98a70bEA2') {
//         //   meta[1030] = 100
//         // }

//         character = await getCharacter(app, req.data.address);

//         CharacterCache[req.data.address] = character;
//       }

//       log('GetCharacterResponse', character);

//       client.socket.emit('GetCharacterResponse', {
//         id: req.id,
//         data: { status: 1, character },
//       });
//     } catch (e) {
//       client.socket.emit('GetCharacterResponse', {
//         id: req.id,
//         data: { status: 0, message: 'Error' },
//       });
//     }
//   });

//   client.socket.on('SaveRoundRequest', async function (req) {
//     // Iterate the items found, add to user.evolution.rewards
//     // Itereate the runes found, add to user.evolution.runes
//     // Iterate the winners, add to the user.evolution.runes
//     // Add winning stats to user.evolution
//     try {
//       log('SaveRoundRequest', realm.key, req);

//       if (!(await isValidRequest(app.web3, req)) && app.db.evolution.modList.includes(req.signature.address)) {
//         log('Round invalid');

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 0, message: 'Invalid signature' },
//         });
//         return;
//       }

//       if (!req.data.lastClients) {
//         log('Round no clients');

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 0, message: 'Error processing' },
//         });
//         return;
//       }

//       if (req.data.round.winners.length === 0) {
//         realm.roundId += 1;

//         log('Round skipped');

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 1 },
//         });
//         return;
//       }

//       if (req.data.rewardWinnerAmount > app.db.evolution.config.rewardWinnerAmountMax) {
//         log(req.data.rewardWinnerAmount, app.db.evolution.config.rewardWinnerAmountMax);
//         throw new Error('Big problem with reward amount');
//       }

//       let totalLegitPlayers = 0;

//       for (const client of req.data.lastClients) {
//         if (client.name.indexOf('Guest') !== -1 || client.name.indexOf('Unknown') !== -1) continue;

//         if (
//           (client.powerups > 100 && client.kills > 1) ||
//           (client.evolves > 20 && client.powerups > 200) ||
//           (client.rewards > 3 && client.powerups > 200) ||
//           client.evolves > 100 ||
//           client.points > 1000
//         ) {
//           totalLegitPlayers += 1;
//         }
//       }

//       if (totalLegitPlayers === 0) {
//         totalLegitPlayers = 1;
//       }

//       if (req.data.rewardWinnerAmount > app.db.evolution.config.rewardWinnerAmountPerLegitPlayer * totalLegitPlayers) {
//         log(
//           req.data.rewardWinnerAmount,
//           app.db.evolution.config.rewardWinnerAmountPerLegitPlayer,
//           totalLegitPlayers,
//           req.data.lastClients.length,
//           JSON.stringify(req.data.lastClients)
//         );
//         throw new Error('Big problem with reward amount 2');
//       }

//       if (req.data.roundId > realm.roundId) {
//         realm.roundId = req.data.roundId;
//       } else if (req.data.roundId < realm.roundId) {
//         const err = `Round id too low (realm.roundId = ${realm.roundId})`;

//         log(err);

//         client.socket.emit('SaveRoundResponse', {
//           id: req.id,
//           data: { status: 0, message: err },
//         });

//         await setRealmConfig(app, realm);

//         return;
//       } else {
//         realm.roundId += 1;
//       }

//       // if (req.data.roundId > realm.roundId) {
//       //   client.socket.emit('SaveRoundResponse', {
//       //     id: req.id,
//       //     data: { status: 0, message: 'Invalid round id' }
//       //   })
//       //   return
//       // }

//       const rewardWinnerMap = {
//         0: Math.round(req.data.rewardWinnerAmount * 1 * 1000) / 1000,
//         1: Math.round(req.data.rewardWinnerAmount * 0.25 * 1000) / 1000,
//         2: Math.round(req.data.rewardWinnerAmount * 0.15 * 1000) / 1000,
//         3: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         4: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         5: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         6: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         7: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         8: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//         9: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       };

//       // const users = []

//       // Iterate the winners, determine the winning amounts, validate, save to user rewards
//       // Iterate all players and save their log / stats

//       const removeDupes2 = (list) => {
//         const seen = {};
//         return list.filter(function (item) {
//           // console.log(item)
//           const k1 = item.address;
//           const exists = seen.hasOwnProperty(k1);

//           if (!exists) {
//             seen[k1] = true;
//           }

//           return !exists;
//         });
//       };

//       req.data.round.players = removeDupes2(req.data.round.players); // [...new Set(req.data.round.players.map(obj => obj.key)) ] //

//       const winners = req.data.round.winners.slice(0, 10);

//       const rewardTweaks = {};

//       for (const winner of winners) {
//         let character = CharacterCache[winner.address];

//         if (!character) {
//           console.log('Getting char data');
//           character = await getCharacter(app, winner.address);
//           console.log('Got char data');

//           CharacterCache[winner.address] = character;
//         }

//         // if (character?.meta?.[1173] > 0) {
//         //   const portion = 0.05

//         //   for (const kill of winner.log.kills) {
//         //     const target = req.data.round.players.filter(p => p.hash === kill)

//         //     if (target?.address) {
//         //       if (!rewardTweaks[target.address]) rewardTweaks[target.address] = 0
//         //       if (!rewardTweaks[winner.address]) rewardTweaks[winner.address] = 0

//         //       rewardTweaks[target.address] -= portion
//         //       rewardTweaks[winner.address] += portion
//         //     }
//         //   }
//         // }
//       }

//       for (const player of req.data.round.players) {
//         console.log('Loading user');
//         const user = await app.db.loadUser(player.address);
//         console.log('Loaded user');
//         const now = new Date().getTime() / 1000;

//         if (user.lastGamePlayed > now - 4 * 60) continue; // Make sure this player isn't in 2 games or somehow getting double rewards

//         if (typeof user.username === 'object' || !user.username) user.username = await getUsername(user.address);

//         if (!user.username) continue; // Make sure cant earn without a character

//         app.db.setUserActive(user);

//         if (player.killStreak >= 10) {
//           app.api.emitAll('PlayerAction', {
//             key: 'evolution1-killstreak',
//             createdAt: new Date().getTime() / 1000,
//             address: user.address,
//             username: user.username,
//             message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
//           });
//           app.notices.add('evolution1-killstreak', {
//             key: 'evolution1-killstreak',
//             address: user.address,
//             username: user.username,
//             message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
//           });
//         }

//         for (const pickup of player.pickups) {
//           if (pickup.type === 'rune') {
//             // TODO: change to authoritative
//             if (
//               pickup.quantity >
//               req.data.round.players.length * app.db.evolution.config.rewardItemAmountPerLegitPlayer * 2
//             ) {
//               log(
//                 pickup.quantity,
//                 app.db.evolution.config.rewardItemAmountPerLegitPlayer,
//                 req.data.round.players.length,
//                 JSON.stringify(req.data.round.players)
//               );
//               throw new Error('Big problem with item reward amount');
//             }

//             if (pickup.quantity > req.data.round.players.length * app.db.evolution.config.rewardItemAmountMax) {
//               log(pickup.quantity, req.data.round.players.length, app.db.evolution.config.rewardItemAmountMax);
//               throw new Error('Big problem with item reward amount 2');
//             }

//             const runeSymbol = pickup.rewardItemName.toLowerCase();

//             if (!runes.includes(runeSymbol)) {
//               continue;
//             }

//             if (!user.rewards.runes[runeSymbol] || user.rewards.runes[runeSymbol] < 0.000000001) {
//               user.rewards.runes[runeSymbol] = 0;
//             }

//             user.rewards.runes[runeSymbol] += pickup.quantity;

//             if (!user.lifetimeRewards.runes[runeSymbol] || user.lifetimeRewards.runes[runeSymbol] < 0.000000001) {
//               user.lifetimeRewards.runes[runeSymbol] = 0;
//             }

//             user.lifetimeRewards.runes[runeSymbol] += pickup.quantity;

//             app.db.evolution.config.itemRewards.runes[runeSymbol.toLowerCase()] -= pickup.quantity;

//             app.db.oracle.outflow.evolutionRewards.tokens.week[runeSymbol.toLowerCase()] += pickup.quantity;
//           } else {
//             user.rewards.items[pickup.id] = {
//               name: pickup.name,
//               rarity: pickup.rarity,
//               quantity: pickup.quantity,
//             };

//             user.lifetimeRewards.items[pickup.id] = {
//               name: pickup.name,
//               rarity: pickup.rarity,
//               quantity: pickup.quantity,
//             };
//           }

//           // user.rewardTracking.push(req.tracking)
//         }

//         user.lastGamePlayed = now;

//         if (!user.evolution.hashes) user.evolution.hashes = [];
//         if (!user.evolution.hashes.includes(player.hash)) user.evolution.hashes.push(player.hash);

//         user.evolution.hashes = user.evolution.hashes.filter(function (item, pos) {
//           return user.evolution.hashes.indexOf(item) === pos;
//         });

//         // users.push(user)

//         if (!app.games.evolution.realms[realm.key].leaderboard.names)
//           app.games.evolution.realms[realm.key].leaderboard.names = {};

//         app.games.evolution.realms[realm.key].leaderboard.names[user.address] = user.username;

//         if (!app.games.evolution.realms[realm.key].leaderboard.raw.points[user.address]) {
//           // 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency'
//           app.games.evolution.realms[realm.key].leaderboard.raw.monetary[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.wins[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.rounds[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.kills[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.points[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.deaths[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.powerups[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.evolves[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.rewards[user.address] = 0;
//           app.games.evolution.realms[realm.key].leaderboard.raw.pickups[user.address] = 0;
//         }

//         // Update leaderboard stats
//         app.games.evolution.realms[realm.key].leaderboard.raw.rounds[user.address] += 1;
//         app.games.evolution.realms[realm.key].leaderboard.raw.kills[user.address] += player.kills;
//         app.games.evolution.realms[realm.key].leaderboard.raw.points[user.address] += player.points;
//         app.games.evolution.realms[realm.key].leaderboard.raw.deaths[user.address] += player.deaths;
//         app.games.evolution.realms[realm.key].leaderboard.raw.powerups[user.address] += player.powerups;
//         app.games.evolution.realms[realm.key].leaderboard.raw.evolves[user.address] += player.evolves;
//         app.games.evolution.realms[realm.key].leaderboard.raw.rewards[user.address] += player.rewards;
//         app.games.evolution.realms[realm.key].leaderboard.raw.pickups[user.address] += player.pickups.length;

//         if (!app.games.evolution.global.leaderboard.names) app.games.evolution.global.leaderboard.names = {};

//         app.games.evolution.global.leaderboard.names[user.address] = user.username;

//         if (!app.games.evolution.global.leaderboard.raw.points[user.address]) {
//           // 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency'
//           app.games.evolution.global.leaderboard.raw.monetary[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.wins[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.rounds[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.kills[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.points[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.deaths[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.powerups[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.evolves[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.rewards[user.address] = 0;
//           app.games.evolution.global.leaderboard.raw.pickups[user.address] = 0;
//         }

//         // Update leaderboard stats
//         app.games.evolution.global.leaderboard.raw.rounds[user.address] += 1;
//         app.games.evolution.global.leaderboard.raw.kills[user.address] += player.kills;
//         app.games.evolution.global.leaderboard.raw.points[user.address] += player.points;
//         app.games.evolution.global.leaderboard.raw.deaths[user.address] += player.deaths;
//         app.games.evolution.global.leaderboard.raw.powerups[user.address] += player.powerups;
//         app.games.evolution.global.leaderboard.raw.evolves[user.address] += player.evolves;
//         app.games.evolution.global.leaderboard.raw.rewards[user.address] += player.rewards;
//         app.games.evolution.global.leaderboard.raw.pickups[user.address] += player.pickups.length;

//         if (winners.find((winner) => winner.address === player.address)) {
//           const index = winners.findIndex((winner) => winner.address === player.address);
//           // const player = req.data.round.winners[index]
//           // const user = users.find(u => u.address === player.address)

//           // if (!user) continue // He wasn't valid
//           if (user.username) {
//             // Make sure cant earn without a character
//             // if (req.data.round.winners[0].address === player.address) {
//             let character = CharacterCache[player.address];

//             if (!character) {
//               console.log('Getting char data');
//               character = await getCharacter(app, player.address);
//               console.log('Got char data');

//               CharacterCache[player.address] = character;
//             }

//             const WinRewardsIncrease = character?.meta?.[1150] || 0;
//             const WinRewardsDecrease = character?.meta?.[1160] || 0;

//             console.log('bbbb', rewardWinnerMap[index]);
//             const rewardMultiplier = 1 + (WinRewardsIncrease - WinRewardsDecrease) / 100;

//             if (rewardMultiplier > 2 || rewardMultiplier < 0) {
//               log(
//                 'Error with reward multiplier.. bad things happened: ',
//                 rewardMultiplier,
//                 rewardMultiplier,
//                 WinRewardsDecrease
//               );
//               process.exit(5);
//             }

//             rewardWinnerMap[index] *= rewardMultiplier;
//             console.log('cccc', rewardWinnerMap[index]);
//             // }

//             if (!user.rewards.runes['zod']) {
//               user.rewards.runes['zod'] = 0;
//             }

//             if (user.rewards.runes['zod'] < 0) {
//               user.rewards.runes['zod'] = 0;
//             }

//             user.rewards.runes['zod'] += rewardWinnerMap[index];

//             if (!user.lifetimeRewards.runes['zod']) {
//               user.lifetimeRewards.runes['zod'] = 0;
//             }

//             user.lifetimeRewards.runes['zod'] += rewardWinnerMap[index];

//             app.db.oracle.outflow.evolutionRewards.tokens.week['zod'] += rewardWinnerMap[index];

//             app.games.evolution.global.leaderboard.raw.monetary[user.address] += rewardWinnerMap[index];

//             app.games.evolution.realms[realm.key].leaderboard.raw.monetary[user.address] += rewardWinnerMap[index];

//             app.api.emitAll('PlayerAction', {
//               key: 'evolution1-winner',
//               createdAt: new Date().getTime() / 1000,
//               address: user.address,
//               username: user.username,
//               realmKey: realm.key,
//               placement: index + 1,
//               message: `${user.username} placed #${index + 1} for ${rewardWinnerMap[index].toFixed(
//                 4
//               )} ZOD in Evolution`,
//             });

//             if (rewardWinnerMap[index] > 0.1) {
//               app.notices.add('evolution1-winner', {
//                 key: 'evolution1-winner',
//                 address: user.address,
//                 username: user.username,
//                 realmKey: realm.key,
//                 placement: index + 1,
//                 message: `${user.username} won ${rewardWinnerMap[index].toFixed(4)} ZOD in Evolution`,
//               });
//             }

//             if (req.data.round.winners[0].address === player.address) {
//               if (!app.games.evolution.realms[realm.key].leaderboard.raw)
//                 app.games.evolution.realms[realm.key].leaderboard.raw = {};
//               if (!app.games.evolution.realms[realm.key].leaderboard.raw.wins)
//                 app.games.evolution.realms[realm.key].leaderboard.raw.wins = 0;

//               app.games.evolution.realms[realm.key].leaderboard.raw.wins[user.address] += 1;

//               if (!app.games.evolution.global.leaderboard.raw) app.games.evolution.global.leaderboard.raw = {};
//               if (!app.games.evolution.global.leaderboard.raw.wins) app.games.evolution.global.leaderboard.raw.wins = 0;

//               app.games.evolution.global.leaderboard.raw.wins[user.address] += 1;
//             }
//           }
//         }

//         await app.db.saveUser(user);
//       }

//       log('Round saved');

//       client.socket.emit('SaveRoundResponse', {
//         id: req.id,
//         data: { status: 1 },
//       });
//     } catch (e) {
//       log('Error', e);

//       client.socket.emit('SaveRoundResponse', {
//         id: req.id,
//         data: { status: 0, message: e },
//       });

//       disconnectClient(client);
//     }
//   });

//   // {
//   //   id: 'vLgqLC_oa',
//   //   signature: {
//   //     address: '0xDfA8f768d82D719DC68E12B199090bDc3691fFc7',
//   //     hash: '0xaa426a32a8f0dae65f160e52d3c0004582e796942894c199255298a05b5f40a473b4257e367e5c285a1eeaf9a8f69b14b8fc273377ab4c79e256962a3434978a1c',
//   //     data: '96a190dbd01b86b08d6feafc6444481b'
//   //   },
//   //   data: {
//   //     id: '7mrEmDnd6',
//   //     data: {
//   //       id: 1,
//   //       startedAt: 1644133312,
//   //       leaders: [Array],
//   //       players: [Array]
//   //     }
//   //   }
//   // }
//   // {
//   //   id: 2,
//   //   startedAt: 1644135785,
//   //   leaders: [],
//   //   players: [
//   //     {
//   //       name: 'Sdadasd',
//   //       id: 'ovEbbscHo3D7aWVBAAAD',
//   //       avatar: 0,
//   //       network: 'bsc',
//   //       address: '0x191727d22f2693100acef8e48F8FeaEaa06d30b1',
//   //       device: 'desktop',
//   //       position: [Object],
//   //       target: [Object],
//   //       clientPosition: [Object],
//   //       clientTarget: [Object],
//   //       rotation: null,
//   //       xp: 0,
//   //       latency: 12627.5,
//   //       kills: 0,
//   //       deaths: 0,
//   //       points: 0,
//   //       evolves: 0,
//   //       powerups: 0,
//   //       rewards: 0,
//   //       orbs: 0,
//   //       rewardHistory: [],
//   //       isMod: false,
//   //       isBanned: false,
//   //       isMasterClient: false,
//   //       isDisconnected: true,
//   //       isDead: true,
//   //       isJoining: false,
//   //       isSpectating: false,
//   //       isStuck: false,
//   //       isInvincible: false,
//   //       isPhased: false,
//   //       overrideSpeed: 0.5,
//   //       overrideCameraSize: null,
//   //       cameraSize: 3,
//   //       speed: 0.5,
//   //       joinedAt: 0,
//   //       hash: '',
//   //       lastReportedTime: 1644135787011,
//   //       lastUpdate: 1644135787016,
//   //       gameMode: 'Deathmatch',
//   //       phasedUntil: 1644135814266,
//   //       log: [Object],
//   //       startedRoundAt: 1644135785
//   //     }
//   //   ]
//   // }

//   client.socket.onAny(function (eventName, res) {
//     // log('Event All', eventName, res)
//     if (!res || !res.id) return;
//     // console.log(eventName, res)
//     if (ioCallbacks[res.id]) {
//       log('Callback', eventName, res);

//       clearTimeout(ioCallbacks[res.id].reqTimeout);

//       ioCallbacks[res.id].resolve(res.data);

//       delete ioCallbacks[res.id];
//     }
//   });

//   client.socket.connect();

//   client.connectTimeout = setTimeout(function () {
//     if (!client.isAuthed) {
//       log(`Couldnt connect/authorize ${realm.key} on ${realm.endpoint}`);
//       disconnectClient(client);
//     }
//   }, 60 * 1000);
// }

// export async function connectRealms(app) {
//   log('Connecting to Evolution realms');

//   try {
//     for (const realm of app.db.evolution.realms) {
//       if (!app.games.evolution.realms[realm.key]) {
//         app.games.evolution.realms[realm.key] = {};
//         for (const key in Object.keys(realm)) {
//           app.games.evolution.realms[realm.key][key] = realm[key];
//         }
//       }

//       // if (!app.games.evolution.realms[realm.key].leaderboard) app.games.evolution.realms[realm.key].leaderboard = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw) app.games.evolution.realms[realm.key].leaderboard.raw = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.wins) app.games.evolution.realms[realm.key].leaderboard.raw.wins = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.rounds) app.games.evolution.realms[realm.key].leaderboard.raw.rounds = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.kills) app.games.evolution.realms[realm.key].leaderboard.raw.kills = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.points) app.games.evolution.realms[realm.key].leaderboard.raw.points = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.deaths) app.games.evolution.realms[realm.key].leaderboard.raw.deaths = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.powerups) app.games.evolution.realms[realm.key].leaderboard.raw.powerups = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.evolves) app.games.evolution.realms[realm.key].leaderboard.raw.evolves = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.rewards) app.games.evolution.realms[realm.key].leaderboard.raw.rewards = {}
//       // if (!app.games.evolution.realms[realm.key].leaderboard.raw.pickups) app.games.evolution.realms[realm.key].leaderboard.raw.pickups = {}

//       if (!app.games.evolution.global) {
//         app.games.evolution.global = {
//           key: 'global',
//         };
//       }

//       if (!app.games.evolution.global.leaderboard) {
//         app.games.evolution.global.leaderboard = jetpack.read(
//           path.resolve(`./db/evolution/global/season${app.games.evolution.currentSeason}/leaderboard.json`),
//           'json'
//         ) || {
//           raw: {
//             monetary: {},
//             wins: {},
//             rounds: {},
//             rewards: {},
//             points: {},
//             kills: {},
//             deaths: {},
//             powerups: {},
//             evolves: {},
//             pickups: {},
//           },
//           names: {},
//           [app.games.evolution.currentSeason]: {
//             all: [
//               {
//                 name: 'Overall',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             monetary: [
//               {
//                 name: 'Earnings',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             wins: [
//               {
//                 name: 'Wins',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             rounds: [
//               {
//                 name: 'Rounds',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             rewards: [
//               {
//                 name: 'Rewards',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             points: [
//               {
//                 name: 'Points',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             kills: [
//               {
//                 name: 'Kills',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             deaths: [
//               {
//                 name: 'Deaths',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             powerups: [
//               {
//                 name: 'Powerups',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             evolves: [
//               {
//                 name: 'Evolves',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//           },
//         };
//       }

//       if (!app.games.evolution.realms[realm.key].leaderboard) {
//         app.games.evolution.realms[realm.key].leaderboard = jetpack.read(
//           path.resolve(`./db/evolution/${realm.key}/season${app.games.evolution.currentSeason}/leaderboard.json`),
//           'json'
//         ) || {
//           raw: {
//             monetary: {},
//             wins: {},
//             rounds: {},
//             rewards: {},
//             points: {},
//             kills: {},
//             deaths: {},
//             powerups: {},
//             evolves: {},
//             pickups: {},
//           },
//           names: {},
//           [app.games.evolution.currentSeason]: {
//             all: [
//               {
//                 name: 'Overall',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             monetary: [
//               {
//                 name: 'Earnings',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             wins: [
//               {
//                 name: 'Wins',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             rounds: [
//               {
//                 name: 'Rounds',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             rewards: [
//               {
//                 name: 'Rewards',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             points: [
//               {
//                 name: 'Points',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             kills: [
//               {
//                 name: 'Kills',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             deaths: [
//               {
//                 name: 'Deaths',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             powerups: [
//               {
//                 name: 'Powerups',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//             evolves: [
//               {
//                 name: 'Evolves',
//                 count: 1000,
//                 data: [],
//               },
//             ],
//           },
//         };
//       }

//       if (!app.games.evolution.realms[realm.key].client) {
//         app.games.evolution.realms[realm.key].key = realm.key;

//         app.games.evolution.realms[realm.key].client = {
//           isAuthed: false,
//           isConnecting: false,
//           isConnected: false,
//           socket: null,
//           connectTimeout: null,
//           reqTimeout: null,
//         };
//       }

//       if (!realm.roundId) {
//         realm.roundId = 1;
//       }

//       // if (realm.key.indexOf('ptr') !== -1 || realm.key.indexOf('tournament') !== -1) continue
//       if (realm.status === 'inactive' || realm.updateMode === 'manual') continue;

//       if (
//         !app.games.evolution.realms[realm.key].client.isConnected &&
//         !app.games.evolution.realms[realm.key].client.isConnecting &&
//         !app.games.evolution.realms[realm.key].client.isAuthed
//       ) {
//         await connectRealm(app, realm);
//       }
//     }
//   } catch (e) {
//     log('Error', e);
//   }
// }

// export async function emitAll(app, ...args) {
//   for (const realm of app.db.evolution.realms) {
//     if (app.games.evolution.realms[realm.key]?.client?.isAuthed) {
//       console.log('emitAll', realm.key, ...args);
//       app.games.evolution.realms[realm.key]?.client?.socket.emit(...args);
//     }
//   }
// }

// export async function monitorEvolutionRealms(app) {
//   if (!app.realm) {
//     app.realm = {};
//     app.realm.apiAddress = '0x4b64Ff29Ee3B68fF9de11eb1eFA577647f83151C';
//     app.realm.apiSignature = await getSignedRequest(
//       app.web3,
//       app.secrets.find((s) => s.id === 'evolution-signer'),
//       'evolution'
//     );
//     app.realm.emitAll = emitAll.bind(null, app);
//   }

//   if (!app.db.evolution.config.rewardWinnerAmountPerLegitPlayerQueued) {
//     app.db.evolution.config.rewardWinnerAmountPerLegitPlayerQueued =
//       app.db.evolution.config.rewardWinnerAmountPerLegitPlayer;
//   }

//   if (!app.db.evolution.config.rewardWinnerAmountMaxQueued) {
//     app.db.evolution.config.rewardWinnerAmountMaxQueued = app.db.evolution.config.rewardWinnerAmountMax;
//   }

//   if (!app.db.evolution.config.itemRewards) {
//     app.db.evolution.config.itemRewards = {
//       runes: [
//         {
//           type: 'rune',
//           symbol: 'ith',
//           quantity: 10000,
//         },
//         {
//           type: 'rune',
//           symbol: 'amn',
//           quantity: 10000,
//         },
//         {
//           type: 'rune',
//           symbol: 'ort',
//           quantity: 10000,
//         },
//         {
//           type: 'rune',
//           symbol: 'tal',
//           quantity: 10000,
//         },
//         {
//           type: 'rune',
//           symbol: 'dol',
//           quantity: 10000,
//         },
//         // {
//         //   "type": "rune",
//         //   "symbol": "sol",
//         //   "quantity": 0
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "tir",
//         //   "quantity": 0
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "nef",
//         //   "quantity": 0
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "hel",
//         //   "quantity": 10000
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "ral",
//         //   "quantity": 0
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "thul",
//         //   "quantity": 0
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "shael",
//         //   "quantity": 0
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "ist",
//         //   "quantity": 10000
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "mal",
//         //   "quantity": 10000
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "um",
//         //   "quantity": 10000
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "pul",
//         //   "quantity": 10000
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "lum",
//         //   "quantity": 10000
//         // },
//         // {
//         //   "type": "rune",
//         //   "symbol": "zod",
//         //   "quantity": 0
//         // }
//       ],
//       items: [],
//     };
//   }

//   if (!app.db.evolution.config.itemRewardsQueued) {
//     app.db.evolution.config.itemRewardsQueued = app.db.evolution.config.itemRewards;
//   }

//   await connectRealms(app);
//   await updateRealms(app);

//   setTimeout(() => monitorEvolutionRealms(app), 30 * 1000);
// }

// setInterval(function () {
//   log('Clearing character cache...');
//   CharacterCache = {};
// }, 30 * 60 * 1000);

// dotenv.config();

// export const router = t.router;
// export const procedure = procedure;
// export const createCallerFactory = t.createCallerFactory;

// export class Seer {
//   constructor() {}

//   characters: Record<string, Character> = {};
//   db: any;
//   io: any;
//   app: any;
//   realm: any;

//   pingRequest(msg: any) {
//     log('PingRequest', msg);
//     this.io.emit('PingResponse');
//   }

//   pongRequest(msg: any) {
//     log('PongRequest', msg);
//     this.io.emit('PongResponse');
//   }

//   async unbanClient(req: { data: { target: string }; id: string }) {
//     log('unbanClient', req);

//     const user = await this.db.loadUser(req.data.target);
//     delete user.isBanned;
//     delete user.banReason;
//     await this.db.saveUser(user);

//     this.db.removeBanList('evolution', req.data.target);
//     this.db.saveBanList();

//     return { target: req.data.target };
//   }

//   async mod(req: {
//     data: {
//       body: { signature: { address: string } };
//       params: { method: string };
//     };
//   }) {
//     log('mod', req);

//     const user = await this.db.loadUser(req.data.body.signature.address);
//     emitAll('playerAction', {
//       key: 'moderator-action',
//       createdAt: new Date().getTime() / 1000,
//       address: user.address,
//       username: user.username,
//       method: req.data.params.method,
//       message: `${user.username} called ${req.data.params.method}`,
//     });

//     return { status: 1 };
//   }

//   async banClient(req: { data: { target: string; reason: string; until?: number }; id: string }) {
//     log('banClient', req);

//     const user = await this.db.loadUser(req.data.target);
//     user.isBanned = true;
//     user.banReason = req.data.reason;
//     user.banExpireDate = req.data.until || new Date().getTime() + 100 * 365 * 24 * 60 * 60; // 100 years by default

//     await this.db.saveUser(user);

//     this.db.addBanList('evolution', {
//       address: req.data.target,
//       reason: req.data.reason,
//       until: req.data.until,
//     });

//     this.db.saveBanList();

//     return {
//       status: 1,
//       data: {
//         target: req.data.target,
//         createdAt: new Date().getTime(),
//         banExpireDate: user.banExpireDate,
//         banReason: user.banReason,
//       },
//     };
//   }

//   reportClient(msg: any) {
//     log('reportClient', msg);

//     const { currentGamePlayers, currentPlayer, reportedPlayer } = msg;

//     if (currentPlayer.name.includes('Guest') || currentPlayer.name.includes('Unknown')) return; // No guest reports

//     if (!this.db.evolution.reportList[reportedPlayer.address]) {
//       this.db.evolution.reportList[reportedPlayer.address] = [];
//     }

//     if (!this.db.evolution.reportList[reportedPlayer.address].includes(currentPlayer.address)) {
//       this.db.evolution.reportList[reportedPlayer.address].push(currentPlayer.address);
//     }

//     // Additional logic for handling reports and disconnects can be added here

//     // Relay the report to connected realm servers
//   }

//   setRealmOffline(realm) {
//     if (realm.status === 'inactive' || realm.updateMode === 'manual') return;

//     realm.status = 'offline';
//     realm.playerCount = 0;
//     realm.speculatorCount = 0;
//     realm.rewardItemAmount = 0;
//     realm.rewardWinnerAmount = 0;
//   }

//   async getCharacter(req: { data: { address: string }; id: string }) {
//     log('GetCharacterRequest', req);

//     let character = this.characters[req.data.address];
//     if (!character) {
//       character = await getCharacter(this.app, req.data.address);
//       this.characters[req.data.address] = character;
//     }

//     return { status: 1, character };
//   }

//   async setRealmConfig(app, realm) {
//     const configRes = (await rsCall(app, app.games.evolution.realms[realm.key], 'SetConfigRequest', {
//       config: { ...app.db.evolution.config, roundId: realm.roundId },
//     })) as any;

//     if (configRes.status !== 1) {
//       this.setRealmOffline(realm);
//       return;
//     }
//   }

//   async saveRound(req) {
//     log('SaveRoundRequest', this.realm.key, req);

//     if (!(await isValidRequest(this.app.web3, req)) && this.db.evolution.modList.includes(req.signature.address)) {
//       log('Round invalid');

//       return { status: 0, message: 'Invalid signature' };
//     }

//     if (!req.data.lastClients) {
//       log('Round no clients');

//       return { status: 0, message: 'Error processing' };
//     }

//     if (req.data.round.winners.length === 0) {
//       this.realm.roundId += 1;

//       log('Round skipped');

//       return { status: 1 };
//     }

//     if (req.data.rewardWinnerAmount > this.db.evolution.config.rewardWinnerAmountMax) {
//       log(req.data.rewardWinnerAmount, this.db.evolution.config.rewardWinnerAmountMax);
//       throw new Error('Big problem with reward amount');
//     }

//     let totalLegitPlayers = 0;

//     for (const client of req.data.lastClients) {
//       if (client.name.includes('Guest') || client.name.includes('Unknown')) continue;

//       if (
//         (client.powerups > 100 && client.kills > 1) ||
//         (client.evolves > 20 && client.powerups > 200) ||
//         (client.rewards > 3 && client.powerups > 200) ||
//         client.evolves > 100 ||
//         client.points > 1000
//       ) {
//         totalLegitPlayers += 1;
//       }
//     }

//     if (totalLegitPlayers === 0) {
//       totalLegitPlayers = 1;
//     }

//     if (req.data.rewardWinnerAmount > this.db.evolution.config.rewardWinnerAmountPerLegitPlayer * totalLegitPlayers) {
//       log(
//         req.data.rewardWinnerAmount,
//         this.db.evolution.config.rewardWinnerAmountPerLegitPlayer,
//         totalLegitPlayers,
//         req.data.lastClients.length,
//         JSON.stringify(req.data.lastClients)
//       );
//       throw new Error('Big problem with reward amount 2');
//     }

//     if (req.data.roundId > this.realm.roundId) {
//       this.realm.roundId = req.data.roundId;
//     } else if (req.data.roundId < this.realm.roundId) {
//       const err = `Round id too low (realm.roundId = ${this.realm.roundId})`;

//       log(err);

//       await this.setRealmConfig(this.app, this.realm);

//       return { status: 0, message: err };
//     } else {
//       this.realm.roundId += 1;
//     }

//     const rewardWinnerMap = {
//       0: Math.round(req.data.rewardWinnerAmount * 1 * 1000) / 1000,
//       1: Math.round(req.data.rewardWinnerAmount * 0.25 * 1000) / 1000,
//       2: Math.round(req.data.rewardWinnerAmount * 0.15 * 1000) / 1000,
//       3: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       4: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       5: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       6: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       7: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       8: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//       9: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
//     };

//     const removeDupes2 = (list) => {
//       const seen = {};
//       return list.filter((item) => {
//         const k1 = item.address;
//         if (seen[k1]) {
//           return false;
//         } else {
//           seen[k1] = true;
//           return true;
//         }
//       });
//     };

//     req.data.round.players = removeDupes2(req.data.round.players);

//     const winners = req.data.round.winners.slice(0, 10);

//     for (const winner of winners) {
//       let character = this.characters[winner.address];

//       if (!character) {
//         character = await this.getCharacter(winner.address);
//         this.characters[winner.address] = character;
//       }

//       // Additional reward logic based on character's meta data
//     }

//     for (const player of req.data.round.players) {
//       const user = await this.db.loadUser(player.address);
//       const now = new Date().getTime() / 1000;

//       if (user.lastGamePlayed > now - 4 * 60) continue;

//       if (!user.username) user.username = await this.getUsername(user.address);
//       if (!user.username) continue;

//       this.db.setUserActive(user);

//       if (player.killStreak >= 10) {
//         this.api.emitAll('PlayerAction', {
//           key: 'evolution1-killstreak',
//           createdAt: new Date().getTime() / 1000,
//           address: user.address,
//           username: user.username,
//           message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
//         });
//         this.notices.add('evolution1-killstreak', {
//           key: 'evolution1-killstreak',
//           address: user.address,
//           username: user.username,
//           message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
//         });
//       }

//       for (const pickup of player.pickups) {
//         if (pickup.type === 'rune') {
//           if (
//             pickup.quantity >
//             req.data.round.players.length * this.db.evolution.config.rewardItemAmountPerLegitPlayer * 2
//           ) {
//             log(
//               pickup.quantity,
//               this.db.evolution.config.rewardItemAmountPerLegitPlayer,
//               req.data.round.players.length,
//               JSON.stringify(req.data.round.players)
//             );
//             throw new Error('Big problem with item reward amount');
//           }

//           if (pickup.quantity > req.data.round.players.length * this.db.evolution.config.rewardItemAmountMax) {
//             log(pickup.quantity, req.data.round.players.length, this.db.evolution.config.rewardItemAmountMax);
//             throw new Error('Big problem with item reward amount 2');
//           }

//           const runeSymbol = pickup.rewardItemName.toLowerCase();
//           if (!runes.includes(runeSymbol)) continue;

//           user.rewards.runes[runeSymbol] = (user.rewards.runes[runeSymbol] || 0) + pickup.quantity;
//           user.lifetimeRewards.runes[runeSymbol] = (user.lifetimeRewards.runes[runeSymbol] || 0) + pickup.quantity;

//           this.db.evolution.config.itemRewards.runes[runeSymbol.toLowerCase()] -= pickup.quantity;
//           this.db.oracle.outflow.evolutionRewards.tokens.week[runeSymbol.toLowerCase()] += pickup.quantity;
//         } else {
//           user.rewards.items[pickup.id] = {
//             name: pickup.name,
//             rarity: pickup.rarity,
//             quantity: pickup.quantity,
//           };

//           user.lifetimeRewards.items[pickup.id] = {
//             name: pickup.name,
//             rarity: pickup.rarity,
//             quantity: pickup.quantity,
//           };
//         }
//       }

//       user.lastGamePlayed = now;

//       if (!user.evolution.hashes) user.evolution.hashes = [];
//       if (!user.evolution.hashes.includes(player.hash)) user.evolution.hashes.push(player.hash);

//       user.evolution.hashes = user.evolution.hashes.filter((item, pos) => user.evolution.hashes.indexOf(item) === pos);

//       if (!this.games.evolution.realms[this.realm.key].leaderboard.names)
//         this.games.evolution.realms[this.realm.key].leaderboard.names = {};

//       this.games.evolution.realms[this.realm.key].leaderboard.names[user.address] = user.username;

//       if (!this.games.evolution.realms[this.realm.key].leaderboard.raw.points[user.address]) {
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.monetary[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.wins[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.rounds[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.kills[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.points[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.deaths[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.powerups[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.evolves[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.rewards[user.address] = 0;
//         this.games.evolution.realms[this.realm.key].leaderboard.raw.pickups[user.address] = 0;
//       }

//       this.games.evolution.realms[this.realm.key].leaderboard.raw.rounds[user.address] += 1;
//       this.games.evolution.realms[this.realm.key].leaderboard.raw.kills[user.address] += player.kills;
//       this.games.evolution.realms[this.realm.key].leaderboard.raw.points[user.address] += player.points;
//       this.games.evolution.realms[this.realm.key].leaderboard.raw.deaths[user.address] += player.deaths;
//       this.games.evolution.realms[this.realm.key].leaderboard.raw.powerups[user.address] += player.powerups;
//       this.games.evolution.realms[this.realm.key].leaderboard.raw.evolves[user.address] += player.evolves;
//       this.games.evolution.realms[this.realm.key].leaderboard.raw.rewards[user.address] += player.rewards;
//       this.games.evolution.realms[this.realm.key].leaderboard.raw.pickups[user.address] += player.pickups.length;

//       if (!this.games.evolution.global.leaderboard.names) this.games.evolution.global.leaderboard.names = {};

//       this.games.evolution.global.leaderboard.names[user.address] = user.username;

//       if (!this.games.evolution.global.leaderboard.raw.points[user.address]) {
//         this.games.evolution.global.leaderboard.raw.monetary[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.wins[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.rounds[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.kills[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.points[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.deaths[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.powerups[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.evolves[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.rewards[user.address] = 0;
//         this.games.evolution.global.leaderboard.raw.pickups[user.address] = 0;
//       }

//       this.games.evolution.global.leaderboard.raw.rounds[user.address] += 1;
//       this.games.evolution.global.leaderboard.raw.kills[user.address] += player.kills;
//       this.games.evolution.global.leaderboard.raw.points[user.address] += player.points;
//       this.games.evolution.global.leaderboard.raw.deaths[user.address] += player.deaths;
//       this.games.evolution.global.leaderboard.raw.powerups[user.address] += player.powerups;
//       this.games.evolution.global.leaderboard.raw.evolves[user.address] += player.evolves;
//       this.games.evolution.global.leaderboard.raw.rewards[user.address] += player.rewards;
//       this.games.evolution.global.leaderboard.raw.pickups[user.address] += player.pickups.length;

//       if (winners.find((winner) => winner.address === player.address)) {
//         const index = winners.findIndex((winner) => winner.address === player.address);
//         if (user.username) {
//           let character = this.characters[player.address];

//           if (!character) {
//             character = await this.getCharacter(player.address);
//             this.characters[player.address] = character;
//           }

//           const WinRewardsIncrease = character?.meta?.[1150] || 0;
//           const WinRewardsDecrease = character?.meta?.[1160] || 0;

//           const rewardMultiplier = 1 + (WinRewardsIncrease - WinRewardsDecrease) / 100;

//           if (rewardMultiplier > 2 || rewardMultiplier < 0) {
//             log(
//               'Error with reward multiplier.. bad things happened: ',
//               rewardMultiplier,
//               rewardMultiplier,
//               WinRewardsDecrease
//             );
//             process.exit(5);
//           }

//           rewardWinnerMap[index] *= rewardMultiplier;

//           if (!user.rewards.runes['zod']) {
//             user.rewards.runes['zod'] = 0;
//           }

//           if (user.rewards.runes['zod'] < 0) {
//             user.rewards.runes['zod'] = 0;
//           }

//           user.rewards.runes['zod'] += rewardWinnerMap[index];

//           if (!user.lifetimeRewards.runes['zod']) {
//             user.lifetimeRewards.runes['zod'] = 0;
//           }

//           user.lifetimeRewards.runes['zod'] += rewardWinnerMap[index];

//           this.db.oracle.outflow.evolutionRewards.tokens.week['zod'] += rewardWinnerMap[index];

//           this.games.evolution.global.leaderboard.raw.monetary[user.address] += rewardWinnerMap[index];
//           this.games.evolution.realms[this.realm.key].leaderboard.raw.monetary[user.address] += rewardWinnerMap[index];

//           this.api.emitAll('PlayerAction', {
//             key: 'evolution1-winner',
//             createdAt: new Date().getTime() / 1000,
//             address: user.address,
//             username: user.username,
//             realmKey: this.realm.key,
//             placement: index + 1,
//             message: `${user.username} placed #${index + 1} for ${rewardWinnerMap[index].toFixed(4)} ZOD in Evolution`,
//           });

//           if (rewardWinnerMap[index] > 0.1) {
//             this.notices.add('evolution1-winner', {
//               key: 'evolution1-winner',
//               address: user.address,
//               username: user.username,
//               realmKey: this.realm.key,
//               placement: index + 1,
//               message: `${user.username} won ${rewardWinnerMap[index].toFixed(4)} ZOD in Evolution`,
//             });
//           }

//           if (req.data.round.winners[0].address === player.address) {
//             if (!this.games.evolution.realms[this.realm.key].leaderboard.raw)
//               this.games.evolution.realms[this.realm.key].leaderboard.raw = {};
//             if (!this.games.evolution.realms[this.realm.key].leaderboard.raw.wins)
//               this.games.evolution.realms[this.realm.key].leaderboard.raw.wins = 0;

//             this.games.evolution.realms[this.realm.key].leaderboard.raw.wins[user.address] += 1;

//             if (!this.games.evolution.global.leaderboard.raw) this.games.evolution.global.leaderboard.raw = {};
//             if (!this.games.evolution.global.leaderboard.raw.wins) this.games.evolution.global.leaderboard.raw.wins = 0;

//             this.games.evolution.global.leaderboard.raw.wins[user.address] += 1;
//           }
//         }
//       }

//       await this.db.saveUser(user);
//     }

//     log('Round saved');

//     return { status: 1 };
//   }
// }

// const seer = new Seer();

// interface ProcedureContext {}

// export const createRouter = (
//   handler: (input: unknown, ctx: ProcedureContext) => Promise<void> | void // Adjust the return type if needed
// ) => {
//   return router({
//     pingRequest: t.procedure.input(z.any()).mutation(({ input }) => seer.pingRequest(input)),

//     pongRequest: t.procedure.input(z.any()).mutation(({ input }) => seer.pongRequest(input)),

//     unbanClient: t.procedure
//       .input(z.object({ data: z.object({ target: z.string() }) }))
//       .mutation(({ input }) => seer.unbanClient(input)),

//     mod: t.procedure
//       .input(
//         z.object({
//           data: z.object({
//             body: z.object({ signature: z.object({ address: z.string() }) }),
//           }),
//         })
//       )
//       .mutation(({ input }) => seer.mod(input)),

//     banClient: t.procedure
//       .input(
//         z.object({
//           data: z.object({
//             target: z.string(),
//             reason: z.string(),
//             until: z.number().optional(),
//           }),
//           id: z.string(),
//         })
//       )
//       .mutation(({ input }) => seer.banClient(input)),

//     reportClient: t.procedure.input(z.any()).mutation(({ input }) => seer.reportClient(input)),

//     getCharacter: t.procedure
//       .input(z.object({ data: z.object({ address: z.string() }) }))
//       .mutation(({ input }) => seer.getCharacter(input)),

//     saveRound: t.procedure
//       .input(
//         z.object({
//           data: z.object({
//             signature: z.object({ address: z.string() }),
//             lastClients: z.array(z.any()),
//             rewardWinnerAmount: z.number(),
//             round: z.object({
//               winners: z.array(z.any()),
//               players: z.array(z.any()),
//             }),
//             roundId: z.number(),
//           }),
//         })
//       )
//       .mutation(({ input }) => seer.saveRound(input)),
//   });
// };

// export type Router = ReturnType<typeof createRouter>;
