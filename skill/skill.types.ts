import { z } from 'zod';
import * as schema from './skill.schema';
import { Document, Model } from '../util/mongo';

export type * from './skill.router';
export type { RouterContext } from '../types';

export type Skill = z.infer<typeof schema.Skill>;
export type SkillMod = z.infer<typeof schema.SkillMod>;
export type SkillClassification = z.infer<typeof schema.SkillClassification>;
export type SkillCondition = z.infer<typeof schema.SkillCondition>;
export type SkillStatusEffect = z.infer<typeof schema.SkillStatusEffect>;
export type SkillTree = z.infer<typeof schema.SkillTree>;
export type SkillTreeNode = z.infer<typeof schema.SkillTreeNode>;

export type SkillDocument = Skill & Document;
export type SkillModDocument = SkillMod & Document;
export type SkillClassificationDocument = SkillClassification & Document;
export type SkillConditionDocument = SkillCondition & Document;
export type SkillStatusEffectDocument = SkillStatusEffect & Document;
export type SkillTreeDocument = SkillTree & Document;
export type SkillTreeNodeDocument = SkillTreeNode & Document;

export type Mappings = {
  Skill: Model<SkillDocument>;
  SkillMod: Model<SkillModDocument>;
  SkillClassification: Model<SkillClassificationDocument>;
  SkillCondition: Model<SkillConditionDocument>;
  SkillStatusEffect: Model<SkillStatusEffectDocument>;
  SkillTree: Model<SkillTreeDocument>;
  SkillTreeNode: Model<SkillTreeNodeDocument>;
};
