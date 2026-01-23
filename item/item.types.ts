// module/item.types.ts

import { z } from 'zod';
import * as schema from './item.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { Router } from './item.router';

export type * from './item.router';
export type { RouterContext };

export type Item = z.infer<typeof schema.Item>;
export type ItemDocument = Item & Document;

export type ItemAttribute = z.infer<typeof schema.ItemAttribute>;
export type ItemAttributeDocument = ItemAttribute & Document;

export type ItemMaterial = z.infer<typeof schema.ItemMaterial>;
export type ItemMaterialDocument = ItemMaterial & Document;

export type ItemSet = z.infer<typeof schema.ItemSet>;
export type ItemSetDocument = ItemSet & Document;

export type ItemSlot = z.infer<typeof schema.ItemSlot>;
export type ItemSlotDocument = ItemSlot & Document;

export type ItemRarity = z.infer<typeof schema.ItemRarity>;
export type ItemRarityDocument = ItemRarity & Document;

export type ItemRank = z.infer<typeof schema.ItemRank>;
export type ItemRankDocument = ItemRank & Document;

export type ItemType = z.infer<typeof schema.ItemType>;
export type ItemTypeDocument = ItemType & Document;

export type ItemSubType = z.infer<typeof schema.ItemSubType>;
export type ItemSubTypeDocument = ItemSubType & Document;

export type ItemSpecificType = z.infer<typeof schema.ItemSpecificType>;
export type ItemSpecificTypeDocument = ItemSpecificType & Document;

export type ItemAffix = z.infer<typeof schema.ItemAffix>;
export type ItemAffixDocument = ItemAffix & Document;

export type ItemRecipe = z.infer<typeof schema.ItemRecipe>;
export type ItemRecipeDocument = ItemRecipe & Document;

export type ItemSkin = z.infer<typeof schema.ItemSkin>;
export type ItemSkinDocument = ItemSkin & Document;

export type ItemTransmute = z.infer<typeof schema.ItemTransmute>;
export type ItemTransmuteDocument = ItemTransmute & Document;

export type Mappings = {
  Item: Model<ItemDocument>;
  ItemAttribute: Model<ItemAttributeDocument>;
  ItemMaterial: Model<ItemMaterialDocument>;
  ItemSet: Model<ItemSetDocument>;
  ItemSlot: Model<ItemSlotDocument>;
  ItemRarity: Model<ItemRarityDocument>;
  ItemRank: Model<ItemRankDocument>;
  ItemType: Model<ItemTypeDocument>;
  ItemSubType: Model<ItemSubTypeDocument>;
  ItemSpecificType: Model<ItemSpecificTypeDocument>;
  ItemAffix: Model<ItemAffixDocument>;
  ItemRecipe: Model<ItemRecipeDocument>;
  ItemSkin: Model<ItemSkinDocument>;
  ItemTransmute: Model<ItemTransmuteDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
