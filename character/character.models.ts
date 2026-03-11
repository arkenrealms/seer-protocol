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

export const CharacterInventoryItem = mongo.createModel<Types.CharacterInventoryItemDocument>(
  'CharacterInventoryItem',
  {
    characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character', required: true },
    recordPk: { type: Number, required: true },
    recordId: { type: String, required: true, trim: true },
    bagIndex: { type: Number, required: true, default: 0 },
    slotIndex: { type: Number, required: true, default: 0 },
    itemId: { type: mongo.Schema.Types.ObjectId, ref: 'Item', required: false },
    itemKey: { type: String, required: false, trim: true },
    quantity: { type: Number, required: true, default: 1 },
    hasExplicitQuantity: { type: Boolean, required: true, default: false },
    item: { type: mongo.Schema.Types.Mixed, required: false },
    audit: {
      version: { type: Number, required: false },
      verificationMode: { type: String, required: false, trim: true },
      tableName: { type: String, required: false, trim: true },
      characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character', required: false },
      rowCount: { type: Number, required: false },
      nextRecordPk: { type: Number, required: false },
      receiptHash: { type: String, required: false, trim: true },
      exportHash: { type: String, required: false, trim: true },
      updatedDate: { type: String, required: false, trim: true },
    },
  },
  {
    extend: 'EntityFields',
    cache: { enabled: true, ttlMs: 5 * 60 * 1000 },
    indexes: [
      { characterId: 1, recordPk: 1, unique: true },
      { characterId: 1, recordId: 1, unique: true },
      { recordId: 1, unique: true },
    ],
    virtuals: [
      ...addApplicationVirtual(),
      {
        name: 'character',
        ref: 'Character',
        localField: 'characterId',
        foreignField: '_id',
        justOne: true,
      },
      {
        name: 'itemRef',
        ref: 'Item',
        localField: 'itemId',
        foreignField: '_id',
        justOne: true,
      },
    ],
  }
);

export const CharacterInventoryReceipt = mongo.createModel<Types.CharacterInventoryReceiptDocument>(
  'CharacterInventoryReceipt',
  {
    characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character', required: true },
    version: { type: Number, required: true },
    verificationMode: { type: String, required: true, trim: true },
    tableName: { type: String, required: true, trim: true },
    rowCount: { type: Number, required: true },
    nextRecordPk: { type: Number, required: true },
    receiptHash: { type: String, required: true, trim: true },
    exportHash: { type: String, required: true, trim: true },
    updatedDate: { type: String, required: true, trim: true },
  },
  {
    extend: 'EntityFields',
    cache: { enabled: true, ttlMs: 5 * 60 * 1000 },
    indexes: [{ characterId: 1, unique: true }, { receiptHash: 1 }, { exportHash: 1 }],
    virtuals: [
      ...addApplicationVirtual(),
      {
        name: 'character',
        ref: 'Character',
        localField: 'characterId',
        foreignField: '_id',
        justOne: true,
      },
    ],
  }
);

export const CharacterInventoryPublication = mongo.createModel<Types.CharacterInventoryPublicationDocument>(
  'CharacterInventoryPublication',
  {
    characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character', required: true },
    version: { type: Number, required: true },
    verificationMode: { type: String, required: true, trim: true },
    tableName: { type: String, required: true, trim: true },
    rowCount: { type: Number, required: true },
    merkleRoot: { type: String, required: true, trim: true },
    updatedDate: { type: String, required: true, trim: true },
    publisherId: { type: String, required: true, trim: true },
    publishedAt: { type: String, required: true, trim: true },
    publicationHash: { type: String, required: true, trim: true },
    exportHash: { type: String, required: true, trim: true },
    receiptHash: { type: String, required: true, trim: true },
    signatureMaterial: {
      algorithm: { type: String, required: true, trim: true },
      signerId: { type: String, required: true, trim: true },
      payload: { type: String, required: true, trim: true },
      payloadHash: { type: String, required: true, trim: true },
    },
  },
  {
    extend: 'EntityFields',
    cache: { enabled: true, ttlMs: 5 * 60 * 1000 },
    indexes: [{ characterId: 1, unique: true }, { publicationHash: 1 }, { exportHash: 1 }, { receiptHash: 1 }],
    virtuals: [
      ...addApplicationVirtual(),
      {
        name: 'character',
        ref: 'Character',
        localField: 'characterId',
        foreignField: '_id',
        justOne: true,
      },
    ],
  }
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
