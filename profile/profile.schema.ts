// profile.schema.ts
//
import { z, ObjectId, Entity } from '../schema';
import { Character } from '../character/character.schema';
import { Achievement, Badge } from '../core/core.schema';

const RankingStatSchema = z.object({
  total: z.number(),
  position: z.number(),
});

// Define the Ranking schema
const RankingSchema = z.object({
  orbs: RankingStatSchema,
  wins: RankingStatSchema,
  kills: RankingStatSchema,
  deaths: RankingStatSchema,
  points: RankingStatSchema,
  rounds: RankingStatSchema,
  evolves: RankingStatSchema,
  rewards: RankingStatSchema,
  powerups: RankingStatSchema,
  revenges: RankingStatSchema,
  winRatio: RankingStatSchema,
  timeSpent: RankingStatSchema,
  averageLatency: RankingStatSchema,
  killDeathRatio: RankingStatSchema,
  roundPointRatio: RankingStatSchema,
});

const ServerDataSchema = z.object({
  orbs: z.number().optional(),
  wins: z.number().optional(),
  kills: z.number().optional(),
  deaths: z.number().optional(),
  points: z.number().optional(),
  rounds: z.number().optional(),
  evolves: z.number().optional(),
  ranking: RankingSchema.optional(),
  rewards: z.number().optional(),
  earnings: z.number().optional(),
  powerups: z.number().optional(),
  revenges: z.number().optional(),
  winRatio: z.number().optional(),
  timeSpent: z.number().optional(),
  winStreak: z.number().optional(),
  averageLatency: z
    .number()
    .nullable()
    .optional(),
  killDeathRatio: z.number().optional(),
  roundPointRatio: z.number().optional(),
});

// Profile schema for a user on a digital game platform
export const Profile = Entity.merge(
  z.object({
    accountId: ObjectId.optional(), // TODO; fix?
    partyId: ObjectId.optional(),
    points: z.number().optional(),
    // currency: z.number().optional(),
    telegramUserId: z.number().optional(),
    interactions: z.number().default(0),
    activityRating: z.number().default(0),
    address: z
      .string()
      .max(100)
      .optional(),
    avatar: z
      .string()
      .max(100)
      .optional(),
    roleId: ObjectId.optional(),
    privateKey: z
      .string()
      .max(300)
      .optional(),
    signature: z
      .string()
      .max(200)
      .optional(),
    chainId: ObjectId.optional(),
    teamId: ObjectId.optional(),
    characterId: ObjectId.optional(),
    isBanned: z.boolean().optional(),
    banExpireDate: z.date().optional(),
    banReason: z.string().optional(),
    mode: z
      .string()
      .default('gamer')
      .optional(),

    bio: z.string().optional(),
    banner: z
      .string()
      .url()
      .optional(), // URL to the user's banner image
    friends: z
      .array(
        z.object({
          friend: z.lazy(() => Profile),
          meta: z.any().optional(),
        })
      )
      .optional(),
    achievements: z
      .array(
        z.object({
          achievementId: ObjectId,
          meta: z.any().optional(),
          current: z.number().default(0),
        })
      )
      .optional(),
    badges: z
      .array(
        z.object({
          badgeId: ObjectId,
          meta: z.any().optional(),
        })
      )
      .optional(),
    character: Character.optional(),
    characters: z.array(ObjectId.optional()).optional(),
    settings: z
      .object({
        warp: z.any().default({}),
        designer: z.any().default({}),
        privacy: z.enum(['public', 'private', 'friends-only']).default('public'),
        notifications: z.boolean().default(true),
      })
      .optional(),
    stats: z
      .object({
        gamesOwned: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        playedMinutes: z
          .number()
          .nonnegative()
          .default(0), // Total playtime in hours
        leveledUpCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        xpEarnedCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        craftedItemCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        equippedItemCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        transferredInCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        transferredOutCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        marketTradeSoldCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        marketTradeListedCount: z
          .number()
          .int()
          .nonnegative()
          .default(0),
        evolution: z
          .object({
            hashes: z.array(z.string()).default([]),
            overall: z
              .object({
                orbs: z.number().optional(),
                wins: z.number().optional(),
                kills: z.number().optional(),
                deaths: z.number().optional(),
                points: z.number().optional(),
                rounds: z.number().optional(),
                evolves: z.number().optional(),
                ranking: RankingSchema.optional(),
                rewards: z.number().optional(),
                earnings: z.number().optional(),
                powerups: z.number().optional(),
                revenges: z.number().optional(),
                winRatio: z.number().optional(),
                timeSpent: z.number().optional(),
                winStreak: z.number().optional(),
                averageLatency: z
                  .number()
                  .optional()
                  .nullable(),
                killDeathRatio: z.number().optional(),
                roundPointRatio: z.number().optional(),
              })
              .default({}),
            servers: z.record(ServerDataSchema).optional(),
            lastUpdated: z.number().optional(),
          })
          .optional(),
      })
      .optional(),
  })
);
