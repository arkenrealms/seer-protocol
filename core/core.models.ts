// node/modules/core/core.models.ts

import * as mongo from '../util/mongo';
import type * as Types from './core.types';

const { createModel, addTagVirtuals, addApplicationVirtual } = mongo;

// MerkleTree Model
export const MerkleTree = createModel<Types.MerkleTreeDocument>(
  'MerkleTree',
  {
    root: { type: String, required: true, default: '0x' + '0'.repeat(64) },
    depth: { type: Number, required: true, default: 16 }, // log2(#leaves)
  },
  {
    // extend: 'CommonFields',
    virtuals: [...addTagVirtuals('MerkleTree'), ...addApplicationVirtual()],
  }
);

// MerkleNode Model
export const MerkleNode = createModel<Types.MerkleNodeDocument>(
  'MerkleNode',
  {
    treeId: { type: mongo.Schema.Types.ObjectId, ref: 'MerkleTree', required: true },
    level: { type: Number, required: true }, // 0 = leaves
    index: { type: Number, required: true }, // position in level
    hash: { type: String, required: true },
  },
  {
    // extend: 'CommonFields',
    indexes: [{ treeId: 1, level: 1, index: 1 }],
    virtuals: [...addTagVirtuals('MerkleNode'), ...addApplicationVirtual()],
  }
);

// Omniverse Model
export const Omniverse = createModel<Types.OmniverseDocument>(
  'Omniverse',
  {
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating' },
  },
  {
    extend: 'CommonFields',
    virtuals: [...addTagVirtuals('Omniverse'), ...addApplicationVirtual()],
  }
);

// Metaverse Model
export const Metaverse = createModel<Types.MetaverseDocument>(
  'Metaverse',
  {
    omniverseId: { type: mongo.Schema.Types.ObjectId, ref: 'Omniverse', required: true },
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating' },
  },
  {
    extend: 'CommonFields',
    virtuals: [...addTagVirtuals('Metaverse'), ...addApplicationVirtual()],
  }
);

// Application Model
export const Application = createModel<Types.ApplicationDocument>(
  'Application',
  {
    ownerId: { type: mongo.Schema.Types.ObjectId, ref: 'Account' },
    metaverseId: { type: mongo.Schema.Types.ObjectId, ref: 'Metaverse' },
    name: { type: String, required: true },
    description: { type: String },
  },
  {
    extend: 'CommonFields',
    indexes: [{ metaverseId: 1, name: 1, unique: true }],
    virtuals: [
      ...addTagVirtuals('Application'),
      { name: 'agents', ref: 'Agent', localField: '_id', foreignField: 'applicationId' },
      { name: 'chain' },
      { name: 'account' },
      { name: 'assets' },
      { name: 'badges' },
      { name: 'battlePasses' },
      { name: 'collections' },
      { name: 'communities' },
      { name: 'discussions' },
      { name: 'events' },
      { name: 'exchanges' },
      { name: 'files' },
      { name: 'ideas' },
      { name: 'leaderboards' },
      { name: 'assetLicenses' },
      { name: 'logs' },
      { name: 'marketPairs' },
      { name: 'markets' },
      { name: 'messages' },
      { name: 'offers' },
      { name: 'orders' },
      { name: 'products' },
      { name: 'projects' },
      { name: 'ratings' },
      { name: 'realms' },
      { name: 'reviews' },
      { name: 'roles' },
      { name: 'realmShards' },
      { name: 'suggestions' },
      { name: 'tags' },
      { name: 'tokens' },
      { name: 'tradeIdeas' },
      { name: 'trades' },
      { name: 'buyerTrades' },
      { name: 'transactions' },
      { name: 'votes' },
      { name: 'payments' },
      { name: 'permissions' },
      { name: 'stats' },
      { name: 'revisions' },
      { name: 'comments' },
      { name: 'interfaces' },
      { name: 'characters' },
      { name: 'metaverses' },
      { name: 'omniverses' },
      { name: 'referrals' },
      { name: 'recipientReferrals' },
      { name: 'senderReferrals' },
      { name: 'chains' },
      { name: 'characterAbilities' },
      { name: 'tournaments' },
      { name: 'teams' },
      { name: 'items' },
      { name: 'skills' },
      { name: 'itemRecipes' },
      { name: 'itemSkins' },
      { name: 'stashes' },
      { name: 'biomes' },
      { name: 'planets' },
      { name: 'solarSystems' },
      { name: 'universes' },
      { name: 'stars' },
      { name: 'areas' },
      { name: 'acts' },
      { name: 'characterClasses' },
      { name: 'characterFactions' },
      { name: 'eras' },
      { name: 'seasons' },
      { name: 'itemAttributes' },
      { name: 'itemMaterials' },
      { name: 'itemSets' },
      { name: 'itemSlots' },
      { name: 'itemRarities' },
      { name: 'itemTypes' },
      { name: 'itemSubTypes' },
      { name: 'itemSpecificTypes' },
      { name: 'characterGenders' },
      { name: 'characterRaces' },
      { name: 'characterPersonalities' },
      { name: 'characterTitles' },
      { name: 'lores' },
      { name: 'energies' },
      { name: 'guides' },
      { name: 'achievements' },
      { name: 'games' },
      { name: 'npcs' },
      { name: 'characterAttributes' },
      { name: 'characterTypes' },
      { name: 'areaTypes' },
      { name: 'areaLandmarks' },
      { name: 'biomeFeatures' },
      { name: 'skillMods' },
      { name: 'skillClassifications' },
      { name: 'skillConditions' },
      { name: 'skillStatusEffects' },
      { name: 'skillTrees' },
      { name: 'skillTreeNodes' },
      { name: 'areaNameChoices' },
      { name: 'characterNameChoices' },
      { name: 'validators' },
      { name: 'productUpdates' },
      { name: 'polls' },
      { name: 'galaxies' },
      { name: 'quests' },
      { name: 'raffles' },
      { name: 'raffleEntries' },
      { name: 'raffleRequirements' },
      { name: 'raffleRewards' },
      { name: 'proposals' },
      { name: 'companies' },
      { name: 'people' },
    ],
  }
);

// Account Model
export const Account = createModel<Types.AccountDocument>(
  'Account',
  {
    username: { type: String },
    email: { type: String },
    address: { type: String },
    addressIndex: { type: Number },
    telegramUserId: { type: Number },
    activeProfileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' },
    sessionUserId: { type: String },
  },
  {
    indexes: [
      // { applicationId: 1, username: 1, unique: true },
      {
        fields: { applicationId: 1, telegramUserId: 1 },
        options: {
          unique: true,
          partialFilterExpression: { telegramUserId: { $exists: true } },
        },
      },
    ],
    virtuals: [
      {
        name: 'profiles',
        ref: 'Profile',
        localField: '_id',
        foreignField: 'accountId',
        justOne: false,
      },
      ...addTagVirtuals('Account'),
      ...addApplicationVirtual(),
    ],
  }
);

// Achievement Model
export const Achievement = createModel<Types.AchievementDocument>(
  'Achievement',
  {},
  {
    virtuals: [...addTagVirtuals('Achievement'), ...addApplicationVirtual()],
  }
);

// Act Model
export const Act = createModel<Types.ActDocument>(
  'Act',
  {},
  {
    virtuals: [...addTagVirtuals('Act'), ...addApplicationVirtual()],
  }
);

// Agent Model
export const Agent = createModel<Types.AgentDocument>(
  'Agent',
  {},
  {
    virtuals: [...addTagVirtuals('Agent'), ...addApplicationVirtual()],
  }
);

// Badge Model
export const Badge = createModel<Types.BadgeDocument>(
  'Badge',
  {},
  {
    virtuals: [...addTagVirtuals('Badge'), ...addApplicationVirtual()],
  }
);

// BattlePass Model
export const BattlePass = createModel<Types.BattlePassDocument>(
  'BattlePass',
  {},
  {
    virtuals: [...addTagVirtuals('BattlePass'), ...addApplicationVirtual()],
  }
);

// Biome Model
export const Biome = createModel<Types.BiomeDocument>(
  'Biome',
  {},
  {
    virtuals: [...addTagVirtuals('Biome'), ...addApplicationVirtual()],
  }
);

// BiomeFeature Model
export const BiomeFeature = createModel<Types.BiomeFeatureDocument>(
  'BiomeFeature',
  {},
  {
    virtuals: [...addTagVirtuals('BiomeFeature'), ...addApplicationVirtual()],
  }
);

// Bounty Model
export const Bounty = createModel<Types.BountyDocument>(
  'Bounty',
  {},
  {
    virtuals: [...addTagVirtuals('Bounty'), ...addApplicationVirtual()],
  }
);

export const Counter = createModel<Types.CounterDocument>(
  'Counter',
  // @ts-ignore
  { _id: { type: String, required: true }, seq: { type: Number, default: 0 } },
  { versionKey: false, virtuals: [...addTagVirtuals('Counter'), ...addApplicationVirtual()] }
);

// Collection Model
export const Collection = createModel<Types.CollectionDocument>(
  'Collection',
  {},
  {
    virtuals: [...addTagVirtuals('Collection'), ...addApplicationVirtual()],
  }
);

// Comment Model
export const Comment = createModel<Types.CommentDocument>(
  'Comment',
  {
    body: { type: String, required: true },
    entity: { type: mongo.Schema.Types.ObjectId },
    entityModel: { type: String },
    text: { type: String },
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating' },
  },
  {
    virtuals: [...addTagVirtuals('Comment'), ...addApplicationVirtual()],
  }
);

// Community Model
export const Community = createModel<Types.CommunityDocument>(
  'Community',
  {
    ideas: [{ type: mongo.Schema.Types.ObjectId, ref: 'Idea' }],
    products: [{ type: mongo.Schema.Types.ObjectId, ref: 'Product' }],
    projects: [{ type: mongo.Schema.Types.ObjectId, ref: 'Project' }],
  },
  {
    virtuals: [...addTagVirtuals('Community'), ...addApplicationVirtual()],
  }
);

// Company Model
export const Company = createModel<Types.CompanyDocument>(
  'Company',
  {
    content: { type: String },
    people: [{ type: mongo.Schema.Types.ObjectId, ref: 'Person' }],
  },
  {
    virtuals: [...addTagVirtuals('Company'), ...addApplicationVirtual()],
  }
);

// =========================
// Conversation (Thread)
// =========================
//
// Key points:
// - "mailboxKey" gives you a stable unique identity for system inbox threads.
// - Participants field-level index removed; indexes centralized below.
// - lastMessageDate naming normalized.
// - Back-compat messages[] kept, but consider disabling pushes or capping.
//
export const Conversation = createModel<Types.ConversationDocument>(
  'Conversation',
  {
    // Back-compat: old "owner" thread (mailbox-style threads should set this)
    profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', index: true },

    // Mail/chat type
    kind: {
      type: String,
      enum: ['mail', 'dm', 'group', 'support', 'system'],
      default: 'mail',
      index: true,
    },

    // Participants so the same model can do mail+discord-like threads
    participants: [
      {
        profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },

        role: { type: String, enum: ['user', 'system', 'gm', 'npc'], default: 'user' },

        lastReadAt: { type: Date, default: new Date(0) },
        unreadCount: { type: Number, default: 0 },

        isMuted: { type: Boolean, default: false },
        isPinned: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
      },
    ],

    isLocked: { type: Boolean, default: true },
    allowUserSend: { type: Boolean, default: false },

    category: { type: String, default: 'system' },
    importance: { type: Number, default: 0 },

    // ✅ keep consistent with your service code (use lastMessageDate everywhere)
    lastMessageDate: { type: Date, default: null, index: true },
    lastMessagePreview: { type: String, default: '' },
    messageCount: { type: Number, default: 0 },

    // Back-compat only. Don’t rely on this for reads at scale.
    messages: [{ type: mongo.Schema.Types.ObjectId, ref: 'ConversationMessage' }],
  },
  {
    indexes: [
      // Inbox list (participant mailbox / DMs / etc.)
      { fields: { 'participants.profileId': 1, lastMessageDate: -1 } },

      // Filtered by kind (mail tab, dm tab, etc.)
      { fields: { kind: 1, 'participants.profileId': 1, lastMessageDate: -1 } },

      // Back-compat owner mailbox queries
      { fields: { profileId: 1, kind: 1, lastMessageDate: -1 } },
      {
        fields: { key: 1, profileId: 1 },
        options: {
          unique: true,
          partialFilterExpression: { profileId: { $type: 'objectId' } },
        },
      },
      {
        fields: { kind: 1, profileId: 1 },
        options: {
          unique: true,
          partialFilterExpression: { profileId: { $type: 'objectId' } },
        },
      },

      {
        fields: { applicationId: 1, kind: 1, profileId: 1, key: 1 },
        options: {
          unique: true,
          partialFilterExpression: { key: { $type: 'string' } },
        },
      },
    ],
    virtuals: [...addTagVirtuals('Conversation'), ...addApplicationVirtual()],
  }
);

// =========================
// ConversationMessage (Message)
// =========================
//
// Key points:
// - Primary paging index is (conversationId, _id:-1).
// - Claim fields use claimedDate consistently.
// - Dedupe is per-conversation (compound) and unique when present.
// - Claimable listing inside a conversation has a supporting index.
//
export const ConversationMessage = createModel<Types.ConversationMessageDocument>(
  'ConversationMessage',
  {
    conversationId: { type: mongo.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },

    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },

    type: {
      type: String,
      enum: ['text', 'notice', 'reward', 'action', 'system'],
      default: 'text',
      index: true,
    },

    isStarred: { type: Boolean, default: false, index: true },

    content: { type: String, default: '' },

    payload: { type: mongo.Schema.Types.Mixed },

    replyToId: { type: mongo.Schema.Types.ObjectId, ref: 'ConversationMessage' },

    claim: {
      isClaimable: { type: Boolean, default: false, index: true },

      // ✅ normalized field names (match your latest applyPatchesOrMail.ts)
      claimedDate: { type: Date, default: null },
      claimedByProfileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', default: null },

      dedupeKey: { type: String, default: null },

      attachments: { type: [mongo.Schema.Types.Mixed], default: [] },

      revokedDate: { type: Date, default: null },
      revokeReason: { type: String, default: null },
    },
  },
  {
    indexes: [
      // ✅ Primary paging for “latest messages”
      { fields: { conversationId: 1, _id: -1 } },

      // Optional (only if you actually sort by createdDate elsewhere)
      { fields: { conversationId: 1, createdDate: -1 } },

      // Claim listing scans (admin / analytics)
      { fields: { 'claim.isClaimable': 1, 'claim.claimedDate': 1 } },

      // Claim listing inside a conversation (UI list “claimable first”)
      { fields: { conversationId: 1, 'claim.isClaimable': 1, 'claim.claimedDate': 1, _id: -1 } },

      // Fast dedupe lookup per conversation
      { fields: { conversationId: 1, 'claim.dedupeKey': 1 } },

      // ✅ Enforce dedupeKey uniqueness per conversation when present
      {
        fields: { conversationId: 1, 'claim.dedupeKey': 1 },
        options: {
          unique: true,
          partialFilterExpression: { 'claim.dedupeKey': { $type: 'string' } },
        },
      },

      { fields: { isStarred: 1, conversationId: 1, _id: -1 } },
    ],
    virtuals: [...addTagVirtuals('ConversationMessage'), ...addApplicationVirtual()],
  }
);

// Data Model
export const Data = createModel<Types.DataDocument>(
  'Data',
  {
    mod: { type: String, required: true },
  },
  {
    virtuals: [...addTagVirtuals('Data'), ...addApplicationVirtual()],
  }
);

export const Meta = createModel<Types.DataDocument>(
  'Meta',
  {},
  {
    virtuals: [...addTagVirtuals('Meta'), ...addApplicationVirtual()],
  }
);

// Discussion Model
export const Discussion = createModel<Types.DiscussionDocument>(
  'Discussion',
  {
    content: { type: String },
    parentId: { type: mongo.Schema.Types.ObjectId, ref: 'Discussion' },
    rootMessageId: { type: mongo.Schema.Types.ObjectId, ref: 'Message' },
    type: { type: String, default: 'Discussion' },
  },
  {
    virtuals: [...addTagVirtuals('Discussion'), ...addApplicationVirtual()],
  }
);

// Energy Model
export const Energy = createModel<Types.EnergyDocument>(
  'Energy',
  {},
  {
    virtuals: [...addTagVirtuals('Energy'), ...addApplicationVirtual()],
  }
);

// Event Model
export const Event = createModel<Types.EventDocument>(
  'Event',
  {},
  {
    virtuals: [...addTagVirtuals('Event'), ...addApplicationVirtual()],
  }
);

// File Model
export const File = createModel<Types.FileDocument>(
  'File',
  {
    content: { type: String },
    storageType: { type: String, max: 100 },
    accessType: { type: String, max: 100 },
  },
  {
    virtuals: [...addTagVirtuals('File'), ...addApplicationVirtual()],
  }
);

// Galaxy Model
export const Galaxy = createModel<Types.GalaxyDocument>(
  'Galaxy',
  {
    universeId: { type: mongo.Schema.Types.ObjectId, ref: 'Universe' },
  },
  {
    virtuals: [...addTagVirtuals('Galaxy'), ...addApplicationVirtual()],
  }
);

// Guide Model
export const Guide = createModel<Types.GuideDocument>(
  'Guide',
  {
    content: { type: String },
    gameId: { type: mongo.Schema.Types.ObjectId, ref: 'Game' },
    attachments: [mongo.Schema.Types.Mixed],
  },
  {
    virtuals: [...addTagVirtuals('Guide'), ...addApplicationVirtual()],
  }
);

// Idea Model
export const Idea = createModel<Types.IdeaDocument>(
  'Idea',
  {
    type: { type: String, max: 100 },
    communityId: { type: mongo.Schema.Types.ObjectId, ref: 'Community' },
  },
  {
    virtuals: [...addTagVirtuals('Idea'), ...addApplicationVirtual()],
  }
);

// Leaderboard Model
export const Leaderboard = createModel<Types.LeaderboardDocument>(
  'Leaderboard',
  {
    productId: { type: mongo.Schema.Types.ObjectId, ref: 'Product' },
  },
  {
    virtuals: [...addTagVirtuals('Leaderboard'), ...addApplicationVirtual()],
  }
);

// Log Model
export const Log = createModel<Types.LogDocument>(
  'Log',
  {
    mod: { type: String, required: true },
    messages: [mongo.Schema.Types.Mixed],
    // tags: [mongo.Schema.Types.Mixed],
  },
  {
    virtuals: [...addTagVirtuals('Log'), ...addApplicationVirtual()],
  }
);

// Lore Model
export const Lore = createModel<Types.LoreDocument>(
  'Lore',
  {
    gameId: { type: mongo.Schema.Types.ObjectId, ref: 'Game' },
  },
  {
    virtuals: [...addTagVirtuals('Lore'), ...addApplicationVirtual()],
  }
);

// Market Model
export const Market = createModel<Types.MarketDocument>(
  'Market',
  {},
  {
    virtuals: [...addTagVirtuals('Market'), ...addApplicationVirtual()],
  }
);

// Memory Model
export const Memory = createModel<Types.MemoryDocument>(
  'Memory',
  {},
  {
    virtuals: [...addTagVirtuals('Memory'), ...addApplicationVirtual()],
  }
);

// Message Model
export const Message = createModel<Types.MessageDocument>(
  'Message',
  {
    content: { type: String },
    type: { type: String, max: 100 },
    replyToId: { type: mongo.Schema.Types.ObjectId, ref: 'Message' },
    parentId: { type: mongo.Schema.Types.ObjectId, ref: 'Message' },
    conversationId: { type: mongo.Schema.Types.ObjectId, ref: 'Conversation' },
    // messages: [{ type: mongo.Schema.Types.ObjectId, ref: 'Message' }],
  },
  {
    virtuals: [...addTagVirtuals('Message'), ...addApplicationVirtual()],
  }
);

// NewsArticle Model
export const NewsArticle = createModel<Types.NewsArticleDocument>(
  'NewsArticle',
  {
    href: { type: String, required: true },
    source: { type: String, required: true },
  },
  {
    virtuals: [...addTagVirtuals('NewsArticle'), ...addApplicationVirtual()],
  }
);

// Npc Model
export const Npc = createModel<Types.NpcDocument>(
  'Npc',
  {
    characterId: { type: mongo.Schema.Types.ObjectId, ref: 'Character' },
  },
  {
    virtuals: [...addTagVirtuals('Npc'), ...addApplicationVirtual()],
  }
);

// Offer Model
export const Offer = createModel<Types.OfferDocument>(
  'Offer',
  {},
  {
    virtuals: [...addTagVirtuals('Offer'), ...addApplicationVirtual()],
  }
);

// Order Model
export const Order = createModel<Types.OrderDocument>(
  'Order',
  {},
  {
    virtuals: [...addTagVirtuals('Order'), ...addApplicationVirtual()],
  }
);

// Payment Model
export const Payment = createModel<Types.PaymentDocument>(
  'Payment',
  {
    status: {
      type: String,
      default: 'Submitted',
      enum: [
        'Archived',
        'Processing',
        'Failed',
        'Submitted',
        'Denied',
        'Processed',
        'Voided',
        'Completed',
        'Refunding',
        'Refunded',
        'Expired',
      ],
    },
  },
  {
    virtuals: [{ name: 'owner' }, ...addTagVirtuals('Payment'), ...addApplicationVirtual()],
  }
);

// Permission Model
export const Permission = createModel<Types.PermissionDocument>(
  'Permission',
  {
    roles: [{ type: mongo.Schema.Types.ObjectId, ref: 'Role' }],
  },
  {
    virtuals: [...addTagVirtuals('Permission'), ...addApplicationVirtual()],
  }
);

// Person Model
export const Person = createModel<Types.PersonDocument>(
  'Person',
  {
    content: { type: String },
    companyId: { type: mongo.Schema.Types.ObjectId, ref: 'Company' },
  },
  {
    virtuals: [...addTagVirtuals('Person'), ...addApplicationVirtual()],
  }
);

// Planet Model
export const Planet = createModel<Types.PlanetDocument>(
  'Planet',
  {
    solarSystemId: { type: mongo.Schema.Types.ObjectId, ref: 'SolarSystem' },
  },
  {
    virtuals: [...addTagVirtuals('Planet'), ...addApplicationVirtual()],
  }
);

// Poll Model
export const Poll = createModel<Types.PollDocument>(
  'Poll',
  {},
  {
    virtuals: [...addTagVirtuals('Poll'), ...addApplicationVirtual()],
  }
);

// Project Model
export const Project = createModel<Types.ProjectDocument>(
  'Project',
  {
    content: { type: String },
    contractStatus: { type: String, default: 'Pending' },
    parentId: { type: mongo.Schema.Types.ObjectId, ref: 'Project' },
    realmId: { type: mongo.Schema.Types.ObjectId, ref: 'Realm' },
    communityId: { type: mongo.Schema.Types.ObjectId, ref: 'Community' },
    productId: { type: mongo.Schema.Types.ObjectId, ref: 'Product' },
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating' },
  },
  {
    virtuals: [...addTagVirtuals('Project'), ...addApplicationVirtual()],
  }
);

// Proposal Model
export const Proposal = createModel<Types.ProposalDocument>(
  'Proposal',
  {
    content: { type: String },
  },
  {
    virtuals: [...addTagVirtuals('Proposal'), ...addApplicationVirtual()],
  }
);

// Quest Model
export const Quest = createModel<Types.QuestDocument>(
  'Quest',
  {
    type: { type: String, default: 'zone' },
  },
  {
    virtuals: [...addTagVirtuals('Quest'), ...addApplicationVirtual()],
  }
);

// Question Model
export const Question = createModel<Types.QuestionDocument>(
  'Question',
  {
    topics: [mongo.Schema.Types.Mixed],
    text: { type: String, required: true },
    answer: { type: String, required: true },
    popularity: { type: Number },
  },
  {
    virtuals: [...addTagVirtuals('Question'), ...addApplicationVirtual()],
  }
);

// Rating Model
export const Rating = createModel<Types.RatingDocument>(
  'Rating',
  {
    votes: [{ type: mongo.Schema.Types.ObjectId, ref: 'Vote' }],
  },
  {
    virtuals: [...addTagVirtuals('Rating'), ...addApplicationVirtual()],
  }
);

// Realm Model
export const Realm = createModel<Types.RealmDocument>(
  'Realm',
  {
    endpoint: { type: String },
    status: { type: String },
    clientCount: { type: Number },
    regionCode: { type: String },
    gameId: { type: mongo.Schema.Types.ObjectId, ref: 'Game', required: true },
  },
  {
    virtuals: [
      ...addTagVirtuals('Realm'),
      ...addApplicationVirtual(),
      { name: 'realmShards' },
      { name: 'realmTraits' },
      { name: 'realmEvents' },
    ],
  }
);

// RealmEvent Model
export const RealmEvent = createModel<Types.RealmEventDocument>(
  'RealmEvent',
  {
    description: { type: String, required: true },
    startDate: { type: Date, required: false },
    endDate: { type: Date, required: false },
  },
  {
    virtuals: [...addTagVirtuals('RealmEvent'), ...addApplicationVirtual()],
  }
);

// RealmTrait Model
export const RealmTrait = createModel<Types.RealmTraitDocument>(
  'RealmTrait',
  {
    description: { type: String, required: true },
  },
  {
    virtuals: [...addTagVirtuals('RealmTrait'), ...addApplicationVirtual()],
  }
);

// Referral Model
export const Referral = createModel<Types.ReferralDocument>(
  'Referral',
  {
    recipientId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },
    senderId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },
  },
  {
    virtuals: [...addTagVirtuals('Referral'), ...addApplicationVirtual()],
  }
);

// Review Model
export const Review = createModel<Types.ReviewDocument>(
  'Review',
  {
    value: { type: String },
  },
  {
    virtuals: [...addTagVirtuals('Review'), ...addApplicationVirtual()],
  }
);

// Role Model
export const Role = createModel<Types.RoleDocument>(
  'Role',
  {
    value: { type: String },
    profiles: [{ type: mongo.Schema.Types.ObjectId, ref: 'Profile' }],
    permissions: [{ type: mongo.Schema.Types.ObjectId, ref: 'Permission' }],
  },
  {
    virtuals: [...addTagVirtuals('Role'), ...addApplicationVirtual()],
  }
);

// Season Model
export const Season = createModel<Types.SeasonDocument>(
  'Season',
  {},
  {
    virtuals: [...addTagVirtuals('Season'), ...addApplicationVirtual()],
  }
);

// RealmShard Model
export const RealmShard = createModel<Types.RealmShardDocument>(
  'RealmShard',
  {
    realmId: { type: mongo.Schema.Types.ObjectId, ref: 'Realm' },
    endpoint: { type: String },
    status: { type: String },
    clientCount: { type: Number },
  },
  {
    virtuals: [...addTagVirtuals('RealmShard'), ...addApplicationVirtual()],
  }
);

// Session Model
export const Session = createModel<Types.SessionDocument>(
  'Session',
  {
    expired: { type: Date, required: true },
  },
  {
    virtuals: [...addTagVirtuals('Session'), ...addApplicationVirtual()],
  }
);

// SolarSystem Model
export const SolarSystem = createModel<Types.SolarSystemDocument>(
  'SolarSystem',
  {
    galaxyId: { type: mongo.Schema.Types.ObjectId, ref: 'Galaxy' },
  },
  {
    virtuals: [...addTagVirtuals('SolarSystem'), ...addApplicationVirtual()],
  }
);

// Star Model
export const Star = createModel<Types.StarDocument>(
  'Star',
  {},
  {
    virtuals: [...addTagVirtuals('Star'), ...addApplicationVirtual()],
  }
);

// Stat Model
export const Stat = createModel<Types.StatDocument>(
  'Stat',
  {
    number: { type: Number, default: 0 },
  },
  {
    virtuals: [...addTagVirtuals('Stat'), ...addApplicationVirtual()],
  }
);

// Stash Model
export const Stash = createModel<Types.StashDocument>(
  'Stash',
  {},
  {
    virtuals: [...addTagVirtuals('Stash'), ...addApplicationVirtual()],
  }
);

// Stock Model
export const Stock = createModel<Types.StockDocument>(
  'Stock',
  {
    rank: { type: Number, min: 0 },
    price: { type: Number, min: 0 },
    hourChange: { type: Number },
    dayChange: { type: Number },
    weekChange: { type: Number },
    marketCap: { type: Number, min: 0 },
    volume: { type: Number, min: 0 },
    ticker: { type: String },
    unusualActivity: { type: Number, min: 0 },
  },
  {
    virtuals: [...addTagVirtuals('Stock'), ...addApplicationVirtual()],
  }
);

// Suggestion Model
export const Suggestion = createModel<Types.SuggestionDocument>(
  'Suggestion',
  {
    content: { type: String },
  },
  {
    virtuals: [...addTagVirtuals('Suggestion'), ...addApplicationVirtual()],
  }
);

// Tag Model
export const Tag = createModel<Types.TagDocument>(
  'Tag',
  {
    value: { type: String },
  },
  {
    virtuals: [...addApplicationVirtual()],
  }
);

// Team Model
export const Team = createModel<Types.TeamDocument>(
  'Team',
  {
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating' },
    points: { type: Number, default: 0 },
    memberCount: { type: Number, default: 0 },
  },
  {
    virtuals: [
      ...addTagVirtuals('Team'),
      ...addApplicationVirtual(),
      {
        name: 'profiles',
        ref: 'Profile',
        localField: '_id',
        foreignField: 'teamId',
      },
    ],
  }
);

// Tournament Model
export const Tournament = createModel<Types.TournamentDocument>(
  'Tournament',
  {},
  {
    virtuals: [...addTagVirtuals('Tournament'), ...addApplicationVirtual()],
  }
);

// Trade Model
export const Trade = createModel<Types.TradeDocument>(
  'Trade',
  {
    status: {
      type: String,
      default: 'Active',
      enum: ['Paused', 'Pending', 'Active', 'Delisted', 'Sold'],
    },
    chainId: { type: mongo.Schema.Types.ObjectId, ref: 'Chain' },
    buyerId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' },
    parentId: { type: mongo.Schema.Types.ObjectId, ref: 'Trade' },
    productId: { type: mongo.Schema.Types.ObjectId, ref: 'Product' },
    sellerId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' },
    tokenId: { type: mongo.Schema.Types.ObjectId, ref: 'ChainToken' },
  },
  {
    virtuals: [...addTagVirtuals('Trade'), ...addApplicationVirtual()],
  }
);

// Universe Model
export const Universe = createModel<Types.UniverseDocument>(
  'Universe',
  {},
  {
    virtuals: [...addTagVirtuals('Universe'), ...addApplicationVirtual()],
  }
);

// Validator Model
export const Validator = createModel<Types.ValidatorDocument>(
  'Validator',
  {},
  {
    virtuals: [...addTagVirtuals('Validator'), ...addApplicationVirtual()],
  }
);

// Vote Model
export const Vote = createModel<Types.VoteDocument>(
  'Vote',
  {
    ratingId: { type: mongo.Schema.Types.ObjectId, ref: 'Rating' },
  },
  {
    virtuals: [
      {
        name: 'parent',
        ref: 'Node',
        localField: '_id',
        foreignField: 'from',
        justOne: true,
        match: { fromModel: 'Vote' },
      },
      {
        name: 'owner',
        ref: 'Profile',
        localField: '_id',
        foreignField: '_id',
        justOne: true,
      },
      ...addTagVirtuals('Vote'),
      ...addApplicationVirtual(),
    ],
  }
);

// WorldEvent Model
export const WorldEvent = createModel<Types.WorldEventDocument>(
  'WorldEvent',
  {
    text: { type: String, required: true },
    importance: { type: Number },
    // tags: [mongo.Schema.Types.Mixed],
  },
  {
    virtuals: [...addTagVirtuals('WorldEvent'), ...addApplicationVirtual()],
  }
);

// WorldRecord Model
export const WorldRecord = createModel<Types.WorldRecordDocument>(
  'WorldRecord',
  {
    holderId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile' },
    score: { type: Number },
    // tags: [mongo.Schema.Types.Mixed],
  },
  {
    virtuals: [
      {
        name: 'holder',
        ref: 'Profile',
        localField: '_id',
        foreignField: '_id',
        justOne: true,
      },
      ...addTagVirtuals('WorldRecord'),
      ...addApplicationVirtual(),
    ],
  }
);

// Node Model (for polymorphic relationships)
export const Node = createModel<Types.NodeDocument>(
  'Node',
  {
    relationKey: { type: String, required: true },
    fromModel: { type: String, required: true },
    from: { type: mongo.Schema.Types.ObjectId, required: true },
    toModel: { type: String, required: true },
    to: { type: mongo.Schema.Types.ObjectId, required: true },
  },
  {
    indexes: [
      { fromModel: 1, from: 1 },
      { toModel: 1, to: 1 },
    ],
  }
);

export const Prefab = createModel<Types.PrefabDocument>(
  'Prefab',
  {
    name: { type: String, required: true },
    fbxPath: { type: String, required: true },
    customizationOptions: { type: mongo.Schema.Types.Mixed }, // e.g., color, scale range, etc.
    childPrefabs: [
      {
        prefabId: { type: mongo.Schema.Types.ObjectId, ref: 'Prefab' },
        position: { type: mongo.Schema.Types.Mixed }, // Relative position within parent prefab
        rotation: { type: mongo.Schema.Types.Mixed },
        scale: { type: Number, default: 1.0 },
      },
    ],
  },
  {
    extend: 'EntityFields',
    virtuals: [...addTagVirtuals('Prefab'), ...addApplicationVirtual()],
  }
);

export const Object = createModel<Types.ObjectDocument>(
  'Object',
  {
    prefabId: { type: mongo.Schema.Types.ObjectId, ref: 'Prefab', required: true },
    // profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },
    // worldCoordinates: {
    //   x: { type: Number, required: true },
    //   y: { type: Number, required: true },
    //   z: { type: Number, required: true },
    // },
    rotation: { type: mongo.Schema.Types.Mixed },
    scale: { type: Number, default: 1.0 },
    customizations: { type: mongo.Schema.Types.Mixed },
    childInstances: [
      {
        prefabId: { type: mongo.Schema.Types.ObjectId, ref: 'Prefab' },
        worldCoordinates: { type: mongo.Schema.Types.Mixed },
        rotation: { type: mongo.Schema.Types.Mixed },
        scale: { type: Number, default: 1.0 },
      },
    ],
  },
  {
    extend: 'EntityFields',
    virtuals: [...addTagVirtuals('Object'), ...addApplicationVirtual()],
  }
);

export const ObjectInteraction = createModel<Types.ObjectInteractionDocument>(
  'ObjectInteraction',
  {
    profileId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: true },
    objectId: { type: mongo.Schema.Types.ObjectId, ref: 'Object', required: true },
    interactionType: { type: String, enum: ['use', 'fight', 'open', 'talk'], required: true },
    outcome: { type: mongo.Schema.Types.Mixed },
    // timestamp: { type: Date, default: Date.now },
  },
  {
    extend: 'EntityFields',
    virtuals: [...addTagVirtuals('Interaction'), ...addApplicationVirtual()],
  }
);

// Party Model
export const Party = createModel<Types.PartyDocument>(
  'Party',
  {
    targetAreaId: { type: mongo.Schema.Types.ObjectId, ref: 'Area', required: false }, // Adjust 'Area' to actual collection if known
    limit: { type: Number, default: 6 },
    isPublic: { type: Boolean, default: true },
    isVisibleToEnemies: { type: Boolean, default: true },
    isApprovalRequired: { type: Boolean, default: false },
    isNonLeaderInviteAllowed: { type: Boolean, default: false },
    isCombatEnabled: { type: Boolean, default: true },
    isFriendlyFireEnabled: { type: Boolean, default: true },
    isLocalQuestShared: { type: Boolean, default: true },
    isGlobalQuestShared: { type: Boolean, default: true },
    isMergeEnabled: { type: Boolean, default: false },
    isRejoinEnabled: { type: Boolean, default: false },
    itemDistribution: {
      type: String,
      enum: ['Random', 'Personal'],
      required: true,
    },
    leaderId: { type: mongo.Schema.Types.ObjectId, ref: 'Profile', required: false }, // Adjust 'Profile' to actual collection if known
    powerRequired: { type: Number, required: true, default: 1 },
    levelRequired: { type: Number, required: true, default: 1 },
    approvalMethod: {
      type: String,
      enum: ['Auto Accept', 'Approval Required'],
      required: true,
    },
    memberIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'Profile' }], // Adjust 'Profile' if necessary
    assistantIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'Profile' }],
    pendingMemberIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'Profile' }],
    blockedMemberIds: [{ type: mongo.Schema.Types.ObjectId, ref: 'Profile' }],
  },
  {
    virtuals: [
      { name: 'owner' },
      {
        name: 'members',
        ref: 'Profile',
        localField: '_id',
        foreignField: 'partyId',
      },
      ...addTagVirtuals('Party'),
      ...addApplicationVirtual(),
    ],
  }
);

export const SeerEvent = mongo.createModel<Types.SeerEventDocument>(
  'SeerEvent',
  {
    kind: { type: String, required: true }, // model name: 'Character', 'Item', etc.
    operation: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true,
    },
    recordId: { type: String, required: true },
    applicationId: { type: mongo.Schema.Types.ObjectId, ref: 'Application' },

    // ✅ this is the important fix: schema *object* with `type: Mixed`
    payload: { type: mongo.Schema.Types.Mixed, required: true },

    seq: { type: Number, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    // extend: 'CommonFields', // or 'EntityFields' if you want applicationId/ownerId, but you already have applicationId above
    indexes: [{ seq: 1 }, { timestamp: 1 }],
  }
);

export const SeerPayload = mongo.createModel<Types.SeerPayloadDocument>(
  'SeerPayload',
  {
    fromSeer: { type: String, required: true },
    applicationId: { type: mongo.Schema.Types.ObjectId, ref: 'Application' },

    // list of raw events we snapshot
    // TS doesn't love `[Mixed]`, so we cast this field only
    events: {
      type: [mongo.Schema.Types.Mixed],
      default: [],
    } as any,

    eventsHash: { type: String, required: true },
    merkleRoot: { type: String, required: true },

    proof: { type: mongo.Schema.Types.Mixed, required: false },
    publicSignals: { type: [String], default: [] },
  },
  {
    // extend: 'CommonFields',
    indexes: [{ createdDate: 1 }],
  }
);
