import { z, ObjectId, Entity } from '../schema';

export const Raffle = Entity.merge(
  z.object({
    content: z.string().min(1),
    rewards: z.array(ObjectId).optional(), // List of reward IDs
  })
);

export const RaffleRequirement = Entity.merge(
  z.object({
    amount: z.number().min(1),
    raffleRewardId: ObjectId.optional(), // Reference to the associated RaffleReward
  })
);

export const RaffleReward = Entity.merge(
  z.object({
    raffleId: ObjectId.optional(), // Reference to the associated Raffle
    winnerId: ObjectId.optional(), // Reference to the winning Profile
    requirements: z.array(ObjectId).optional(), // List of associated RaffleRequirement IDs
    entries: z.array(ObjectId).optional(), // List of associated RaffleEntry IDs
  })
);

export const RaffleEntry = Entity.merge(
  z.object({
    amount: z.number().min(1),
    raffleRewardId: ObjectId.optional(), // Reference to the associated RaffleReward
    raffleId: ObjectId.optional(), // Reference to the associated Raffle
  })
);
