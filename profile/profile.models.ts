// profile.models.ts
//
import * as mongo from '../util/mongo';
import type * as Types from './profile.types';

const { addTagVirtuals, addApplicationVirtual } = mongo;

const RankingStatSchema = new mongo.Schema(
  {
    total: { type: Number, required: true },
    position: { type: Number, required: true },
  },
  { _id: false }
);

const RankingSchema = new mongo.Schema(
  {
    orbs: { type: RankingStatSchema, required: true },
    wins: { type: RankingStatSchema, required: true },
    kills: { type: RankingStatSchema, required: true },
    deaths: { type: RankingStatSchema, required: true },
    points: { type: RankingStatSchema, required: true },
    rounds: { type: RankingStatSchema, required: true },
    evolves: { type: RankingStatSchema, required: true },
    rewards: { type: RankingStatSchema, required: true },
    powerups: { type: RankingStatSchema, required: true },
    revenges: { type: RankingStatSchema, required: true },
    winRatio: { type: RankingStatSchema, required: true },
    timeSpent: { type: RankingStatSchema, required: true },
    averageLatency: { type: RankingStatSchema, required: true },
    killDeathRatio: { type: RankingStatSchema, required: true },
    roundPointRatio: { type: RankingStatSchema, required: true },
  },
  { _id: false }
);

const ServerDataSchema = new mongo.Schema(
  {
    orbs: { type: Number },
    wins: { type: Number },
    kills: { type: Number },
    deaths: { type: Number },
    points: { type: Number },
    rounds: { type: Number },
    evolves: { type: Number },
    ranking: { type: RankingSchema },
    rewards: { type: Number },
    earnings: { type: Number },
    powerups: { type: Number },
    revenges: { type: Number },
    winRatio: { type: Number },
    timeSpent: { type: Number },
    winStreak: { type: Number },
    averageLatency: { type: Number, default: null },
    killDeathRatio: { type: Number },
    roundPointRatio: { type: Number },
  },
  { _id: false }
);

const EvolutionSchema = new mongo.Schema(
  {
    hashes: [{ type: String }],
    overall: {
      orbs: { type: Number },
      wins: { type: Number },
      kills: { type: Number },
      deaths: { type: Number },
      points: { type: Number },
      rounds: { type: Number },
      evolves: { type: Number },
      ranking: { type: RankingSchema },
      rewards: { type: Number },
      earnings: { type: Number },
      powerups: { type: Number },
      revenges: { type: Number },
      winRatio: { type: Number },
      timeSpent: { type: Number },
      winStreak: { type: Number },
      averageLatency: { type: Number },
      killDeathRatio: { type: Number },
      roundPointRatio: { type: Number },
    },
    servers: { type: Map, of: ServerDataSchema },
    lastUpdated: { type: Number },
  },
  { _id: false }
);

// StatsSchema
const StatsSchema = new mongo.Schema(
  {
    gamesOwned: { type: Number, default: 0 },
    playedMinutes: { type: Number, default: 0 },
    leveledUpCount: { type: Number, default: 0 },
    xpEarnedCount: { type: Number, default: 0 },
    craftedItemCount: { type: Number, default: 0 },
    equippedItemCount: { type: Number, default: 0 },
    transferredInCount: { type: Number, default: 0 },
    transferredOutCount: { type: Number, default: 0 },
    marketTradeSoldCount: { type: Number, default: 0 },
    marketTradeListedCount: { type: Number, default: 0 },
    evolution: { type: EvolutionSchema },
  },
  { _id: false }
);

const SettingsSchema = new mongo.Schema(
  {
    warp: { type: mongo.Schema.Types.Mixed, default: {} },
    designer: { type: mongo.Schema.Types.Mixed, default: {} },
    privacy: {
      type: String,
      enum: ['public', 'private', 'friends-only'],
      default: 'public',
    },
    notifications: { type: Boolean, default: true },
  },
  { _id: false }
);

// const CharacterSubSchema = new mongo.Schema(
//   {
//     characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character', required: true, autopopulate: true },
//     meta: { type: mongo.Schema.Types.Mixed, default: {} },
//   },
//   { _id: false }
// );

// CharacterSubSchema.virtual('character', {
//   ref: 'Character', // The model to use
//   localField: 'characterId', // Find in `Character` where `_id` matches `characterId`
//   foreignField: '_id',
//   justOne: true, // Since `characterId` is a single reference
// });

export const Profile = mongo.createModel<Types.ProfileDocument>(
  'Profile',
  {
    accountId: { type: mongo.Schema.Types.ObjectId, ref: 'Account', required: true },
    points: { type: Number, default: 0 },
    // coins: { type: Number, default: 0 },
    telegramUserId: { type: Number },
    interactions: { type: Number, default: 0 },
    activityRating: { type: Number, default: 0 },
    address: { type: String, maxlength: 100 },
    avatar: { type: String, maxlength: 100 },
    roleId: { type: mongo.Schema.Types.ObjectId, ref: 'Role' },
    privateKey: { type: String, maxlength: 300 },
    signature: { type: String, maxlength: 200 },
    chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain' },
    teamId: { type: mongo.Schema.Types.ObjectId, ref: 'Team' },
    characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character' },
    partyId: { type: mongo.Schema.Types.ObjectId, ref: 'Party' },
    isBanned: { type: Boolean },
    banExpireDate: { type: Date },
    banReason: { type: String },
    bio: { type: String },
    banner: { type: String },
    mode: { type: String, default: 'gamer' },
    friends: [
      {
        profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },
        meta: { type: mongo.Schema.Types.Mixed, default: {} },
      },
    ],
    badges: [
      {
        badgeId: { type: mongo.Schema.Types.ObjectId, ref: 'Badge', required: true },
        meta: { type: mongo.Schema.Types.Mixed, default: {} },
      },
    ],
    settings: SettingsSchema,
    stats: StatsSchema,
    achievements: [
      {
        achievementId: { type: mongo.Schema.Types.ObjectId, ref: 'Achievement', required: true },
        meta: { type: mongo.Schema.Types.Mixed, default: {} },
        current: { type: Number, default: 0 },
      },
    ],
  },
  {
    virtuals: [
      ...addTagVirtuals('Profile'),
      ...addApplicationVirtual(),
      {
        name: 'character',
      },
      {
        name: 'characters',
        ref: 'Character',
        localField: '_id',
        foreignField: 'ownerId',
      },
      {
        name: 'chain',
      },
      {
        name: 'role',
      },
      {
        name: 'account',
      },
      {
        name: 'team',
      },
    ],
    indexes: [
      { applicationId: 1, telegramUserId: 1, unique: true },
      { applicationId: 1, accountId: 1, name: 1, unique: true },
    ],
  }
);
