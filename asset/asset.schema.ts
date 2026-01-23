import { z, ObjectId, Entity } from '../schema';

export const AssetStandard = Entity.merge(
  z.object({
    version: z.string().optional(),
    parentId: ObjectId.optional(),
  })
);

export const Asset = Entity.merge(
  z.object({
    uri: z.string().min(1),
    type: z
      .string()
      .max(100)
      .min(1),
    standards: z.array(ObjectId),
    licenseId: ObjectId.optional(),
    license: ObjectId.optional(),
    chainId: ObjectId.optional(),
    items: z.array(ObjectId).optional(),
  })
);

export const AssetLicense = Entity.merge(
  z.object({
    value: z.string().min(1),
    assets: z.array(ObjectId).optional(),
  })
);
