import type { RouterContext, RouterInput, RouterOutput } from './evolution.types';
import * as Arken from '@arken/node';
import { generateShortId } from '@arken/node/util/db';
import contractInfo from '@arken/node/legacy/contractInfo';
import { ARXError } from '@arken/node/util/rpc';
import { iterateBlocks, getAddress, getSignedRequest } from '@arken/node/util/web3';
import { sleep } from '@arken/node/util/time';
import * as ethers from 'ethers';
import Web3 from 'web3';
import dayjs from 'dayjs';
import { getTime, log, logError, random, toLong } from '@arken/node/util';
import { getTokenIdFromItem, normalizeItem } from '@arken/node/util/decoder';
import { awaitEnter } from '@arken/node/util/process';
import { Schema, serialize } from 'borsh';

const allowedAdminAddresses = [
  '0xa987f487639920A3c2eFe58C8FBDedB96253ed9B',
  '0x82b644E1B2164F5B81B3e7F7518DdE8E515A419d',
  '0xD934BAD7bCaAfdfdEbad863Bc9964B82197cBCc3',
];

const usdPairs = ['busd', 'usdc', 'usdt'];

const contractAddressToKey = {};

for (const contractKey of Object.keys(contractInfo)) {
  contractAddressToKey[contractInfo[contractKey][56]] = contractKey;
}

// TODO: check history, reasonable amount? does it deplete like it should?
function isClaimProblem(payment) {
  if (payment.owner.name === 'goldenlion') {
    return 'Claim seems suspicious - contact support';
  }

  const allowedItemKeys = ['zavox'];

  for (const index in payment.meta.tokenAmounts) {
    const tokenAmount = payment.meta.tokenAmounts[index];
    const tokenAddress = payment.meta.tokenAddresses[index];

    if (
      !payment.owner.meta.rewards ||
      payment.owner.meta.rewards.tokens[contractAddressToKey[tokenAddress]] < tokenAmount
    ) {
      return 'Profile does not have enough funds for this payment';
    }
  }

  for (const index in payment.meta.tokenIds) {
    const item = payment.meta.tokenIds[index];
    const reward = payment.owner.meta.rewards?.items?.[item.rewardId];

    if (!allowedAdminAddresses.includes(payment.owner.address)) {
      return 'Invalid request';
    }
  }

  for (const index in payment.meta.itemIds) {
    const item = payment.meta.itemIds[index];
    const reward = payment.owner.meta.rewards?.items?.[item.rewardId];

    if (!allowedItemKeys.includes(item.id) && !allowedAdminAddresses.includes(payment.owner.address)) {
      return 'Invalid req';
    }
    if (!reward || reward.rarity !== item.rewardRarity || reward.name !== item.rewardName) {
      return 'Profile does not have a matching reward in database';
    }
  }
}

interface ItemData {
  tokenAddresses: string[];
  tokenAmounts: string[];
  tokenIds: string[];
  itemIds: string[];
  purportedSigner: string;
  to: string;
  nonce: string;
  expiry: string;
  requestId: string;
}

function getTokenIdsFromItems(requestedItems) {
  const tokenIds = requestedItems.map((requestedItem) => {
    return getTokenIdFromItem(requestedItem, random(0, 999));
  });

  return tokenIds;
}

export class Service {
  async updateConfig(input: RouterInput['updateConfig'], ctx: RouterContext): Promise<RouterOutput['updateConfig']> {
    if (!input) throw new Error('Input should not be void');

    const game = await ctx.app.model.Game.findOne({ key: 'evolution-isles' });

    // if (!game.meta)
    // game.meta = {
    //   noDecay: false,
    //   isBattleRoyale: false,
    //   roundLoopSeconds: 0,
    //   totalLegitPlayers: 0,
    //   checkPositionDistance: 0,
    //   baseSpeed: 0,
    //   maxClients: 100,
    //   rewardItemAmount: 1,
    //   mapBoundary: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } },
    //   orbTimeoutSeconds: 0,
    //   preventBadKills: false,
    //   rewardWinnerAmountMax: 300,
    //   maxEvolves: 0,
    //   spawnBoundary1: { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } },
    //   isRoundPaused: false,
    //   gameMode: 'Deathmatch',
    //   antifeed1: false,
    //   level2open: false,
    //   rewardWinnerAmount: 1000,
    //   orbCutoffSeconds: 0,
    //   antifeed2: false,
    //   rewardSpawnLoopSeconds: 0,
    //   rewardItemAmountPerLegitPlayer: 0.0010000000000000000208,
    //   antifeed3: false,
    //   checkInterval: 0,
    //   isGodParty: false,
    //   pointsPerEvolve: 0,
    //   pointsPerKill: 0,
    //   loggableEvents: [],
    //   drops: { guardian: 0, santa: 0, earlyAccess: 0, trinket: 0 },
    //   hideMap: false,
    //   rewards: {
    //     characters: [{ type: 'character', tokenId: '1' }],
    //     items: [],
    //     tokens: [
    //       { symbol: 'pepe', value: 0.000020000000000000001636, quantity: 10000000, type: 'token' },
    //       { symbol: 'doge', value: 0.2999999999999999889, quantity: 0, type: 'token' },
    //       { symbol: 'harold', value: 0.012999999999999999403, quantity: 100000, type: 'token' },
    //     ],
    //   },
    //   decayPower: 0,
    //   spawnBoundary2: { x: { max: 0, min: 0 }, y: { min: 0, max: 0 } },
    //   rewardWinnerAmountPerLegitPlayer: 0.0010000000000000000208,
    //   dynamicDecayPower: true,
    //   leadercap: false,
    //   rewardItemAmountMax: 1,
    //   resetInterval: 0,
    //   orbOnDeathPercent: 0,
    //   roundId: '6774d64608c05476fc257d1a',
    //   noBoot: false,
    //   fastLoopSeconds: 0,
    // };

    for (const key in input) {
      console.log('Setting', key, input[key]);
      game.meta[key] = input[key];
    }

    game.meta = { ...game.meta };
    game.markModified('meta');

    await game.save();

    return game.meta;
  }

  async updateGameStats(
    input: RouterInput['updateGameStats'],
    ctx: RouterContext
  ): Promise<RouterOutput['updateGameStats']> {
    const { Game, GameStat } = ctx.app.model;

    const game = await Game.findOne({ key: 'evolution' }).populate('stat').exec();
    let latestRecord = game.stat;

    try {
      if (latestRecord) {
        const dayAgo = dayjs().subtract(1, 'day');

        // Unset the latest record if it's older than one day, so a new one is created
        if (!dayjs(latestRecord.createdDate).isAfter(dayAgo)) {
          latestRecord = undefined;
        }
      }
    } catch (e) {
      console.log('Error getting latest stat record', e);
    }

    const meta: any = {
      clientCount: game.meta.clientCount,
    };

    if (latestRecord) {
      await GameStat.updateOne(
        { _id: latestRecord.id },
        {
          ...latestRecord,
          meta,
        }
      ).exec();
    } else {
      const gameStat = await GameStat.create({
        gameId: game.id,
        meta,
      });

      game.statId = gameStat.id;
    }

    game.meta = { ...game.meta };

    await game.save();
  }

  async getAllChestEvents(app, retry = false) {
    if (app.data.chest.updating) return;

    log('[Chest] Updating');

    app.data.chest.updating = true;

    try {
      const payments = await app.model.Payment.find();

      const iface = new ethers.Interface(app.contractMetadata.ArkenChest.abi);

      // @ts-ignore
      async function processLog(log2, updateConfig = true) {
        try {
          const e = iface.parseLog(log2);

          console.log(e.name, e);
          const profile = await app.model.Profile.findOne({ address: e.args.to });

          const payment = await app.model.Payment.findOne({ id: e.args.requestId });

          if (!payment) {
            throw new Error('Could not find a payment that appeared onchain.');
          }

          payment.status = 'Completed';
        } catch (ex) {
          log(ex);
          log('Error parsing log: ', log2);
          await sleep(1000);
        }
      }

      const blockNumber = await app.web3.eth.getBlockNumber();

      if (parseInt(blockNumber) > 10000) {
        const events = ['ItemsSent(address,uint256,string)'];

        for (const event of events) {
          await iterateBlocks(
            app,
            `Chest Events: ${event}`,
            getAddress(app.contractInfo.chest),
            app.data.chest.lastBlock[event] || 15000000,
            blockNumber,
            app.contracts.chest.filters[event](),
            processLog,
            async function (blockNumber2) {
              app.data.chest.lastBlock[event] = blockNumber2;
              // await saveConfig()
            }
          );
        }
      } else {
        log('Error parsing block number', blockNumber);
      }

      log('Finished getting events');
    } catch (e) {
      log('Error', e);
      await sleep(1000);
    }

    app.data.chest.updating = false;
    app.data.chest.updatedDate = new Date().toString();
    app.data.chest.updatedTimestamp = new Date().getTime();

    if (retry) {
      setTimeout(() => this.getAllChestEvents(app, retry), 5 * 60 * 1000);
    }
  }

  async monitorChest(input: RouterInput['monitorChest'], ctx: RouterContext): Promise<RouterOutput['monitorChest']> {
    ctx.app.data.chest = {};

    await this.getAllChestEvents(ctx.app);

    ctx.app.contracts.chest.on('ItemsSent', async () => {
      await this.getAllChestEvents(ctx.app);
    });
  }

  async info(input: RouterInput['info'], ctx: RouterContext): Promise<RouterOutput['info']> {
    console.log('Evolution.Service.info', input);

    if (!ctx.client?.roles?.includes('admin')) throw new Error('Not authorized');

    // const gameData = await ctx.app.model.Data.findOne({ key: 'evolution', mod: 'evolution' });

    // gameData.data = {
    //   roundId: generateShortId(),
    //   maxClients: 100,
    //   rewardItemAmount: 1,
    //   rewardWinnerAmount: 300,
    //   rewardItemAmountPerLegitPlayer: 0.001,
    //   rewardItemAmountMax: 1,
    //   rewardWinnerAmountPerLegitPlayer: 0.001,
    //   rewardWinnerAmountMax: 300,
    //   drops: {
    //     guardian: 0,
    //     earlyAccess: 0,
    //     trinket: 0,
    //     santa: 0,
    //   },
    //   totalLegitPlayers: 0,
    //   isBattleRoyale: false,
    //   isGodParty: false,
    //   level2open: false,
    //   isRoundPaused: false,
    //   gameMode: 'Deathmatch',
    //   maxEvolves: 0,
    //   pointsPerEvolve: 0,
    //   pointsPerKill: 0,
    //   decayPower: 0,
    //   dynamicDecayPower: true,
    //   baseSpeed: 0,
    //   avatarSpeedMultiplier: {},
    //   avatarDecayPower: {},
    //   preventBadKills: false,
    //   antifeed1: false,
    //   antifeed2: false,
    //   antifeed3: false,
    //   noDecay: false,
    //   noBoot: false,
    //   rewardSpawnLoopSeconds: 0,
    //   orbOnDeathPercent: 0,
    //   orbTimeoutSeconds: 0,
    //   orbCutoffSeconds: 0,
    //   orbLookup: {},
    //   roundLoopSeconds: 0,
    //   fastLoopSeconds: 0,
    //   leadercap: false,
    //   hideMap: false,
    //   checkPositionDistance: 0,
    //   checkInterval: 0,
    //   resetInterval: 0,
    //   loggableEvents: [],
    //   mapBoundary: {
    //     x: { min: 0, max: 0 },
    //     y: { min: 0, max: 0 },
    //   },
    //   spawnBoundary1: {
    //     x: { min: 0, max: 0 },
    //     y: { min: 0, max: 0 },
    //   },
    //   spawnBoundary2: {
    //     x: { min: 0, max: 0 },
    //     y: { min: 0, max: 0 },
    //   },
    //   rewards: {
    //     tokens: [
    //       {
    //         type: 'token',
    //         symbol: 'pepe',
    //         quantity: 10000000,
    //         value: 0.00002,
    //       },
    //       {
    //         type: 'token',
    //         symbol: 'doge',
    //         quantity: 1000,
    //         value: 0.3,
    //       },
    //       {
    //         type: 'token',
    //         symbol: 'harold',
    //         quantity: 100000,
    //         value: 0.013,
    //       },
    //     ],
    //     items: [],
    //     characters: [
    //       {
    //         type: 'character',
    //         tokenId: '1',
    //       },
    //     ],
    //   },
    //   ...gameData.data,
    // };

    // for (const key in data) {
    //   if (!gameData.data[key]) {
    //     gameData.data[key] = data[key];
    //   }
    // }

    // gameData.markModified('data');

    // await gameData.save();

    const game = await ctx.app.model.Game.findOne({ key: 'evolution-isles' });

    return game.meta;
  }

  async getPayments(input: RouterInput['getPayments'], ctx: RouterContext): Promise<RouterOutput['getPayments']> {
    console.log('Profile.Service.getPayments', input);

    if (!ctx.client.profile) return [];

    const payments = await ctx.app.model.Payment.find({
      ownerId: ctx.client.profile.id,
    }).sort({ createdDate: -1 });

    return payments;
  }

  async createPaymentRequest(
    input: RouterInput['createPaymentRequest'],
    ctx: RouterContext
  ): Promise<RouterOutput['createPaymentRequest']> {
    if (!input) throw new ARXError('NO_INPUT');

    console.log('Profile.Service.createPaymentRequest', input);

    const existingPayment = await ctx.app.model.Payment.findOne({
      ownerId: ctx.client.profile.id,
      status: 'Processing',
    });

    if (existingPayment) throw new Error('Payment is already processing');

    await ctx.app.model.Payment.updateMany({ ownerId: ctx.client.profile.id }, { $set: { status: 'Voided' } });

    await ctx.app.model.Payment.create({
      // applicationId: this.cache.Application.Arken.id,
      // name: ctx.client.profile.name,
      status: 'Processing',
      ownerId: ctx.client.profile.id,
      meta: {
        tokenAddresses: input.tokens.map((token) =>
          token === 'usd' ? ctx.app.contractInfo.bsc.busd[56] : ctx.app.contractInfo.bsc[token][56]
        ),
        tokenAmounts: input.amounts,
        to: input.to,
        tokenIds: input.tokenIds || [],
        itemIds: input.itemIds || [],
        signedData: null,
      },
    });
  }

  async processBinanceSmartChainPayment(payment: any, ctx: any) {
    const items = await ctx.app.model.Item.find({ key: { $in: payment.meta.itemIds || [] } });

    // #region Build ItemData
    let rewardData: ItemData = {} as any;

    const tokenDecimals: Record<string, number> = {
      '0xbA2aE424d960c26247Dd6c32edC70B295c744C43': 8,
    };

    // payment.meta.tokenAddresses = ['0xbA2aE424d960c26247Dd6c32edC70B295c744C43'];
    // payment.meta.tokenAmounts = [1];

    /*
     * `payment.tokenAddresses` contains the contract addresses of the tokens the user is claiming.
     *
     * If the user isn't claiming any tokens (only item mints), this is the empty array.
     */
    rewardData.tokenAddresses = payment.meta.tokenAddresses;
    /*
     * `payment.tokenAmounts` contains the amounts (in wei) of the tokens the user is claiming.
     *
     * If the user isn't claiming any tokens (only item mints), this is the empty array.
     *
     * The length of this array must equal the length of `payment.tokenAddresses` and must be ordered the same.
     */
    rewardData.tokenAmounts = (payment.meta.tokenAddresses || []).map(
      (r, i) =>
        toLong((payment.meta.tokenAmounts[i] + '').slice(0, tokenDecimals[r] || 16), tokenDecimals[r] || 16) + ''
    );
    /*
     * `payment.tokenIds` contains the token ids of any reward items (trinkets, Santa hats, cubes, etc.) the user
     * is claiming.
     *
     * If the user isn't claiming any item mints (only tokens), this is the empty array.
     *
     * The contract will ensure token uniqueness, but the three digit serial should be randomised to prevent excess
     * gas spending.
     */

    rewardData.tokenIds = ctx.client.roles.includes('admin') ? getTokenIdsFromItems(items) : [];
    /*
     * `payment.itemIds` contains the item ids of any reward items (trinkets, Santa hats, cubes, etc.) the user
     * is claiming.
     *
     * If the user isn't claiming any item mints (only tokens), this is the empty array.
     *
     * The length of this array must equal the length of `payment.tokenIds` and must be ordered the same.
     */
    rewardData.itemIds = ctx.client.roles.includes('admin') ? items.map((requestedItem) => requestedItem.id) : [];

    rewardData.purportedSigner = ctx.app.signers.wallet.address; // '0x81F8C054667046171C0EAdC73063Da557a828d6f'; // arken dev 2 #0

    /*
     * `payment.to` contains the address of the user who should receive the rewards.
     */
    rewardData.to = payment.meta.to;

    /*
     * Get next nonce and expiry for the user who should receive the rewards.
     */
    const nextNonceAndExpiry = await ctx.app.contracts.bsc.chest.getNextNonceAndExpiry(rewardData.to);
    const nonce = nextNonceAndExpiry.nextNonce.toNumber();
    const expiry = nextNonceAndExpiry.expiry.toNumber();

    rewardData.nonce = nonce;
    rewardData.expiry = expiry;

    /*
     * RE request id: suggest it's the keccak256 hash of all rewardData structure, but we can make it something else
     * if needed (think you mentioned doing something similar to AWS's payment ids at one point)
     */
    rewardData.requestId = payment.id + ''; // (ctx.app.web3.bsc as Web3).utils.keccak256(JSON.stringify(rewardData));

    /* --- IMPORTANT ---
     *
     * We need to store mappings between address and nonce pairs and the rewards we're authorising issuance of.
     *
     * Let's say this is the first time the user has claimed.
     *
     * We get the next nonce from the contract and see it is 0, as expected. The user is eligible for 5 Tir and a
     * mysterious trinket (for example). We need to store the mapping between (user's address, nonce 0) and the
     * reward. When we can then issue a permit for the user to get 5 Tir and their trinket.
     *
     * Let's say the user doesn't use their permit, but hits the service again. We look up the fact that the nonce is
     * still 0 in the contract, and we can reissue another permit ad libitum. It doesn't matter if the user comes back
     * and requests a million permits - as soon as they give one of them to the contract and make a claim, the nonce
     * counter increments, and all of the other permits are invalidated. So even if someone thinks they're being
     * clever, gets ten permits, stores then, then submits them at once, only one will succeed.
     *
     * What we *do* need to be careful of is what happens when we check the nonce with the contract and it's now 1.
     * That means one of the tickets went through. Now we need to compare it against the stored nonce for the user,
     * see that it's higher than the stored number, take the mapped reward and ask the coordinator to subtract those
     * rewards from the user's pending balance. Then, assuming there's anything left, we can issue the permit for
     * whatever is new under the new nonce.
     *
     * I'll skip the logic for this as I haven't had a chance to familiarise myself properly with the coordinator,
     * and just assume the nonce check is ok here.
     */
    const domain = {
      name: 'ArkenChest',
      version: '1',
      chainId: 56,
      verifyingContract: getAddress(contractInfo.chest),
    };

    const rewardDataTypes = {
      // EIP712Domain: [
      //     { name: 'name', type: 'string' },
      //     { name: 'version', type: 'string' },
      //     { name: 'chainId', type: 'uint256' },
      //     { name: 'verifyingContract', type: 'address' },
      // ],
      ItemData: [
        { name: 'tokenAddresses', type: 'address[]' },
        { name: 'tokenAmounts', type: 'uint256[]' },
        { name: 'tokenIds', type: 'uint256[]' },
        { name: 'itemIds', type: 'uint16[]' },

        { name: 'purportedSigner', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'expiry', type: 'uint256' },
        { name: 'requestId', type: 'string' },
      ],
    };

    // const profile = await ctx.app.model.Profile.findOne({ id: payment.ownerId });

    for (const i in payment.meta.tokenAddresses) {
      const address = payment.meta.tokenAddresses[i];
      const key = contractAddressToKey[address];
      const value = payment.owner.meta.rewards.tokens[key];

      payment.owner.meta.rewards.tokens[key] -= rewardData.tokenAmounts[i];

      if (payment.owner.meta.rewards.tokens[key] < 0.000000001) payment.owner.meta.rewards.tokens[key] = 0;
    }

    payment.owner.meta = { ...payment.owner.meta };

    console.log(payment.owner.meta.rewards);

    await ctx.app.model.Profile.updateOne({ id: payment.ownerId }, { $set: { meta: payment.owner.meta } });

    // TODO: refetch profile and confirm balances?

    const signature = await ctx.app.signers.wallet._signTypedData(domain, rewardDataTypes, rewardData);

    // This should be the calldata we need to return to the user
    payment.meta.signedData = ctx.app.contracts.bsc.chest.interface.encodeFunctionData('sendItems', [
      rewardData,
      signature,
    ]);
  }

  async processSolanaPayment(payment: any, ctx: any) {
    const anchor = require('@project-serum/anchor');
    const { PublicKey, Keypair, SystemProgram } = anchor.web3;
    const fs = require('fs');
    const nacl = require('tweetnacl');
    const bs58 = require('bs58');

    // Configure the client to use the Solana cluster
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // Load authority keypair (authorized signer)
    const authoritySecret = JSON.parse(process.env.SOLANA_CHEST_AUTHORITY);
    const authority = Keypair.fromSecretKey(new Uint8Array(authoritySecret));

    // Define token mint and from token account
    const tokenMint = '3vgopg7xm3EWkXfxmWPUpcf7g939hecfqg18sLuXDzVt'; // Replace with your existing token mint address

    // Define recipient
    const recipient = '9hdMuARXF4VXg3LsJJirkye8QNjY79iznTzNRtL7JFYa'; // Replace with recipient's public key

    const items = await ctx.app.model.Item.find({ key: { $in: payment.meta.itemIds || [] } });

    // #region Build ItemData
    let rewardData: ItemData = {} as any;

    const tokenDecimals: Record<string, number> = {
      '0xbA2aE424d960c26247Dd6c32edC70B295c744C43': 8,
    };

    // payment.meta.tokenAddresses = ['0xbA2aE424d960c26247Dd6c32edC70B295c744C43'];
    // payment.meta.tokenAmounts = [1];

    /*
     * `payment.tokenAddresses` contains the contract addresses of the tokens the user is claiming.
     *
     * If the user isn't claiming any tokens (only item mints), this is the empty array.
     */
    rewardData.tokenAddresses = payment.meta.tokenAddresses;
    /*
     * `payment.tokenAmounts` contains the amounts (in wei) of the tokens the user is claiming.
     *
     * If the user isn't claiming any tokens (only item mints), this is the empty array.
     *
     * The length of this array must equal the length of `payment.tokenAddresses` and must be ordered the same.
     */
    rewardData.tokenAmounts = (payment.meta.tokenAddresses || []).map(
      (r, i) =>
        toLong((payment.meta.tokenAmounts[i] + '').slice(0, tokenDecimals[r] || 16), tokenDecimals[r] || 16) + ''
    );
    /*
     * `payment.tokenIds` contains the token ids of any reward items (trinkets, Santa hats, cubes, etc.) the user
     * is claiming.
     *
     * If the user isn't claiming any item mints (only tokens), this is the empty array.
     *
     * The contract will ensure token uniqueness, but the three digit serial should be randomised to prevent excess
     * gas spending.
     */

    rewardData.tokenIds = ctx.client.roles.includes('admin') ? getTokenIdsFromItems(items) : [];
    /*
     * `payment.itemIds` contains the item ids of any reward items (trinkets, Santa hats, cubes, etc.) the user
     * is claiming.
     *
     * If the user isn't claiming any item mints (only tokens), this is the empty array.
     *
     * The length of this array must equal the length of `payment.tokenIds` and must be ordered the same.
     */
    rewardData.itemIds = ctx.client.roles.includes('admin') ? items.map((requestedItem) => requestedItem.id) : [];

    rewardData.purportedSigner = ctx.app.signers.wallet.address; // '0x81F8C054667046171C0EAdC73063Da557a828d6f'; // arken dev 2 #0

    /*
     * `payment.to` contains the address of the user who should receive the rewards.
     */
    rewardData.to = payment.meta.to;

    /*
     * Get next nonce and expiry for the user who should receive the rewards.
     */
    const nextNonceAndExpiry = await ctx.app.contracts.bsc.chest.getNextNonceAndExpiry(rewardData.to);
    const nonce = nextNonceAndExpiry.nextNonce.toNumber();
    const expiry = nextNonceAndExpiry.expiry.toNumber();

    rewardData.nonce = nonce;

    // Define ItemData
    const itemData = {
      token_addresses: [tokenMint],
      token_amounts: [1], // Amounts corresponding to each token address
      token_ids: [], // Ignored as per instructions
      item_ids: [], // Ignored as per instructions
      purported_signer: authority.publicKey,
      to: recipient,
      nonce: 0, // Fetch current nonce from state if necessary
      expiry: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      request_id: payment.id + '',
    };

    // Serialize ItemData using Borsh
    class ItemDataSchema {
      token_addresses: string[];
      token_amounts: number[];
      token_ids: number[];
      item_ids: number[];
      purported_signer: string;
      to: string;
      nonce: number;
      expiry: number;
      request_id: string;

      constructor(fields: Partial<ItemDataSchema>) {
        Object.assign(this, fields);
      }
    }

    const schema: any = new Map([
      [
        ItemDataSchema,
        {
          kind: 'struct',
          fields: [
            ['token_addresses', ['pubkey']],
            ['token_amounts', ['u64']],
            ['token_ids', ['u64']],
            ['item_ids', ['u16']],
            ['purported_signer', 'pubkey'],
            ['to', 'pubkey'],
            ['nonce', 'u64'],
            ['expiry', 'u64'],
            ['request_id', 'string'],
          ],
        },
      ],
    ]);

    const message = serialize(schema, new ItemDataSchema(itemData));

    // Sign the message with the authorized signer
    const signature = nacl.sign.detached(message, authority.secretKey);

    payment.meta.signedData = Array.from(signature);
  }

  async processPayments(
    input: RouterInput['processPayments'],
    ctx: RouterContext
  ): Promise<RouterOutput['processPayments']> {
    console.log('Profile.Service.processPayments', input);

    const banList = [
      '0x3c261982d5721eeb91f23fa573a1d883118f7473',
      '0x92153ac2f8172ed736ed8b09df917f65e7a587b6',
      '0x2a6ec632d61a3726e5bf8882a39596b2cb6e75c3',
      '0x63b6643276c704933b3cf5adb1677466b4bae2f7',
      '0xf37e0370877739b643a83ed46358011f434fdb14',
      '0x08e5f31d6d2255222c234f1ab7ab0dfdb8225a3e',
      '0x7e351f42c33d2e3e342f66fa67da1b71a86f6e50',
      '0x180961cb73ba789f9e078ae0f5cf35dae0449490',
      '0x01b446e7c93d7acb5caa41e22d5ab257867eda2c',
      '0x1f1bd54ecae5f400bddba27bf079ed44f181df4a',
      '0xc6e18f15b6386540d58c5ee414ef4766fdf3f45f',
      '0x6062329fd2f2d6437c723d05c00215d9c339f03f',
      '0x5008276ae16e7287c56630ce269724af893c2f44',
      '0x04919f45b95dd0ac6e8a6fc52b1a57d6108d6f61',
      '0xe339454722d68696fc78ebcf6f858005ee489f13',
      '0x12333aba4243e1f99a3f09b5cefef98ddbe442ff',
      '0x92a556cef6ffd02f15983ba90f8d4a336d41e1de',
      '0x227ad0e0d3834c3c036c4fcab6dff6d8ff8a5d1b',
      '0x9a69400865fa141040d45a126a45ee6b6655c578',
      '0xf37e0370877739b643a83ed46358011f434fdb14',
      '0x419c59f3fe3cd4ad6344a112ae005c04219dd495',
      '0x1d984fd2af11da709ffbc5c76df4604647f77030',
      '0x92153ac2f8172ed736ed8b09df917f65e7a587b6',
      '0x3c261982d5721eeb91f23fa573a1d883118f7473',
      '0x6b6fb8d96bd2ddcb09ea8529b6070408dc334a6d',
      '0xc84ce216fef4ec8957bd0fb966bb3c3e2c938082',
      '0xb0c8a8503c114e101248d2fdf401a36423116cb2',
      '0x11f36b4166815bacc110c3af3f910e3c03ec8bf5',
      '0x69cb24da962f70ea452c14f3b0fae35ebf0afe04',
      '0x18e62da83931a24151856e39da75862e1ce723f1',
      '0xe041d38f2c48315fd9bbe63f6e6ef4d07b00c46c',
      '0xa1f610a78e2df017adeec80a618ce6a60d9f113b',
      '0xd973812e8c327a8c5a0dafc200f9b73fd86dc352',
      '0x101b680f6c87ab5ca72d4e25f770ee7f9257c21e',
      '0xf6c80422a9d7d20992bf042aa9ab21af86bd7e70',
      '0xbae1754a1e80cf4a7ac344ea4a6560bf6fb32dad',
      '0x9d1d5a42c7d842bd1ebe525576fec84bd963b868',
      '0xe1cdef10655bb49175847d039e20b907e092254b',
      '0xceec48bb1377c6b5a1f0df99c8060b01986e7496',
      '0x1f647fdff890089bb9157e626fb2263ffae90585',
      '0xfe5e35ff26dbd5666072cc98570074aadbcf10eb',
      '0x9568b75583b42bd2fabfa3e11b5dd28035eeac51',
      '0x93fa31ab82db283295a0cb72dfd447264acda407',
      '0x3780db47c9663d2b17447c814436f40fda2378d6',
      '0xa205b1ed9754bb9b66b39282a918ccca00af3d38',
      '0x272012a0253bf90263037e7c72dace0349334762',
      '0xb17373a4342dac4abfef7f378a2960e4c297becd',
      '0x27e3717ba664ca97da86177705eb8efb02610be6',
      '0x63513545e403878249ddc07dd6711a7ab1ef7867',
      '0xc964eb11ebbefaf8a7e4a1953fa8cee1d31fc27c',
      '0x32ea1081d93834367584b7bf661c51fe93cc52af',
      '0x6f42dbb23389fb8cb33a1a9dc8a16073961f5a8a',
      '0x472a375ea5d7067c4cf89c4e00ba9c49aedf4db3',
      '0xe50706c991544cafe35de4b58342598381ba6b21',
      '0x2711997db0f84220cf479bda03d99440cdbf1dab',
      '0x8aeedc8d20a349736940cff5aa6ced3bc7ccbf8f',
    ];

    const session = await ctx.app.db.mongoose.startSession();
    session.startTransaction();

    const payments = await ctx.app.model.Payment.find({ status: 'Processing' }).populate('owner');

    const totals = {};

    for (const payment of payments) {
      console.log('Payment to: ' + payment.meta.to);

      for (const i in payment.meta.tokenAddresses) {
        const address = payment.meta.tokenAddresses[i];
        const key = contractAddressToKey[address];

        if (!totals[key]) totals[key] = 0;
        totals[key] += payment.meta.tokenAmounts[i];
      }

      console.log('Totals: ', totals);
    }

    // await awaitEnter('Approve?');
    // return;

    for (const payment of payments) {
      try {
        if (banList.includes(payment.owner.address.toLowerCase())) {
          payment.owner.meta.rewards = {};
          // await payment.owner.save();

          payment.status = 'Denied';
          await payment.save();

          continue;
        }

        const problem = isClaimProblem(payment);
        if (problem) throw new Error(problem);

        if (!payment.meta.network) payment.meta.network = 'bsc';

        if (payment.meta.network === 'bsc') {
          this.processBinanceSmartChainPayment(payment, ctx);
        } else if (payment.meta.network === 'solana') {
          this.processSolanaPayment(payment, ctx);
        }

        const profile = await ctx.app.model.Profile.findOne({ _id: payment.ownerId });

        profile.meta = payment.owner.meta;

        await profile.save();

        await ctx.app.model.Payment.updateMany({ ownerId: payment.ownerId }, { $set: { status: 'Voided' } });

        // payment.owner.meta = ctx.client.profile.meta;
        payment.status = 'Processed';

        payment.markModified('meta');

        await payment.save();

        await session.commitTransaction();
      } catch (e) {
        payment.status = 'Failed';
        await payment.save();

        await session.abortTransaction();
        throw e;
      } finally {
        session.endSession();
      }
    }
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

    const game = await ctx.app.model.Game.findOne({ key: 'evolution-isles' }).exec();

    if (input.round.id !== game.meta.roundId) throw new Error('Invalid Round ID');

    const session = await ctx.app.db.mongoose.startSession();
    session.startTransaction();

    const gameRound = await ctx.app.model.GameRound.create({ gameId: game.id, meta: input.round });

    try {
      game.meta = {
        ...game.meta,
        clientCount: input.round.clients.length,
        roundId: generateShortId(),
      };

      if (!game.meta.rewards.tokens)
        game.meta.rewards.tokens = [
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

      game.markModified('data');

      await game.save();

      const res = {
        roundId: game.meta.roundId,
      };

      if (input.round.clients.length === 0) {
        console.log('No clients. Round skipped.');

        return res;
      }

      const rewardWinnerMap = {
        0: Math.round(game.meta.rewardWinnerAmount * 1 * 1000) / 1000,
        1: Math.round(game.meta.rewardWinnerAmount * 0.25 * 1000) / 1000,
        2: Math.round(game.meta.rewardWinnerAmount * 0.15 * 1000) / 1000,
        3: Math.round(game.meta.rewardWinnerAmount * 0.05 * 1000) / 1000,
        4: Math.round(game.meta.rewardWinnerAmount * 0.05 * 1000) / 1000,
        5: Math.round(game.meta.rewardWinnerAmount * 0.05 * 1000) / 1000,
        6: Math.round(game.meta.rewardWinnerAmount * 0.05 * 1000) / 1000,
        7: Math.round(game.meta.rewardWinnerAmount * 0.05 * 1000) / 1000,
        8: Math.round(game.meta.rewardWinnerAmount * 0.05 * 1000) / 1000,
        9: Math.round(game.meta.rewardWinnerAmount * 0.05 * 1000) / 1000,
      };

      const winners = input.round.clients
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
            // if (pickup.quantity > input.round.clients.length * game.meta.rewardItemAmountPerLegitPlayer * 2) {
            //   log(
            //     pickup.quantity,
            //     game.meta.rewardItemAmountPerLegitPlayer,
            //     input.round.clients.length,
            //     JSON.stringify(input.round.clients)
            //   );
            //   throw new Error('Big problem with item reward amount');
            // }

            // if (pickup.quantity > input.round.clients.length * game.meta.rewardItemAmountMax) {
            //   log(pickup.quantity, input.round.clients.length, game.meta.rewardItemAmountMax);
            //   throw new Error('Big problem with item reward amount 2');
            // }

            const tokenSymbol = pickup.rewardItemName.toLowerCase();

            if (!game.meta.rewards.tokens.find((t) => t.symbol === tokenSymbol)) {
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

            // game.meta.rewards.tokens[tokenSymbol.toLowerCase()] -= pickup.quantity

            // app.db.mongoose.oracle.outflow.evolutionRewards.tokens.week[tokenSymbol.toLowerCase()] += pickup.quantity
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

      await session.commitTransaction();

      return res;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
