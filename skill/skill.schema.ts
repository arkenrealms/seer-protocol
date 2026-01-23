import { z, ObjectId, Entity } from '../schema';

export const Skill = Entity.merge(
  z.object({
    name: z.string().min(1),
    description: z
      .string()
      .min(1)
      .optional(),
    type: z.enum(['attack', 'defense', 'utility']),
    cooldown: z
      .number()
      .min(0)
      .optional(),
    power: z
      .number()
      .min(0)
      .optional(),
  })
);

export const SkillEffect = Entity.merge(
  z.object({
    skillId: ObjectId, // Reference to the associated Skill
    effectType: z.enum(['damage', 'heal', 'buff', 'debuff']),
    magnitude: z.number().min(0),
    duration: z
      .number()
      .min(0)
      .optional(),
  })
);

export const SkillRequirement = Entity.merge(
  z.object({
    skillId: ObjectId, // Reference to the associated Skill
    levelRequired: z.number().min(1),
    previousSkillId: ObjectId.optional(), // Reference to a prerequisite skill
  })
);

export const SkillMod = Entity.merge(z.object({}));

export const SkillClassification = Entity.merge(z.object({}));

export const SkillCondition = Entity.merge(z.object({}));

export const SkillStatusEffect = Entity.merge(z.object({}));

export const SkillTree = Entity.merge(z.object({}));

export const SkillTreeNode = Entity.merge(z.object({}));
