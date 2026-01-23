import * as mongo from '../util/mongo';
import type * as Types from './area.types';

export const Area = mongo.createModel<Types.AreaDocument>('Area', {
  type: { type: String, default: 'Zone' },
  shortDescription: { type: String },
  // landmarks: [{ type: mongo.Schema.Types.ObjectId, ref: 'AreaLandmark' }],
});

export const AreaLandmark = mongo.createModel<Types.AreaLandmarkDocument>('AreaLandmark', {
  areaId: { type: mongo.Schema.Types.ObjectId, ref: 'Area' },
});

export const AreaType = mongo.createModel<Types.AreaTypeDocument>('AreaType', {});
export const AreaNameChoice = mongo.createModel<Types.AreaNameChoiceDocument>('AreaNameChoice', {});
