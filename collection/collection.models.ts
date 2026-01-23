import * as mongo from '../util/mongo';
import type * as Types from './collection.types';

export const CollectibleCollection = mongo.createModel<Types.CollectibleCollectionDocument>('CollectibleCollection', {
  hype: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
});

export const CollectibleCardBox = mongo.createModel<Types.CollectibleCardBoxDocument>('CollectibleCardBox', {
  collectibleCollectionId: { type: mongo.Schema.Types.ObjectId, ref: 'CollectibleCollection', required: true },
  franchise: { type: String, required: true, trim: true },
});

export const CollectibleCardPack = mongo.createModel<Types.CollectibleCardPackDocument>('CollectibleCardPack', {
  collectibleCollectionId: { type: mongo.Schema.Types.ObjectId, ref: 'CollectibleCollection', required: true },
  franchise: { type: String, required: true, trim: true },
  ungraded: { type: Number, default: 0 },
  grade10: { type: Number, default: 0 },
  grade9: { type: Number, default: 0 },
  grade8: { type: Number, default: 0 },
  grade7: { type: Number, default: 0 },
  grade6: { type: Number, default: 0 },
  grade5: { type: Number, default: 0 },
  grade4: { type: Number, default: 0 },
  grade3: { type: Number, default: 0 },
  grade2: { type: Number, default: 0 },
  grade1: { type: Number, default: 0 },
  additional: { type: String, trim: true },
  code: { type: String, trim: true },
  hype: { type: Number, default: 0 },
  series: { type: String, trim: true },
  category: { type: String, trim: true },
  year: { type: Number },
});

export const CollectibleCard = mongo.createModel<Types.CollectibleCardDocument>('CollectibleCard', {
  collectibleCollectionId: { type: mongo.Schema.Types.ObjectId, ref: 'CollectibleCollection', required: true },
  franchise: { type: String, required: true, trim: true },
  ungraded: { type: Number, default: 0 },
  grade10: { type: Number, default: 0 },
  grade9: { type: Number, default: 0 },
  grade8: { type: Number, default: 0 },
  grade7: { type: Number, default: 0 },
  grade6: { type: Number, default: 0 },
  grade5: { type: Number, default: 0 },
  grade4: { type: Number, default: 0 },
  grade3: { type: Number, default: 0 },
  grade2: { type: Number, default: 0 },
  grade1: { type: Number, default: 0 },
  additional: { type: String, trim: true },
  code: { type: String, trim: true },
  hype: { type: Number, default: 0 },
  series: { type: String, trim: true },
  category: { type: String, trim: true },
  year: { type: Number },
});

export const Set = mongo.createModel<Types.SetDocument>('Set', {
  seriesId: { type: mongo.Schema.Types.ObjectId, ref: 'Series', required: true },
  name: { type: String, required: true, trim: true },
  language: { type: String, required: true, trim: true },
  live: { type: Boolean, default: false },
  releaseDate: { type: String, required: true, trim: true },
});

export const Card = mongo.createModel<Types.CardDocument>('Card', {
  setId: { type: mongo.Schema.Types.ObjectId, ref: 'Set', required: true },
  name: { type: String, required: true, trim: true },
  language: { type: String, required: true, trim: true },
  releaseDate: { type: String, required: true, trim: true },
  cardId: { type: Number, required: true },
});

export const Series = mongo.createModel<Types.SeriesDocument>('Series', {
  name: { type: String, required: true, trim: true },
});
