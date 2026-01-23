import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Interface, InterfaceGroup, InterfaceComponent } from './interface.schema';
import { Query, getQueryInput, getQueryOutput, inferRouterOutputs } from '../schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    // Interface Procedures
    getInterface: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface)
      .query(({ input, ctx }) => (ctx.app.service.Interface.getInterface as any)(input, ctx)),

    createInterface: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface.pick({ id: true, name: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.createInterface as any)(input, ctx)),

    updateInterface: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterface as any)(input, ctx)),

    deleteInterface: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      // .output(Interface.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.deleteInterface as any)(input, ctx)),

    getInterfaces: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(z.object({ items: z.array(Interface), total: z.number() }))
      .query(({ input, ctx }) => (ctx.app.service.Interface.getInterfaces as any)(input, ctx)),

    // getInterface: procedure
    //   .use(hasRole('guest', t))
    //   .use(customErrorFormatter(t))
    //   .input(getQueryInput(Interface))
    //   .output(Interface)
    //   .query(({ input, ctx }) => (ctx.app.service.Interface.getInterface as any)(input, ctx)),

    // getInterfaces: procedure
    //   .use(hasRole('guest', t))
    //   .use(customErrorFormatter(t))
    //   .input(getQueryInput(Interface))
    //   .output(z.array(Interface))
    //   .query(({ input, ctx }) => (ctx.app.service.Interface.getInterfaces as any)(input, ctx)),

    // createInterface: procedure
    //   .use(hasRole('admin', t))
    //   .use(customErrorFormatter(t))
    //   .input(getQueryInput(Interface))
    //   .output(Interface.pick({ id: true }))
    //   .mutation(({ input, ctx }) => (ctx.app.service.Interface.createInterface as any)(input, ctx)),

    // updateInterface: procedure
    //   .use(hasRole('admin', t))
    //   .use(customErrorFormatter(t))
    //   .input(getQueryInput(Interface))
    //   .output(Interface.pick({ id: true }))
    //   .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterface as any)(input, ctx)),

    // deleteInterface: procedure
    //   .use(hasRole('admin', t))
    //   .use(customErrorFormatter(t))
    //   .input(getQueryInput(Interface))
    //   .output(Interface.pick({ id: true }))
    //   .mutation(({ input, ctx }) => (ctx.app.service.Interface.deleteInterface as any)(input, ctx)),

    // InterfaceGroup Procedures
    getInterfaceGroup: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(InterfaceGroup))
      .output(InterfaceGroup)
      .query(({ input, ctx }) => (ctx.app.service.Interface.getInterfaceGroup as any)(input, ctx)),

    getInterfaceGroups: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(InterfaceGroup))
      .output(z.array(InterfaceGroup))
      .query(({ input, ctx }) => (ctx.app.service.Interface.getInterfaceGroups as any)(input, ctx)),

    createInterfaceGroup: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(InterfaceGroup))
      .output(InterfaceGroup.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.createInterfaceGroup as any)(input, ctx)),

    updateInterfaceGroup: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(InterfaceGroup))
      .output(InterfaceGroup.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterfaceGroup as any)(input, ctx)),

    // InterfaceComponent Procedures
    getInterfaceComponent: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(InterfaceComponent))
      .output(InterfaceComponent)
      .query(({ input, ctx }) => (ctx.app.service.Interface.getInterfaceComponent as any)(input, ctx)),

    createInterfaceComponent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(InterfaceComponent))
      .output(InterfaceComponent.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.createInterfaceComponent as any)(input, ctx)),

    updateInterfaceComponent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(InterfaceComponent))
      .output(InterfaceComponent.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterfaceComponent as any)(input, ctx)),

    publishInterface: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterfaceComponent as any)(input, ctx)),

    deactivateInterface: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterfaceComponent as any)(input, ctx)),

    resetInterface: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterfaceComponent as any)(input, ctx)),

    acceptInterfaceSubmission: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.updateInterfaceComponent as any)(input, ctx)),

    createInterfaceDraft: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Interface))
      .output(Interface.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Interface.createInterfaceDraft as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
