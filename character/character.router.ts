// module/character.router.ts

import { z as zod } from 'zod';
import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
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

export const createRouter = () =>
  router({
    getCharacterInventory: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Character.getCharacterInventory as any)(input, ctx)),

    setActiveCharacter: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Character.setActiveCharacter as any)(input, ctx)),

    exchangeCharacterItem: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          characterId: z.string(),
          itemId: z.string(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Character.exchangeCharacterItem as any)(input, ctx)),

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

    getCharacterAbility: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAbility))
      .output(CharacterAbility)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterAbility as any)(input, ctx)),

    createCharacterAbility: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAbility))
      .output(CharacterAbility.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterAbility as any)(input, ctx)),

    updateCharacterAbility: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAbility))
      .output(CharacterAbility.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterAbility as any)(input, ctx)),

    getCharacterAttribute: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAttribute))
      .output(CharacterAttribute)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterAttribute as any)(input, ctx)),

    createCharacterAttribute: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterAttribute))
      .output(CharacterAttribute.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterAttribute as any)(input, ctx)),

    updateCharacterAttribute: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Character))
      .output(Character.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterAttribute as any)(input, ctx)),

    getCharacterType: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterType))
      .output(CharacterType)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterType as any)(input, ctx)),

    createCharacterType: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterType))
      .output(CharacterType.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterType as any)(input, ctx)),

    updateCharacterType: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterType))
      .output(CharacterType.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterType as any)(input, ctx)),

    getCharacterClass: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterClass))
      .output(CharacterClass)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterClass as any)(input, ctx)),

    createCharacterClass: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterClass))
      .output(CharacterClass.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterClass as any)(input, ctx)),

    updateCharacterClass: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterClass))
      .output(CharacterClass.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterClass as any)(input, ctx)),

    getCharacterRace: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Character))
      .output(Character)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterRace as any)(input, ctx)),

    createCharacterRace: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterRace))
      .output(CharacterRace.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterRace as any)(input, ctx)),

    updateCharacterRace: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterRace))
      .output(CharacterRace.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterRace as any)(input, ctx)),

    getCharacterGender: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterGender))
      .output(CharacterGender)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterGender as any)(input, ctx)),

    createCharacterGender: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterGender))
      .output(CharacterGender.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterGender as any)(input, ctx)),

    updateCharacterGender: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Character))
      .output(Character.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterGender as any)(input, ctx)),

    getCharacterPersonality: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterPersonality))
      .output(CharacterPersonality)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterPersonality as any)(input, ctx)),

    createCharacterPersonality: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterPersonality))
      .output(CharacterPersonality.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterPersonality as any)(input, ctx)),

    updateCharacterPersonality: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterPersonality))
      .output(CharacterPersonality.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterPersonality as any)(input, ctx)),

    getCharacterTitle: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterTitle))
      .output(CharacterTitle)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterTitle as any)(input, ctx)),

    createCharacterTitle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterTitle))
      .output(CharacterTitle.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterTitle as any)(input, ctx)),

    updateCharacterTitle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterTitle))
      .output(CharacterTitle.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterTitle as any)(input, ctx)),

    getCharacterFaction: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(CharacterFaction)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterFaction as any)(input, ctx)),

    getCharacterFactions: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(z.array(CharacterFaction))
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterFactions as any)(input, ctx)),

    createCharacterFaction: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(CharacterFaction.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterFaction as any)(input, ctx)),

    updateCharacterFaction: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterFaction))
      .output(CharacterFaction.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterFaction as any)(input, ctx)),

    getCharacterNameChoice: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterNameChoice))
      .output(CharacterNameChoice)
      .query(({ input, ctx }) => (ctx.app.service.Character.getCharacterNameChoice as any)(input, ctx)),

    createCharacterNameChoice: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterNameChoice))
      .output(CharacterNameChoice.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.createCharacterNameChoice as any)(input, ctx)),

    updateCharacterNameChoice: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(CharacterNameChoice))
      .output(CharacterNameChoice.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Character.updateCharacterNameChoice as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
