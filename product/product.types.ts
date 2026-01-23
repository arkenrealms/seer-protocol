import { z } from 'zod';
import * as schema from './product.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { Router } from './product.router';

export type * from './product.router';
export type { RouterContext };

export type Product = z.infer<typeof schema.Product>;
export type ProductUpdate = z.infer<typeof schema.ProductUpdate>;
export type ProductDLC = z.infer<typeof schema.ProductDLC>;
export type ProductBundle = z.infer<typeof schema.ProductBundle>;
export type ProductReview = z.infer<typeof schema.ProductReview>;

export type ProductDocument = Product & Document;
export type ProductUpdateDocument = ProductUpdate & Document;
export type ProductDLCDocument = ProductDLC & Document;
export type ProductBundleDocument = ProductBundle & Document;
export type ProductReviewDocument = ProductReview & Document;

export type Mappings = {
  Product: Model<ProductDocument>;
  ProductUpdate: Model<ProductUpdateDocument>;
  ProductDLC: Model<ProductDLCDocument>;
  ProductBundle: Model<ProductBundleDocument>;
  ProductReview: Model<ProductReviewDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
