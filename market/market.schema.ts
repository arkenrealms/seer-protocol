import { z, Entity, ObjectId } from '../schema';

export const Market = Entity.merge(
  z.object({
    value: z.string(),
  })
);

export const MarketPair = Entity.merge(
  z.object({
    value: z.string(),
  })
);

export const MarketExchange = Entity.merge(
  z.object({
    value: z.string(),
  })
);

export const MarketAnalysis = Entity.merge(
  z.object({
    action: z.enum(['Buy', 'Sell']), // buy or sell action
    asset: z.string().min(1), // the asset being traded (e.g., oil, Bitcoin)
    signalType: z.string().min(1), // type of signal (e.g., news)
    confidence: z
      .number()
      .min(0)
      .max(100), // confidence level from 0 to 100
    riskLevel: z.enum(['Low', 'Medium', 'High']), // risk level
    timeFrame: z.enum(['Short-Term', 'Long-Term']), // investment time frame
    source: z.string().min(1), // source of information (e.g., FinancialJuice, Ground News)
    summary: z.string().min(1), // summary of the analysis
    labels: z.object({
      sector: z.string().optional(), // sector related to the asset (e.g., energy, aviation)
      topic: z.string().optional(), // topic of the news (e.g., oil demand, job cuts)
      sentiment: z.enum(['Positive', 'Neutral', 'Negative']).optional(), // sentiment of the news
    }),
  })
);

export const MarketInvestor = Entity.merge(
  z.object({
    portfolioIds: z.array(ObjectId), // Array of ObjectId references to InvestmentPortfolio
    totalPnl: z.number().optional(), // Total profit and loss
  })
);

export const MarketInvestmentPortfolio = Entity.merge(
  z.object({
    categoryGoals: z.array(
      z.object({
        category: z.string(), // Category name
        goalPercentage: z.number(), // Goal percentage for this category
        currentPnl: z.number().optional(), // Current P&L for this category
        historicalPnL: z.number().optional(), // Historical P&L for this category
      })
    ), // Array of categories with goal percentages and P&L tracking
    investmentIds: z.array(ObjectId), // Array of ObjectId references to Investment
    totalPnl: z.number().optional(), // Total P&L for this portfolio
  })
);

export const MarketInvestment = Entity.merge(
  z.object({
    type: z.enum(['Stock', 'ChainToken']),
    category: z.enum(['Historically Safe', 'Economy Bull', 'Economy Bear', 'Custom']),
    amount: z.number(), // Initial amount invested
    purchasePrice: z.number(), // Price at which the investment was purchased
    currentValue: z.number().optional(), // Current value of the investment
    pnl: z.number().optional(), // Current P&L of the investment
    transactions: z
      .array(
        z.object({
          date: z.string(), // Date of transaction
          type: z.enum(['Buy', 'Sell']),
          price: z.number(), // Price at transaction
          quantity: z.number(), // Quantity bought or sold
        })
      )
      .optional(), // Optional array for detailed transaction history
    stockId: ObjectId.optional(), // Reference to Stock if type is 'Stock'
    chainTokenId: ObjectId.optional(), // Reference to ChainToken if type is 'ChainToken'
  })
);

export const MarketStock = Entity.merge(
  z.object({
    ticker: z.string(),
    companyId: ObjectId,
    marketCap: z.number().optional(),
    aum: z.number().optional(),
    quoteType: z.string(),
    currentPrice: z.number(),
    dailyChange: z.number().optional(),
    dailyChangePercent: z.number().optional(),
    volume: z.number(),
    currency: z.string(),
  })
);

export const MarketToken = Entity.merge(
  z.object({
    symbol: z.string(),
    currentPrice: z.number(),
  })
);

export const MarketCompany = Entity.merge(
  z.object({
    ticker: z.string(), // Primary ticker, if applicable
    type: z.enum(['Public Company', 'ETF Issuer', 'Both', 'Other']), // Categorize the company type
    country: z.string().optional(), // Country where the company is based
    industry: z.string().optional(), // Industry the company operates in
    sector: z.string().optional(), // Sector the company belongs to
    issuedETFs: z.array(ObjectId).optional(), // References to ETFs issued by this company
  })
);

export const MarketETF = Entity.merge(
  z.object({
    ticker: z.string(),
    issuerId: ObjectId, // Reference to the Company issuing the ETF
    leverage: z.number().optional(), // Leverage factor if applicable (e.g., 3x)
    country: z.string().optional(), // Country where the ETF is based
    currency: z.string().optional(), // Currency the ETF is traded in
    AUM: z.number().optional(), // Assets under management
    industry: z.string().optional(), // Industry the ETF is focused on
    sector: z.string().optional(), // Sector the ETF is focused on
  })
);

export const MarketStockSentiment = Entity.merge(
  z.object({
    ticker: z.string(),
    companyId: ObjectId,
    sentiment: z.object({
      label: z.enum(['Positive', 'Neutral', 'Negative']), // predefined sentiment labels
      score: z
        .number()
        .min(0)
        .max(1), // sentiment score as a confidence percentage
    }),
    confidence: z
      .number()
      .min(0)
      .max(1), // overall confidence level for the analysis
  })
);
