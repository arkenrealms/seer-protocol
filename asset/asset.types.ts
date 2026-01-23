import { z } from 'zod';
import * as schema from './asset.schema';
import { Document, Model } from '../util/mongo';

export type * from './asset.router';
export type { RouterContext } from '../types';

export type Asset = z.infer<typeof schema.Asset>;
export type AssetDocument = Asset & Document;

export type AssetStandard = z.infer<typeof schema.AssetStandard>;
export type AssetStandardDocument = AssetStandard & Document;

export type AssetLicense = z.infer<typeof schema.AssetLicense>;
export type AssetLicenseDocument = AssetLicense & Document;

export type Mappings = {
  Asset: Model<AssetDocument>;
  AssetStandard: Model<AssetStandardDocument>;
  AssetLicense: Model<AssetLicenseDocument>;
};
