import * as mongo from '../util/mongo';
import type * as Types from './item.types';

const { addTagVirtuals, addApplicationVirtual } = mongo;

export const Item = mongo.createModel<Types.ItemDocument>(
  'Item',
  {
    token: { type: String, maxlength: 500, minlength: 1, required: true },
    characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character', required: true },
    assetId: { type: mongo.Schema.Types.ObjectId, ref: 'Asset', required: true },
    chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain', required: false },
    materialId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemMaterial', required: false },
    skinId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemSkin', required: false },
    recipeId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemRecipe', required: false },
    typeId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemType', required: false },
    subTypeId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemSubType', required: false },
    specificTypeId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemSpecificType', required: false },
    rarityId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemRarity', required: false },
    rankId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemRank', required: false },
    rankValue: { type: Number, integer: true, min: 0, max: 100, required: false },
    slotIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'ItemSlot', required: false }],
    setId: { type: mongo.Schema.Types.ObjectId, ref: 'ItemSet', required: false },
    attributes: [{ type: mongo.Schema.Types.ObjectId, ref: 'ItemAttribute', required: false }],
    quantity: { type: Number, integer: true, min: 0, default: 1 },
    distribution: { type: String, default: 'Unknown' },
    x: { type: Number, integer: true, min: 0, required: false },
    y: { type: Number, integer: true, min: 0, required: false },
    items: [{ type: mongo.Schema.Types.ObjectId, ref: 'Item', default: [] }],
    capacity: { type: Number, integer: true, min: 0, default: 60 },
    points: { type: Number, integer: true, min: 0, default: 0 },
  },
  {
    extend: 'EntityFields',
    indexes: [{ quantity: 1 }, { points: 1 }, { capacity: 1 }],
    virtuals: [
      ...addTagVirtuals('Item'),
      ...addApplicationVirtual(),
      {
        name: 'character',
      },
      {
        name: 'asset',
      },
      {
        name: 'chain',
      },
      {
        name: 'material',
      },
      {
        name: 'skin',
      },
      {
        name: 'recipe',
      },
      {
        name: 'type',
      },
      {
        name: 'subType',
      },
      {
        name: 'specificType',
      },
      {
        name: 'rarity',
      },
    ],
  }
);

export const ItemAttribute = mongo.createModel<Types.ItemAttributeDocument>('ItemAttribute', {});

export const ItemMaterial = mongo.createModel<Types.ItemMaterialDocument>('ItemMaterial', {});

export const ItemSet = mongo.createModel<Types.ItemSetDocument>('ItemSet', {});

export const ItemSlot = mongo.createModel<Types.ItemSlotDocument>('ItemSlot', {});

export const ItemRarity = mongo.createModel<Types.ItemRarityDocument>('ItemRarity', {});

export const ItemRank = mongo.createModel<Types.ItemRankDocument>('ItemRank', {
  value: { type: Number },
});

export const ItemType = mongo.createModel<Types.ItemTypeDocument>('ItemType', {});

export const ItemSubType = mongo.createModel<Types.ItemSubTypeDocument>('ItemSubType', {});

export const ItemSpecificType = mongo.createModel<Types.ItemSpecificTypeDocument>('ItemSpecificType', {});

export const ItemAffix = mongo.createModel<Types.ItemAffixDocument>('ItemAffix', {
  isPrefix: { type: Boolean, default: false },
  isSuffix: { type: Boolean, default: false },
  isTitle: { type: Boolean, default: false },
  weight: { type: Number, min: 0, default: 1 },
  typeIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'ItemType', required: false }],
  rarityIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'ItemRarity', required: false }],
});

export const ItemRecipe = mongo.createModel<Types.ItemRecipeDocument>('ItemRecipe', {});

export const ItemSkin = mongo.createModel<Types.ItemSkinDocument>('ItemSkin', {});

export const ItemTransmute = mongo.createModel<Types.ItemTransmuteDocument>(
  'ItemTransmute',
  {
    token: { type: String, maxlength: 500, required: true },
    assetId: { type: mongo.Schema.Types.ObjectId, ref: 'Asset', required: true },
    itemId: { type: mongo.Schema.Types.ObjectId, ref: 'Item', required: true },
    chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain' },
  },
  {
    virtuals: [
      {
        name: 'item',
      },
      {
        name: 'asset',
      },
    ],
  }
);
