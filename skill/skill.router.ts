import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import {
  Skill,
  SkillMod,
  SkillClassification,
  SkillCondition,
  SkillStatusEffect,
  SkillTree,
  SkillTreeNode,
} from './skill.schema';
import { Query } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    // Skill Procedures
    getSkill: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Skill.getSkill as any)(input, ctx)),

    createSkill: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: Skill.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.createSkill as any)(input, ctx)),

    updateSkill: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: Skill.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.updateSkill as any)(input, ctx)),

    deleteSkill: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.deleteSkill as any)(input, ctx)),

    // SkillMod Procedures
    getSkillMod: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Skill.getSkillMod as any)(input, ctx)),

    createSkillMod: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: SkillMod.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.createSkillMod as any)(input, ctx)),

    updateSkillMod: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: SkillMod.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.updateSkillMod as any)(input, ctx)),

    deleteSkillMod: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.deleteSkillMod as any)(input, ctx)),

    // SkillClassification Procedures
    getSkillClassification: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Skill.getSkillClassification as any)(input, ctx)),

    createSkillClassification: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: SkillClassification.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.createSkillClassification as any)(input, ctx)),

    updateSkillClassification: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: SkillClassification.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.updateSkillClassification as any)(input, ctx)),

    deleteSkillClassification: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.deleteSkillClassification as any)(input, ctx)),

    // SkillCondition Procedures
    getSkillCondition: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Skill.getSkillCondition as any)(input, ctx)),

    createSkillCondition: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: SkillCondition.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.createSkillCondition as any)(input, ctx)),

    updateSkillCondition: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: SkillCondition.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.updateSkillCondition as any)(input, ctx)),

    deleteSkillCondition: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.deleteSkillCondition as any)(input, ctx)),

    // SkillStatusEffect Procedures
    getSkillStatusEffect: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Skill.getSkillStatusEffect as any)(input, ctx)),

    createSkillStatusEffect: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: SkillStatusEffect.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.createSkillStatusEffect as any)(input, ctx)),

    updateSkillStatusEffect: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: SkillStatusEffect.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.updateSkillStatusEffect as any)(input, ctx)),

    deleteSkillStatusEffect: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.deleteSkillStatusEffect as any)(input, ctx)),

    // SkillTree Procedures
    getSkillTree: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Skill.getSkillTree as any)(input, ctx)),

    createSkillTree: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: SkillTree.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.createSkillTree as any)(input, ctx)),

    updateSkillTree: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: SkillTree.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.updateSkillTree as any)(input, ctx)),

    deleteSkillTree: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.deleteSkillTree as any)(input, ctx)),

    // SkillTreeNode Procedures
    getSkillTreeNode: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .query(({ input, ctx }) => (ctx.app.service.Skill.getSkillTreeNode as any)(input, ctx)),

    createSkillTreeNode: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ data: SkillTreeNode.omit({ id: true }) }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.createSkillTreeNode as any)(input, ctx)),

    updateSkillTreeNode: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query, data: SkillTreeNode.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.updateSkillTreeNode as any)(input, ctx)),

    deleteSkillTreeNode: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ query: Query }))
      .mutation(({ input, ctx }) => (ctx.app.service.Skill.deleteSkillTreeNode as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
