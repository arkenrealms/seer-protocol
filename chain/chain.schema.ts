import { z, ObjectId, Entity } from '../schema';

export const Chain = Entity.merge(
  z.object({
    content: z.string().min(1),
    type: z
      .string()
      .max(100)
      .min(1),
    standard: z
      .string()
      .max(100)
      .min(1),
  })
);

export const ChainContract = Entity.merge(
  z.object({
    chainId: ObjectId,
    content: z
      .string()
      .min(1)
      .optional(),
    address: z.string().max(100),
    type: z
      .string()
      .max(100)
      .min(1),
    standards: z.array(ObjectId),
  })
);

export const ChainToken = Entity.merge(
  z.object({
    chainId: ObjectId,
    chainContractId: ObjectId,
    address: z.string().max(100), // TODO: validate address?
    decimals: z.number().optional(),
    rank: z.number().optional(),
    description: z.string().optional(),
    content: z
      .string()
      .min(1)
      .optional(),
    price: z.number().optional(),
    hourChange: z.number().optional(),
    dayChange: z.number().optional(),
    weekChange: z.number().optional(),
    marketCap: z.number().optional(),
    volume: z.number().optional(),
    symbol: z.string().min(1),
    circulatingSupply: z.number().optional(),
    cmcLink: z.string().optional(),
    movementDown: z.number().optional(),
    movementUp: z.number().optional(),
    enteredTop100: z.number().optional(),
    exitedTop100: z.number().optional(),
    largeMoveDown: z.number().optional(),
  })
);

export const ChainTransaction = Entity.merge(
  z.object({
    value: z.string().min(1),
    chainId: ObjectId,
  })
);
