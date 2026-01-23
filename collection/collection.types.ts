// module/collection.types.ts

import { z } from 'zod';
import * as schema from './collection.schema';
import { Document, Model } from '../util/mongo';
import exp from 'constants';

export type * from './collection.router';
export type { RouterContext } from '../types';

export type CollectibleCollection = z.infer<typeof schema.CollectibleCollection>;
export type CollectibleCardBox = z.infer<typeof schema.CollectibleCardBox>;
export type CollectibleCardPack = z.infer<typeof schema.CollectibleCardPack>;
export type CollectibleCard = z.infer<typeof schema.CollectibleCard>;
export type Card = z.infer<typeof schema.Card>;
export type Set = z.infer<typeof schema.Set>;
export type Series = z.infer<typeof schema.Series>;

export type CollectibleCollectionDocument = CollectibleCollection & Document;
export type CollectibleCardBoxDocument = CollectibleCardBox & Document;
export type CollectibleCardPackDocument = CollectibleCardPack & Document;
export type CollectibleCardDocument = CollectibleCard & Document;
export type CardDocument = Card & Document;
export type SetDocument = Set & Document;
export type SeriesDocument = Series & Document;

export type Mappings = {
  CollectibleCollection: Model<CollectibleCollectionDocument>;
  CollectibleCardBox: Model<CollectibleCardBoxDocument>;
  CollectibleCardPack: Model<CollectibleCardPackDocument>;
  CollectibleCard: Model<CollectibleCardDocument>;
  Card: Model<CardDocument>;
  Set: Model<SetDocument>;
  Series: Model<SeriesDocument>;
};
