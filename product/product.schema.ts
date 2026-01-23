import { z, ObjectId, Entity } from '../schema';

// Extend the ProductMeta schema
const ProductMeta = z.object({
  name: z.string(),
  members: z.array(ObjectId), // Array of Profile references
  isProposal: z.boolean(),
  price: z.number().nonnegative(),
  oldPrice: z
    .number()
    .nonnegative()
    .optional(),
  images: z.record(z.string(), z.any()),
  video: z.string().url(),
  genre: z.string(),
  releaseDate: z.string(),
  developer: z.string(),
  publisher: z.string(),
  developerTags: z.array(z.string()),
  languageSupport: z.array(z.any()), // Replace with actual Language schema if available
  systemRequirements: z.array(z.any()), // Replace with actual SystemRequirement schema if available
  tags: z.array(ObjectId), // Array of Tag references
  type: z.string(),
  downloads: z
    .number()
    .int()
    .nonnegative(),
  plans: z.array(z.any()), // Replace with actual ProductPlan schema if available
  frequentlyTradedAssets: z.array(ObjectId), // Array of Asset references
  saleBox: z.record(z.string(), z.any()),
  assets: z.array(ObjectId), // Array of Asset references
  community: z.record(z.string(), z.any()),
  nameUrl: z.string(),
  steamId: z.number().int(),
  author: z.string(),
});

// Updated Product schema
export const Product = Entity.merge(
  z.object({
    shortDescription: z
      .string()
      .max(300)
      .min(1),
    content: z.string().min(1),
    communityId: ObjectId,
    type: z
      .string()
      .max(100)
      .default('game'),
    releaseDate: z.date().optional(),
    sku: z.string().min(1),
    categoryId: ObjectId.optional(),
    price: z.number().nonnegative(),
    discountPrice: z
      .number()
      .nonnegative()
      .optional(),
    currency: z.string().length(3),
    images: z.array(z.string().url()).optional(),
    videos: z.array(z.string().url()).optional(),
    digitalContent: z
      .array(
        z.object({
          url: z.string().url(),
          size: z.number().nonnegative(),
          drm: z.enum(['None', 'Steam', 'Epic', 'Uplay', 'Origin']).optional(),
        })
      )
      .optional(),
    dlcs: z.array(ObjectId).optional(),
    bundles: z.array(ObjectId).optional(),
    achievements: z
      .array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          icon: z
            .string()
            .url()
            .optional(),
        })
      )
      .optional(),
    reviews: z
      .array(
        z.object({
          userId: ObjectId,
          rating: z
            .number()
            .min(1)
            .max(5),
          comment: z.string().optional(),
          createdDate: z.date().default(() => new Date()),
        })
      )
      .optional(),
    cloudSave: z.boolean().default(false),
    ugcSupport: z.boolean().default(false),
    wishlistCount: z
      .number()
      .int()
      .nonnegative()
      .default(0),

    // Additional fields from Objection.js model
    parentId: ObjectId.optional(),
    score: z.number().optional(),
    ownerId: ObjectId.optional(),
    ratingId: ObjectId.optional(),
    ideaId: ObjectId.optional(),
    meta: ProductMeta.optional(),
  })
);

// ProductDLC schema
export const ProductDLC = Entity.merge(
  z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    gameId: ObjectId,
    price: z.number().nonnegative(),
    discountPrice: z
      .number()
      .nonnegative()
      .optional(),
    currency: z.string().length(3),
    digitalContent: z
      .array(
        z.object({
          url: z.string().url(),
          size: z.number().nonnegative(),
          drm: z.enum(['None', 'Steam', 'Epic', 'Uplay', 'Origin']).optional(),
        })
      )
      .optional(),
    achievements: z
      .array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          icon: z
            .string()
            .url()
            .optional(),
        })
      )
      .optional(),
  })
);

// ProductBundle schema
export const ProductBundle = Entity.merge(
  z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    products: z.array(ObjectId),
    price: z.number().nonnegative(),
    discountPrice: z
      .number()
      .nonnegative()
      .optional(),
    currency: z.string().length(3),
  })
);

// ProductReview schema
export const ProductReview = Entity.merge(
  z.object({
    userId: ObjectId,
    productId: ObjectId,
    rating: z
      .number()
      .min(1)
      .max(5),
    comment: z.string().optional(),
  })
);

export const ProductUpdate = Entity.merge(
  z.object({
    productId: ObjectId,
    updateContent: z.string().min(1),
    updateDate: z.date(),
  })
);
