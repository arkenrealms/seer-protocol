import { z, ObjectId, Entity } from '../schema';

export const CollectibleCollection = Entity.merge(
  z.object({
    hype: z.number().optional(),
    value: z.number().optional(),
  })
);

export const CollectibleCardBox = Entity.merge(
  z.object({
    collectibleCollectionId: ObjectId,
    franchise: z.string().min(1),
  })
);

export const CollectibleCardPack = Entity.merge(
  z.object({
    collectibleCollectionId: ObjectId,
    franchise: z.string().min(1),
    ungraded: z.number().optional(),
    grade10: z.number().optional(),
    grade9: z.number().optional(),
    grade8: z.number().optional(),
    grade7: z.number().optional(),
    grade6: z.number().optional(),
    grade5: z.number().optional(),
    grade4: z.number().optional(),
    grade3: z.number().optional(),
    grade2: z.number().optional(),
    grade1: z.number().optional(),
    additional: z.string().optional(),
    code: z.string().optional(),
    hype: z.number().optional(),
    series: z.string().optional(),
    category: z.string().optional(),
    year: z.number().optional(),
  })
);

export const CollectibleCard = Entity.merge(
  z.object({
    collectibleCollectionId: ObjectId,
    franchise: z.string().min(1),
    ungraded: z.number().optional(),
    grade10: z.number().optional(),
    grade9: z.number().optional(),
    grade8: z.number().optional(),
    grade7: z.number().optional(),
    grade6: z.number().optional(),
    grade5: z.number().optional(),
    grade4: z.number().optional(),
    grade3: z.number().optional(),
    grade2: z.number().optional(),
    grade1: z.number().optional(),
    additional: z.string().optional(),
    code: z.string().optional(),
    hype: z.number().optional(),
    series: z.string().optional(),
    category: z.string().optional(),
    year: z.number().optional(),
  })
);

export const Card = Entity.merge(
  z.object({
    setId: ObjectId,
    name: z.string(),
    language: z.string(),
    releaseDate: z.string(),
    cardId: z.number(),
  })
);

export const Set = Entity.merge(
  z.object({
    seriesId: ObjectId,
    name: z.string(),
    language: z.string(),
    live: z.boolean(),
    releaseDate: z.string(),
    cards: z.array(Card).optional(),
  })
);

export const Series = Entity.merge(
  z.object({
    name: z.string(),
  })
);
