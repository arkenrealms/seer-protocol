// module/character.router.ts

import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { createWarpTrpcBindings } from '../core/warpspeed';
import {
  Character,
  CharacterAbility,
  CharacterAttribute,
  CharacterType,
  CharacterClass,
  CharacterRace,
  CharacterGender,
  CharacterPersonality,
  CharacterTitle,
  CharacterFaction,
  CharacterNameChoice,
} from './character.schema';
import { Query, getQueryInput, inferRouterOutputs, inferRouterInputs } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;
const warp = createWarpTrpcBindings(procedure, { serviceName: 'Character' });

const characterInventoryPatchValueSchema = z.object({
  itemKey: z.string().optional(),
  itemId: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  qty: z.number().int().positive().optional(),
  x: z.number().int().nonnegative().optional(),
  y: z.number().int().nonnegative().optional(),
});

const characterInventoryPatchOpSchema = z.union([
  z.object({
    op: z.enum(['add', 'remove']),
    itemKey: z.string().optional(),
    itemId: z.string().optional(),
    quantity: z.number().int().positive().optional(),
    qty: z.number().int().positive().optional(),
    x: z.number().int().nonnegative().optional(),
    y: z.number().int().nonnegative().optional(),
  }),
  z.object({
    op: z.literal('move'),
    itemKey: z.string().optional(),
    itemId: z.string().optional(),
    x: z.number().int().nonnegative().optional(),
    y: z.number().int().nonnegative().optional(),
  }),
  z.object({
    op: z.literal('push'),
    key: z.string().optional(),
    value: characterInventoryPatchValueSchema.optional(),
  }),
]);

const exchangeCharacterItemInputSchema = z
  .object({
    characterId: z.string(),
    itemId: z.string().optional(),
    itemKey: z.string().optional(),
    quantity: z.number().int().positive().default(1),
  })
  .refine((value) => Boolean(value.itemId || value.itemKey), {
    message: 'itemId or itemKey is required',
    path: ['itemId'],
  });

const syncCharacterInventoryInputSchema = z.union([
  z.object({
    characterId: z.string(),
    mode: z.literal('patch'),
    ops: z.array(
      z.object({
        op: z.enum(['add', 'remove']),
        itemKey: z.string(),
        quantity: z.number().int().positive().optional(),
      })
    ),
    reason: z.string().optional(),
  }),
  z.object({
    characterId: z.string(),
    mode: z.literal('refresh'),
    reason: z.string().optional(),
  }),
]);

export const createRouter = () =>
  router({
    getCharacterInventory: warp
      .view('character.getCharacterInventory')
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
        })
      )
      .output(
        z.object({
          characterId: z.string(),
          inventory: z.any(),
        })
      )
      .mutation(),

    getCharacterInventoryReceipt: warp
      .view('character.getCharacterInventoryReceipt')
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
        })
      )
      .output(
        z.object({
          version: z.literal(1),
          verificationMode: z.literal('audited'),
          tableName: z.literal('characterInventoryItems'),
          characterId: z.string(),
          rowCount: z.number().int().nonnegative(),
          nextRecordPk: z.number().int().positive(),
          receiptHash: z.string().min(1),
          exportHash: z.string().min(1),
          updatedDate: z.string().min(1),
        })
      )
      .query(),

    getCharacterInventoryAuditExport: warp
      .view('character.getCharacterInventoryAuditExport')
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
        })
      )
      .output(
        z.object({
          receipt: z.object({
            version: z.literal(1),
            verificationMode: z.literal('audited'),
            tableName: z.literal('characterInventoryItems'),
            characterId: z.string(),
            rowCount: z.number().int().nonnegative(),
            nextRecordPk: z.number().int().positive(),
            receiptHash: z.string().min(1),
            exportHash: z.string().min(1),
            updatedDate: z.string().min(1),
          }),
          exportHash: z.string().min(1),
          publication: z.object({
            publisherId: z.string().min(1),
            publishedAt: z.string().min(1),
            publicationHash: z.string().min(1),
            exportHash: z.string().min(1),
            receiptHash: z.string().min(1),
          }),
          inventory: z.any(),
          rows: z.array(
            z.object({
              recordPk: z.number().int().positive(),
              recordId: z.string().min(1),
              characterId: z.string(),
              bagIndex: z.number().int().nonnegative(),
              slotIndex: z.number().int().nonnegative(),
              itemId: z.string().optional(),
              itemKey: z.string().optional(),
              quantity: z.number().int().positive(),
              hasExplicitQuantity: z.boolean(),
              item: z.any(),
              rowHash: z.string().min(1),
            })
          ),
        })
      )
      .query(),

    syncCharacterInventory: warp
      .reducer('character.syncCharacterInventory')
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(syncCharacterInventoryInputSchema)
      .output(
        z.object({
          characterId: z.string(),
          inventory: z.any(),
        })
      )
      .mutation(),

    applyCharacterInventoryPatch: warp
      .reducer('character.applyCharacterInventoryPatch')
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
          ops: z.array(characterInventoryPatchOpSchema),
        })
      )
      .output(
        z.object({
          characterId: z.string(),
          inventory: z.any(),
        })
      )
      .mutation(),

    setActiveCharacter: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Character.setActiveCharacter as any)(input, ctx)),

    exchangeCharacterItem: warp
      .reducer('character.exchangeCharacterItem')
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(exchangeCharacterItemInputSchema)
      .output(
        z.object({
          characterId: z.string(),
          inventory: z.any(),
        })
      )
      .mutation(),

    getCharacterData: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Character))
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterData as any)(input, ctx)),

    getCharacter: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Character))
      // .output(Character)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacter as any)(input, ctx)),

    getCharacters: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Character))
      // .output(z.array(Character))
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacters as any)(input, ctx)),

    saveCharacters: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(z.array(Character), { partialData: false }))
      // .output(z.array(Character.pick({ id: true })))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.saveCharacters as any)(input, ctx)),

    updateCharacter: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Character))
      .output(Character.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacter as any)(input, ctx)),

    getCharacterAbility: warp
      .view('character.getCharacterAbility')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAbility))
      .output(CharacterAbility)
      .query(),

    createCharacterAbility: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAbility))
      .output(CharacterAbility.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterAbility as any)(input, ctx)),

    updateCharacterAbility: warp
      .reducer('character.updateCharacterAbility')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAbility))
      .output(CharacterAbility.pick({ id: true }))
      .mutation(),

    getCharacterAttribute: warp
      .view('character.getCharacterAttribute')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAttribute))
      .output(CharacterAttribute)
      .query(),

    createCharacterAttribute: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAttribute))
      .output(CharacterAttribute.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterAttribute as any)(input, ctx)),

    updateCharacterAttribute: warp
      .reducer('character.updateCharacterAttribute')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAttribute))
      .output(CharacterAttribute.pick({ id: true }))
      .mutation(),

    getCharacterType: warp
      .view('character.getCharacterType')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterType))
      .output(CharacterType)
      .query(),

    createCharacterType: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterType))
      .output(CharacterType.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterType as any)(input, ctx)),

    updateCharacterType: warp
      .reducer('character.updateCharacterType')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterType))
      .output(CharacterType.pick({ id: true }))
      .mutation(),

    getCharacterClass: warp
      .view('character.getCharacterClass')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterClass))
      .output(CharacterClass)
      .query(),

    createCharacterClass: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterClass))
      .output(CharacterClass.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterClass as any)(input, ctx)),

    updateCharacterClass: warp
      .reducer('character.updateCharacterClass')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterClass))
      .output(CharacterClass.pick({ id: true }))
      .mutation(),

    getCharacterRace: warp
      .view('character.getCharacterRace')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterRace))
      .output(CharacterRace)
      .query(),

    createCharacterRace: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterRace))
      .output(CharacterRace.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterRace as any)(input, ctx)),

    updateCharacterRace: warp
      .reducer('character.updateCharacterRace')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterRace))
      .output(CharacterRace.pick({ id: true }))
      .mutation(),

    getCharacterGender: warp
      .view('character.getCharacterGender')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterGender))
      .output(CharacterGender)
      .query(),

    createCharacterGender: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterGender))
      .output(CharacterGender.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterGender as any)(input, ctx)),

    updateCharacterGender: warp
      .reducer('character.updateCharacterGender')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterGender))
      .output(CharacterGender.pick({ id: true }))
      .mutation(),

    getCharacterPersonality: warp
      .view('character.getCharacterPersonality')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterPersonality))
      .output(CharacterPersonality)
      .query(),

    createCharacterPersonality: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterPersonality))
      .output(CharacterPersonality.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterPersonality as any)(input, ctx)),

    updateCharacterPersonality: warp
      .reducer('character.updateCharacterPersonality')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterPersonality))
      .output(CharacterPersonality.pick({ id: true }))
      .mutation(),

    getCharacterTitle: warp
      .view('character.getCharacterTitle')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterTitle))
      .output(CharacterTitle)
      .query(),

    createCharacterTitle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterTitle))
      .output(CharacterTitle.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterTitle as any)(input, ctx)),

    updateCharacterTitle: warp
      .reducer('character.updateCharacterTitle')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterTitle))
      .output(CharacterTitle.pick({ id: true }))
      .mutation(),

    getCharacterFaction: warp
      .view('character.getCharacterFaction')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(CharacterFaction)
      .query(),

    getCharacterFactions: warp
      .view('character.getCharacterFactions')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(z.array(CharacterFaction))
      .query(),

    createCharacterFaction: warp
      .reducer('character.createCharacterFaction')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(CharacterFaction.pick({ id: true }))
      .mutation(),

    updateCharacterFaction: warp
      .reducer('character.updateCharacterFaction')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(CharacterFaction.pick({ id: true }))
      .mutation(),

    getCharacterNameChoice: warp
      .view('character.getCharacterNameChoice')
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterNameChoice))
      .output(CharacterNameChoice)
      .query(),

    createCharacterNameChoice: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterNameChoice))
      .output(CharacterNameChoice.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterNameChoice as any)(input, ctx)),

    updateCharacterNameChoice: warp
      .reducer('character.updateCharacterNameChoice')
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterNameChoice))
      .output(CharacterNameChoice.pick({ id: true }))
      .mutation(),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
