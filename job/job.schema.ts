import { z, ObjectId, Entity } from '../schema';

export const Job = Entity.merge(
  z.object({
    mod: z.string(),
    startDate: z.date().optional(),
    expireDate: z.date().optional(),
  })
);
