// arken/packages/node/modules/area/area.schema.ts
//
import { z, ObjectId, Entity } from '../schema';

export const Area = Entity.merge(
  z.object({
    type: z.string().default('Zone'),
    landmarks: z.array(ObjectId).optional(),
    shortDescription: z.string(),
  })
);

export const AreaLandmark = Entity.merge(
  z.object({
    areaId: ObjectId.optional(),
    area: ObjectId.optional(),
  })
);

export const AreaType = Entity.merge(z.object({}));

export const AreaNameChoice = Entity.merge(z.object({}));
