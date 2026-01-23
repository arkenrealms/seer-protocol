import { z } from 'zod';
import * as schema from './chain.schema';
import { Document, Model } from '../util/mongo';

export type * from './chain.router';
export type { RouterContext } from '../types';

export type Chain = z.infer<typeof schema.Chain>;
export type ChainContract = z.infer<typeof schema.ChainContract>;
export type ChainToken = z.infer<typeof schema.ChainToken>;
export type ChainTransaction = z.infer<typeof schema.ChainTransaction>;

export type ChainDocument = Chain & Document;
export type ChainContractDocument = ChainContract & Document;
export type ChainTokenDocument = ChainToken & Document;
export type ChainTransactionDocument = ChainTransaction & Document;

export type Mappings = {
  Chain: Model<ChainDocument>;
  ChainContract: Model<ChainContractDocument>;
  ChainToken: Model<ChainTokenDocument>;
  ChainTransaction: Model<ChainTransactionDocument>;
};
