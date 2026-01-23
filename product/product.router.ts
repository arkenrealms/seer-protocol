import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Product, ProductDLC, ProductBundle, ProductReview } from './product.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    // Product endpoints
    getProduct: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ productId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Product.getProduct as any)(input, ctx)),

    createProduct: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(Product)
      .mutation(({ input, ctx }) => (ctx.app.service.Product.createProduct as any)(input, ctx)),

    updateProduct: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ productId: z.string(), data: Product.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Product.updateProduct as any)(input, ctx)),

    // ProductDLC endpoints
    getProductDLC: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ dlcId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Product.getProductDLC as any)(input, ctx)),

    createProductDLC: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(ProductDLC)
      .mutation(({ input, ctx }) => (ctx.app.service.Product.createProductDLC as any)(input, ctx)),

    updateProductDLC: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ dlcId: z.string(), data: ProductDLC.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Product.updateProductDLC as any)(input, ctx)),

    // ProductBundle endpoints
    getProductBundle: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ bundleId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Product.getProductBundle as any)(input, ctx)),

    createProductBundle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(ProductBundle)
      .mutation(({ input, ctx }) => (ctx.app.service.Product.createProductBundle as any)(input, ctx)),

    updateProductBundle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ bundleId: z.string(), data: ProductBundle.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Product.updateProductBundle as any)(input, ctx)),

    // ProductReview endpoints
    getProductReview: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.object({ reviewId: z.string() }))
      .query(({ input, ctx }) => (ctx.app.service.Product.getProductReview as any)(input, ctx)),

    createProductReview: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(ProductReview)
      .mutation(({ input, ctx }) => (ctx.app.service.Product.createProductReview as any)(input, ctx)),

    updateProductReview: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(z.object({ reviewId: z.string(), data: ProductReview.partial() }))
      .mutation(({ input, ctx }) => (ctx.app.service.Product.updateProductReview as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
