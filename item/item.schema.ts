import { z, ObjectId, Entity } from '../schema';

export const ItemAttribute = Entity.merge(
  z.object({
    // Define fields for ItemAttribute here if needed
  })
);

export const ItemMaterial = Entity.merge(
  z.object({
    // Define fields for ItemMaterial here if needed
  })
);

export const ItemSet = Entity.merge(
  z.object({
    // Define fields for ItemSet here if needed
  })
);

export const ItemSlot = Entity.merge(
  z.object({
    // Define fields for ItemSlot here if needed
  })
);

export const ItemRarity = Entity.merge(
  z.object({
    // Define fields for ItemRarity here if needed
  })
);

export const ItemRank = Entity.merge(
  z.object({
    value: z.number(),
    // Define fields for ItemRank here if needed
  })
);

export const ItemType = Entity.merge(
  z.object({
    // Define fields for ItemType here if needed
  })
);

export const ItemSubType = Entity.merge(
  z.object({
    // Define fields for ItemSubType here if needed
  })
);

export const ItemSpecificType = Entity.merge(
  z.object({
    // Define fields for ItemSpecificType here if needed
  })
);

export const ItemAffix = Entity.merge(
  z.object({
    isPrefix: z.boolean().default(false),
    isSuffix: z.boolean().default(false),
    isTitle: z.boolean().default(false),
    weight: z
      .number()
      .min(0)
      .default(1),
    typeIds: z.array(ObjectId).optional(),
    rarityIds: z.array(ObjectId).optional(),
  })
);

export const ItemRecipe = Entity.merge(
  z.object({
    // Define fields for ItemRecipe here if needed
  })
);

export const ItemSkin = Entity.merge(
  z.object({
    // Define fields for ItemSkin here if needed
  })
);

export const ItemTransmute = Entity.merge(
  z.object({
    token: z
      .string()
      .max(500)
      .min(1),
    assetId: ObjectId,
    itemId: ObjectId,
    chainId: ObjectId.optional(),
  })
);

export const Item = Entity.merge(
  z.object({
    characterId: ObjectId.optional(),
    assetId: ObjectId.optional(),
    chainId: ObjectId.optional(),
    materialId: ItemMaterial.optional(),
    skinId: ItemSkin.optional(),
    recipeId: ItemRecipe.optional(),
    typeId: ItemType.optional(),
    subTypeId: ItemSubType.optional(),
    specificTypeId: ItemSpecificType.optional(),
    rankId: ItemRank.optional(),
    rankValue: z.number(),
    rarityId: ItemRarity.optional(),
    slotIds: z.array(ItemSlot.optional()),
    setId: ItemSet.optional(),
    attributes: z.array(ItemAttribute).optional(),
    token: z
      .string()
      .max(500)
      .min(1)
      .optional(),
    quantity: z
      .number()
      .int()
      .nonnegative()
      .default(1),
    x: z
      .number()
      .int()
      .nonnegative()
      .optional(),
    y: z
      .number()
      .int()
      .nonnegative()
      .optional(),
    distribution: z
      .enum(['Unknown', 'Found', 'Fundraiser', 'Claimed', 'Crafted', 'Airdrop', 'Reward', 'Farmed', 'Migration'])
      .default('Unknown'),
    // properties: z.record(z.any()).optional(),
    // type: z.string().default('bag'), // stash, bag, equipment, etc.
    items: z.array(z.lazy(() => Item)).default([]),
    capacity: z
      .number()
      .int()
      .nonnegative()
      .default(60),
    points: z
      .number()
      .int()
      .nonnegative()
      .default(0),
  })
);
