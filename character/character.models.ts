import * as mongo from '../util/mongo';
import type * as Types from './character.types';

const { addTagVirtuals, addApplicationVirtual } = mongo;

// CharacterEquipment Schema
const CharacterEquipment = new mongo.Schema(
  {
    items: [
      {
        itemId: { type: mongo.Schema.Types.ObjectId, ref: 'Item', required: true },
        slotId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemSlot', required: true }, // e.g., 'head', 'chest', etc.
      },
    ],
  },
  {
    _id: false,
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON responses
    toObject: { virtuals: true }, // Ensure virtuals are included in object responses
  } // Prevents Mongoose from creating an _id field for subdocuments
);

// Add virtual for `item`
CharacterEquipment.virtual('item', {
  ref: 'Item',
  localField: 'items.itemId',
  foreignField: '_id',
  justOne: true, // Assuming an `itemId` corresponds to one `Item`
});

// Add virtual for `slot`
CharacterEquipment.virtual('slot', {
  ref: 'ItemSlot',
  localField: 'items.slotId',
  foreignField: '_id',
  justOne: true, // Assuming a `slotId` corresponds to one `ItemSlot`
});

// CharacterInventory Schema
const CharacterInventory = new mongo.Schema(
  {
    items: [
      {
        itemId: { type: mongo.Schema.Types.ObjectId, ref: 'Item', required: true },
        x: { type: Number },
        y: { type: Number },
      },
    ],
  },
  { _id: false }
);

// Add virtual for `item`
CharacterEquipment.virtual('item', {
  ref: 'Item',
  localField: 'items.itemId',
  foreignField: '_id',
  justOne: true, // Assuming an `itemId` corresponds to one `Item`
});

export const Character = mongo.createModel<Types.CharacterDocument>(
  'Character',
  {
    // teamId: { type: mongo.Schema.Types.ObjectId, ref: 'Team', required: false, autopopulate: true },
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating', required: false },
    classId: { type: mongo.Schema.Types.ObjectId, ref: 'CharacterClass', required: false },
    raceId: { type: mongo.Schema.Types.ObjectId, ref: 'CharacterRace', required: false },
    factionId: { type: mongo.Schema.Types.ObjectId, ref: 'CharacterFaction', required: false },
    genderId: { type: mongo.Schema.Types.ObjectId, ref: 'CharacterGender', required: false },
    guildId: { type: mongo.Schema.Types.ObjectId, ref: 'CharacterGuild', required: false },
    isPrimary: { type: Boolean, required: false, default: false },
    isBoss: { type: Boolean, required: false, default: false },
    token: { type: String, required: false, trim: true },
    points: { type: Number, default: 0, required: true },
    equipmentIndex: { type: Number, default: 0 },
    equipment: [{ type: CharacterEquipment, default: [] }],
    inventoryIndex: { type: Number, default: 0 },
    inventory: [{ type: CharacterInventory, default: [] }],
    energyIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'Energy', required: false }],
    areaIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'Area', required: false }],
    typeIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'CharacterType', required: false }],
    itemMaterialIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'ItemMaterial', required: false }],
    // level: { type: Number, required: true },
    // experience: { type: Number, required: true },
    // gold: { type: Number, default: 0 },
  },
  {
    extend: 'EntityFields',
    cache: { enabled: true, ttlMs: 5 * 60 * 1000 },
    indexes: [{ points: 1 }, { token: 1 }],
    virtuals: [
      ...addTagVirtuals('Character'),
      ...addApplicationVirtual(),
      // {
      //   name: 'team',
      // },
      {
        name: 'energies',
        ref: 'Energy',
        localField: 'energyIds',
        foreignField: '_id',
      },
      {
        name: 'areas',
        ref: 'Area',
        localField: 'areaIds',
        foreignField: '_id',
      },
      {
        name: 'types',
        ref: 'CharacterType',
        localField: 'typeIds',
        foreignField: '_id',
      },
      {
        name: 'itemMaterials',
        ref: 'ItemMaterial',
        localField: 'itemMaterialIds',
        foreignField: '_id',
      },
      {
        name: 'profile',
      },
      {
        name: 'rating',
      },
      {
        name: 'class',
      },
      {
        name: 'race',
      },
      {
        name: 'faction',
      },
      {
        name: 'gender',
      },
      // { name: 'types', ref: 'CharacterType', localField: '_id', foreignField: 'characterId' },
      // {
      //   name: 'inventory'
      //   ref: 'ItemSlot',
      //   localField: 'items.slotId',
      //   foreignField: '_id',
      //   justOne: true, // Assuming a `slotId` corresponds to one `ItemSlot`
      // },
      // {
      //   name: 'quests'
      // },
    ],
  }
);

export const CharacterAbility = mongo.createModel<Types.CharacterAbilityDocument>('CharacterAbility', {});

export const CharacterAttribute = mongo.createModel<Types.CharacterAttributeDocument>('CharacterAttribute', {});

export const CharacterType = mongo.createModel<Types.CharacterTypeDocument>('CharacterType', {});

export const CharacterClass = mongo.createModel<Types.CharacterClassDocument>('CharacterClass', {});

export const CharacterFaction = mongo.createModel<Types.CharacterFactionDocument>('CharacterFaction', {});

export const CharacterRace = mongo.createModel<Types.CharacterRaceDocument>('CharacterRace', {});

export const CharacterGender = mongo.createModel<Types.CharacterGenderDocument>('CharacterGender', {});

export const CharacterPersonality = mongo.createModel<Types.CharacterPersonalityDocument>('CharacterPersonality', {});

export const CharacterTitle = mongo.createModel<Types.CharacterTitleDocument>('CharacterTitle', {});

export const CharacterGuild = mongo.createModel<Types.CharacterGuildDocument>('CharacterGuild', {});

export const CharacterNameChoice = mongo.createModel<Types.CharacterNameChoiceDocument>('CharacterNameChoice', {});
