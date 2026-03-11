import { initTRPC } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { inferRouterInputs, inferRouterOutputs } from '../util/schema';
import {
  CanonCatalogItemSchema,
  NovelistCreateSnapshotInputSchema,
  NovelistCreateSnapshotResultSchema,
  NovelistExportEditionInputSchema,
  NovelistExportEditionResultSchema,
  NovelistGenerateRevisionInputSchema,
  NovelistGenerateRevisionResultSchema,
  NovelistProjectIdInput,
  NovelistProjectLoadResultSchema,
  NovelistProjectSaveInput,
  NovelistProjectSaveResultSchema,
  NovelistResolveRevisionInputSchema,
  NovelistResolveRevisionResultSchema,
  NovelistRestoreSnapshotInputSchema,
  NovelistRestoreSnapshotResultSchema,
  NovelistUpdatePresenceInputSchema,
  NovelistUpdatePresenceResultSchema,
  NovelistRunAnalysisInputSchema,
  NovelistRunAnalysisResultSchema,
  NovelistSearchCanonInput,
} from './novelist.schema';

export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getProject: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(NovelistProjectIdInput)
      .output(NovelistProjectLoadResultSchema)
      .query(({ input, ctx }) => (ctx.app.service.Novelist.getProject as any)(input, ctx)),

    updatePresence: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(NovelistUpdatePresenceInputSchema)
      .output(NovelistUpdatePresenceResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.updatePresence as any)(input, ctx)),

    saveProject: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(NovelistProjectSaveInput)
      .output(NovelistProjectSaveResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.saveProject as any)(input, ctx)),

    generateRevision: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(NovelistGenerateRevisionInputSchema)
      .output(NovelistGenerateRevisionResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.generateRevision as any)(input, ctx)),

    resolveRevision: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(NovelistResolveRevisionInputSchema)
      .output(NovelistResolveRevisionResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.resolveRevision as any)(input, ctx)),

    createSnapshot: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(NovelistCreateSnapshotInputSchema)
      .output(NovelistCreateSnapshotResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.createSnapshot as any)(input, ctx)),

    restoreSnapshot: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(NovelistRestoreSnapshotInputSchema)
      .output(NovelistRestoreSnapshotResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.restoreSnapshot as any)(input, ctx)),

    runAnalysis: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(NovelistRunAnalysisInputSchema)
      .output(NovelistRunAnalysisResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.runAnalysis as any)(input, ctx)),

    exportEdition: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(NovelistExportEditionInputSchema)
      .output(NovelistExportEditionResultSchema)
      .mutation(({ input, ctx }) => (ctx.app.service.Novelist.exportEdition as any)(input, ctx)),

    searchCanon: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(NovelistSearchCanonInput)
      .output(CanonCatalogItemSchema.array())
      .query(({ input, ctx }) => (ctx.app.service.Novelist.searchCanon as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
