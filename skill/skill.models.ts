import * as mongo from '../util/mongo';
import type * as Types from './skill.types';

export const Skill = mongo.createModel<Types.SkillDocument>('Skill', {});

export const SkillMod = mongo.createModel<Types.SkillModDocument>('SkillMod', {});

export const SkillClassification = mongo.createModel<Types.SkillClassificationDocument>('SkillClassification', {});

export const SkillCondition = mongo.createModel<Types.SkillConditionDocument>('SkillCondition', {});

export const SkillStatusEffect = mongo.createModel<Types.SkillStatusEffectDocument>('SkillStatusEffect', {});

export const SkillTree = mongo.createModel<Types.SkillTreeDocument>('SkillTree', {});

export const SkillTreeNode = mongo.createModel<Types.SkillTreeNodeDocument>('SkillTreeNode', {});
