import { z } from 'zod';
import * as schema from './character.schema';
import { Document, Model } from '../util/mongo';

export type * from './character.router';
export type { RouterContext } from '../types';

export type Character = z.infer<typeof schema.Character>;
export type CharacterDocument = Character & Document;

export type CharacterEquipment = z.infer<typeof schema.CharacterEquipment>;
export type CharacterEquipmentDocument = CharacterEquipment & Document;

export type CharacterInventory = z.infer<typeof schema.CharacterInventory>;
export type CharacterInventoryDocument = CharacterInventory & Document;

export type CharacterAbility = z.infer<typeof schema.CharacterAbility>;
export type CharacterAbilityDocument = CharacterAbility & Document;

export type CharacterAttribute = z.infer<typeof schema.CharacterAttribute>;
export type CharacterAttributeDocument = CharacterAttribute & Document;

export type CharacterClass = z.infer<typeof schema.CharacterClass>;
export type CharacterClassDocument = CharacterClass & Document;

export type CharacterFaction = z.infer<typeof schema.CharacterFaction>;
export type CharacterFactionDocument = CharacterFaction & Document;

export type CharacterGender = z.infer<typeof schema.CharacterGender>;
export type CharacterGenderDocument = CharacterGender & Document;

export type CharacterNameChoice = z.infer<typeof schema.CharacterNameChoice>;
export type CharacterNameChoiceDocument = CharacterNameChoice & Document;

export type CharacterPersonality = z.infer<typeof schema.CharacterPersonality>;
export type CharacterPersonalityDocument = CharacterPersonality & Document;

export type CharacterRace = z.infer<typeof schema.CharacterRace>;
export type CharacterRaceDocument = CharacterRace & Document;

export type CharacterTitle = z.infer<typeof schema.CharacterTitle>;
export type CharacterTitleDocument = CharacterTitle & Document;

export type CharacterType = z.infer<typeof schema.CharacterType>;
export type CharacterTypeDocument = CharacterType & Document;

export type CharacterGuild = z.infer<typeof schema.CharacterGuild>;
export type CharacterGuildDocument = CharacterGuild & Document;

export type Mappings = {
  Character: Model<CharacterDocument>;
  CharacterAbility: Model<CharacterAbilityDocument>;
  CharacterAttribute: Model<CharacterAttributeDocument>;
  CharacterClass: Model<CharacterClassDocument>;
  CharacterFaction: Model<CharacterFactionDocument>;
  CharacterGender: Model<CharacterGenderDocument>;
  CharacterNameChoice: Model<CharacterNameChoiceDocument>;
  CharacterPersonality: Model<CharacterPersonalityDocument>;
  CharacterRace: Model<CharacterRaceDocument>;
  CharacterTitle: Model<CharacterTitleDocument>;
  CharacterType: Model<CharacterTypeDocument>;
  CharacterGuild: Model<CharacterGuildDocument>;
};
