import * as mongo from '../util/mongo';
import type * as Types from './chain.types';

export const Chain = mongo.createModel<Types.ChainDocument>('Chain', {
  content: { type: String, required: true },
  type: { type: String, maxlength: 100, required: true },
});

export const ChainContract = mongo.createModel<Types.ChainContractDocument>('ChainContract', {
  chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain', required: true },
  content: { type: String },
  address: { type: String },
  type: { type: String, maxlength: 100, required: true },
  standards: [{ type: mongo.Schema.Types.ObjectId, ref: 'AssetStandard', required: true }],
});

export const ChainToken = mongo.createModel<Types.ChainTokenDocument>(
  'ChainToken',
  {
    chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain', required: true },
    chainContractId: { type: mongo.Schema.Types.ObjectId, ref: 'ChainContract', required: true },
    rank: { type: Number, min: 0, default: 0 },
    description: { type: String, trim: true },
    address: { type: String },
    content: { type: String },
    decimals: { type: Number, default: 0 },
    price: { type: Number, min: 0, default: 0 },
    hourChange: { type: Number, default: 0 },
    dayChange: { type: Number, default: 0 },
    weekChange: { type: Number, default: 0 },
    marketCap: { type: Number, min: 0, default: 0 },
    volume: { type: Number, min: 0, default: 0 },
    symbol: { type: String, required: true, trim: true },
    circulatingSupply: { type: Number, min: 0, default: 0 },
    cmcLink: { type: String, trim: true },
    movementDown: { type: Number, min: 0, default: 0 },
    movementUp: { type: Number, min: 0, default: 0 },
    enteredTop100: { type: Number, min: 0, default: 0 },
    exitedTop100: { type: Number, min: 0, default: 0 },
    largeMoveDown: { type: Number, min: 0, default: 0 },
  },
  {
    indexes: [{ applicationId: 1, symbol: 1, unique: true }],
  }
);

export const ChainTransaction = mongo.createModel<Types.ChainTransactionDocument>('ChainTransaction', {
  value: { type: String, required: true },
  chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain', required: true },
});
