// module/character.schema.ts

import { z, ObjectId, Entity } from '../schema';
import { Item } from '../item/item.schema';

const CharacterEquipmentFields = z.object({
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
});

const CharacterEquipmentSchema = Entity.merge(CharacterEquipmentFields);

export const CharacterEquipment: typeof CharacterEquipmentSchema =
  CharacterEquipmentSchema;

export const CharacterInventory = Entity.merge(
  z.object({
    characterId: ObjectId,
    items: z.array(Item).default([]),
  })
);

export const CharacterInventoryItem = Entity.merge(
  z.object({
    characterId: ObjectId,
    recordPk: z.number().int().positive(),
    recordId: z.string().min(1),
    bagIndex: z.number().int().nonnegative().default(0),
    slotIndex: z.number().int().nonnegative().default(0),
    itemId: ObjectId.optional(),
    itemKey: z.string().min(1).optional(),
    quantity: z.number().int().positive().default(1),
    hasExplicitQuantity: z.boolean().default(false),
    item: z.any().optional(),
    audit: z
      .object({
        version: z.literal(1),
        verificationMode: z.literal('audited'),
        tableName: z.literal('characterInventoryItems'),
        characterId: ObjectId,
        rowCount: z.number().int().nonnegative(),
        nextRecordPk: z.number().int().positive(),
        receiptHash: z.string().min(1),
        exportHash: z.string().min(1),
        updatedDate: z.string().min(1),
      })
      .optional(),
  })
);

export const CharacterInventoryReceipt = Entity.merge(
  z.object({
    characterId: ObjectId,
    version: z.literal(1),
    verificationMode: z.literal('audited'),
    tableName: z.literal('characterInventoryItems'),
    rowCount: z.number().int().nonnegative(),
    nextRecordPk: z.number().int().positive(),
    receiptHash: z.string().min(1),
    exportHash: z.string().min(1),
    updatedDate: z.string().min(1),
  })
);

const CharacterFields = z.object({
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
});

const CharacterSchema = Entity.merge(CharacterFields);

// Character schema
export const Character: typeof CharacterSchema = CharacterSchema;

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
