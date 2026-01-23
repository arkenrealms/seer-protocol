// module/asset.router.ts

import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Asset, AssetLicense } from './asset.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    getAsset: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ assetId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Asset.getAsset as any)(input, ctx)),

    createAsset: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(Asset)
      .mutation(({ input, ctx }) => (ctx.app.service.Asset.createAsset as any)(input, ctx)),

    updateAsset: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ assetId: z.string(), data: Asset.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Asset.updateAsset as any)(input, ctx)),

    getAssetLicense: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ assetLicenseId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Asset.getAssetLicense as any)(input, ctx)),

    createAssetLicense: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(AssetLicense)
      .mutation(({ input, ctx }) => (ctx.app.service.Asset.createAssetLicense as any)(input, ctx)),

    updateAssetLicense: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ assetLicenseId: z.string(), data: AssetLicense.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Asset.updateAssetLicense as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
