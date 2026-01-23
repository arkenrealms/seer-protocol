// module/character.schema.ts

import { z, ObjectId, Entity } from '../schema';
import { Item } from '../item/item.schema';

export const CharacterEquipment = Entity.merge(
  z.object({
    characterId: ObjectId,
    leftHand: Item.optional(),
    rightHand: Item.optional(),
    head: Item.optional(),
    pet: Item.optional(),
    neck: Item.optional(),
    legs: Item.optional(),
    chest: Item.optional(),
    waist: Item.optional(),
    hands: Item.optional(),
    wrists: Item.optional(),
    shoulders: Item.optional(),
    feet: Item.optional(),
    finger1: Item.optional(),
    finger2: Item.optional(),
    trinket1: Item.optional(),
    trinket2: Item.optional(),
    trinket3: Item.optional(),
    body: Item.optional(),
    companion: Item.optional(),
    mount: Item.optional(),
  })
);

export const CharacterInventory = Entity.merge(
  z.object({
    characterId: ObjectId,
    items: z.array(Item).default([]),
  })
);

// Character schema
export const Character = Entity.merge(
  z.object({
    profileId: ObjectId.optional(),
    ratingId: ObjectId.optional(),
    classId: ObjectId.optional(),
    raceId: ObjectId.optional(),
    factionId: ObjectId.optional(),
    genderId: ObjectId.optional(),
    guildId: ObjectId.optional(),
    token: z
      .string()
      .min(1)
      .optional(),
    points: z.number().default(0),
    isPrimary: z.boolean().default(false),
    isBoss: z.boolean().default(false),
    isPlayer: z.boolean().default(false),
    equipmentIndex: z.number().default(0),
    equipment: z.array(CharacterEquipment).default([]),
    inventoryIndex: z.number().default(0),
    inventory: z.array(CharacterInventory).default([]),
    energyIds: z.array(ObjectId).optional(),
    areaIds: z.array(ObjectId).optional(),
    typeIds: z.array(ObjectId).optional(),
    itemMaterialIds: z.array(ObjectId).optional(),
  })
);

// CharacterAbility schema
export const CharacterAbility = Entity.merge(
  z.object({
    // Define fields for CharacterAbility here if needed
  })
);

// CharacterAttribute schema
export const CharacterAttribute = Entity.merge(
  z.object({
    // Define fields for CharacterAttribute here if needed
  })
);

// CharacterType schema
export const CharacterType = Entity.merge(
  z.object({
    // Define fields for CharacterType here if needed
  })
);

// CharacterClass schema
export const CharacterClass = Entity.merge(
  z.object({
    // Define fields for CharacterClass here if needed
  })
);

// CharacterRace schema
export const CharacterRace = Entity.merge(
  z.object({
    npcs: z.array(ObjectId).optional(),
  })
);

// CharacterGender schema
export const CharacterGender = Entity.merge(
  z.object({
    // Define fields for CharacterGender here if needed
  })
);

// CharacterPersonality schema
export const CharacterPersonality = Entity.merge(
  z.object({
    // Define fields for CharacterPersonality here if needed
  })
);

// CharacterTitle schema
export const CharacterTitle = Entity.merge(
  z.object({
    // Define fields for CharacterTitle here if needed
  })
);

// CharacterFaction schema
export const CharacterFaction = Entity.merge(
  z.object({
    shortDescription: z.string(),
    // "npcs": [],
    // "areas": [24, 77],
    // "activeFactionConflict": [9], // CharacterFaction list
    // "passiveFactionConflict": [6], // CharacterFaction list
    // "activeGuildConflict": [], // Team
    // "areaConflict": [], // Area list
    // "characters": [] // Character list
  })
);

// CharacterNameChoice schema
export const CharacterNameChoice = Entity.merge(
  z.object({
    // Define fields for CharacterNameChoice here if needed
  })
);

// CharacterGuild schema
export const CharacterGuild = Entity.merge(
  z.object({
    // Define fields for CharacterGuild here if needed
  })
);
