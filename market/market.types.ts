// module/market.types.ts

import { z } from 'zod';
import * as schema from './market.schema';
import { Document, Model } from '../util/mongo';
import type { RouterContext } from '../types';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { Router } from './market.router';

export type * from './market.router';
export type { RouterContext };

export type Market = z.infer<typeof schema.Market>;
export type MarketPair = z.infer<typeof schema.MarketPair>;
export type MarketExchange = z.infer<typeof schema.MarketExchange>;
export type MarketAnalysis = z.infer<typeof schema.MarketAnalysis>;
export type MarketInvestor = z.infer<typeof schema.MarketInvestor>;
export type MarketInvestmentPortfolio = z.infer<typeof schema.MarketInvestmentPortfolio>;
export type MarketInvestment = z.infer<typeof schema.MarketInvestment>;
export type MarketStock = z.infer<typeof schema.MarketStock>;
export type MarketToken = z.infer<typeof schema.MarketToken>;
export type MarketCompany = z.infer<typeof schema.MarketCompany>;
export type MarketETF = z.infer<typeof schema.MarketETF>;
export type MarketStockSentiment = z.infer<typeof schema.MarketStockSentiment>;

export type MarketDocument = Market & Document;
export type MarketPairDocument = MarketPair & Document;
export type MarketExchangeDocument = MarketExchange & Document;
export type MarketAnalysisDocument = MarketAnalysis & Document;
export type MarketInvestorDocument = MarketInvestor & Document;
export type MarketInvestmentPortfolioDocument = MarketInvestmentPortfolio & Document;
export type MarketInvestmentDocument = MarketInvestment & Document;
export type MarketStockDocument = MarketStock & Document;
export type MarketTokenDocument = MarketToken & Document;
export type MarketCompanyDocument = MarketCompany & Document;
export type MarketETFDocument = MarketETF & Document;
export type MarketStockSentimentDocument = MarketStockSentiment & Document;

export type Mappings = {
  Market: Model<MarketDocument>;
  MarketPair: Model<MarketPairDocument>;
  MarketExchange: Model<MarketExchangeDocument>;
  MarketAnalysis: Model<MarketAnalysisDocument>;
  MarketInvestor: Model<MarketInvestorDocument>;
  MarketInvestmentPortfolio: Model<MarketInvestmentPortfolioDocument>;
  MarketInvestment: Model<MarketInvestmentDocument>;
  MarketStock: Model<MarketStockDocument>;
  MarketToken: Model<MarketTokenDocument>;
  MarketCompany: Model<MarketCompanyDocument>;
  MarketETF: Model<MarketETFDocument>;
  MarketStockSentiment: Model<MarketStockSentimentDocument>;
};

export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
