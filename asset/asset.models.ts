import * as mongo from '../util/mongo';
import type * as Types from './asset.types';

export const AssetStandard = mongo.createModel<Types.AssetStandardDocument>(
  'AssetStandard',
  {
    version: { type: String, required: false },
    parentId: { type: mongo.Schema.Types.ObjectId, ref: 'AssetStandard', required: false },
  },
  {
    virtuals: [
      {
        name: 'children',
        ref: 'AssetStandard',
        localField: '_id',
        foreignField: 'parent',
        justOne: false,
      },
    ],
  }
);

export const Asset = mongo.createModel<Types.AssetDocument>(
  'Asset',
  {
    uri: { type: String, required: true },
    type: { type: String, maxlength: 100, required: true },
    standards: [{ type: mongo.Schema.Types.ObjectId, ref: 'AssetStandard', required: true }],
    licenseId: { type: mongo.Schema.Types.ObjectId, ref: 'AssetLicense' },
    chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain' },
    ownerId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' }, // Added ownerId
    // skin: { type: String },
    // transmuteCount: { type: Number },
    // score: { type: Number },
  },
  {
    virtuals: [
      {
        name: 'items',
        ref: 'Item',
        localField: '_id',
        foreignField: 'assetId',
      },
      {
        name: 'offers',
        ref: 'Node',
        localField: '_id',
        foreignField: 'fromOfferId',
        justOne: false,
        match: { relationKey: 'offers' },
      },
    ],
  }
);

export const AssetLicense = mongo.createModel<Types.AssetLicenseDocument>('AssetLicense', {
  value: { type: String, required: true },
  // assets: [{ type: mongo.Schema.Types.ObjectId, ref: 'Asset' }],
});
