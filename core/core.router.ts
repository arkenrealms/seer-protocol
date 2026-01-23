// node/module/core/core.router.ts

import { z as zod } from 'zod';
import { initTRPC, inferRouterInputs } from '@trpc/server';
import { customErrorFormatter, hasRole } from '../util/rpc';
import type { RouterContext } from '../types';
import { Query, getQueryInput, getQueryOutput, inferRouterOutputs } from '../schema';
import {
  Account,
  Achievement,
  Act,
  Agent,
  Application,
  Badge,
  BattlePass,
  Biome,
  BiomeFeature,
  Bounty,
  Collection,
  Comment,
  Community,
  Company,
  Conversation,
  ConversationMessage,
  Data,
  Discussion,
  Energy,
  Event,
  File,
  Galaxy,
  Guide,
  Idea,
  Leaderboard,
  Log,
  Lore,
  Market,
  Memory,
  Message,
  Metaverse,
  NewsArticle,
  Npc,
  Offer,
  Omniverse,
  Order,
  Payment,
  Permission,
  Person,
  Planet,
  Poll,
  Project,
  Proposal,
  Quest,
  Rating,
  Realm,
  RealmEvent,
  RealmShard,
  Revision,
  Referral,
  Review,
  Role,
  Season,
  Session,
  SolarSystem,
  Star,
  Stash,
  Stock,
  Suggestion,
  Tag,
  Team,
  Tournament,
  Trade,
  Universe,
  Validator,
  Vote,
  WorldEvent,
  WorldRecord,
  Stat,
} from './core.schema';

export const z = zod;
export const t = initTRPC.context<RouterContext>().create();
export const router = t.router;
export const procedure = t.procedure;

export const createRouter = () =>
  router({
    // Conversation Procedures
    getConversation: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Conversation))
      .output(Conversation)
      .query(({ input, ctx }) => (ctx.app.service.Core.getConversation as any)(input, ctx)),

    createConversation: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Conversation))
      .output(Conversation.pick({ id: true, name: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createConversation as any)(input, ctx)),

    updateConversation: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Conversation))
      .output(Conversation.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateConversation as any)(input, ctx)),

    // deleteConversation: procedure
    //   .use(hasRole('user', t))
    //   .use(customErrorFormatter(t))
    //   .input(getQueryInput(Conversation))
    //   // .output(Conversation.pick({ id: true }))
    //   .mutation(({ input, ctx }) => (ctx.app.service.Core.deleteConversation as any)(input, ctx)),

    getConversations: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Conversation))
      .output(z.object({ items: z.array(Conversation), total: z.number() }))
      .query(({ input, ctx }) => (ctx.app.service.Core.getConversations as any)(input, ctx)),

    // ConversationMessage Procedures
    getConversationMessage: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ConversationMessage))
      .output(ConversationMessage)
      .query(({ input, ctx }) => (ctx.app.service.Core.getConversationMessage as any)(input, ctx)),

    getConversationMessages: procedure
      .use(hasRole('user', t)) // was 'guest', 'user' is usually what you want
      .use(customErrorFormatter(t))
      .input(getQueryInput(ConversationMessage))
      .output(z.object({ items: z.array(ConversationMessage), total: z.number() }))
      .query(({ input, ctx }) => (ctx.app.service.Core.getConversationMessages as any)(input, ctx)),

    createConversationMessage: procedure
      .use(hasRole('user', t)) // was 'admin'
      .use(customErrorFormatter(t))
      .input(getQueryInput(ConversationMessage))
      // better: return the full message (or pick what you care about)
      .output(ConversationMessage)
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createConversationMessage as any)(input, ctx)),

    updateConversationMessage: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(ConversationMessage))
      .output(ConversationMessage.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateConversationMessage as any)(input, ctx)),

    claimConversationMessage: procedure
      .use(customErrorFormatter(t))
      .input(
        z.object({
          messageId: z.string().min(6),
          characterId: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Core.claimConversationMessage as any)(input, ctx)),

    setConversationMessageStar: procedure
      .use(customErrorFormatter(t))
      .input(
        z.object({
          messageId: z.string().min(6),
          isStarred: z.boolean().optional(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Core.setConversationMessageStar as any)(input, ctx)),
    // ------------------------------------
    // Mark messages as read (status='Read') — id list OR convo+limit
    // --------------------------------------------
    markConversationRead: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z
          .object({
            messageIds: z.array(z.string().min(6)).optional(),
            conversationId: z.string().min(6).optional(),
            limit: z.number().int().min(1).max(200).optional(),
          })
          .optional()
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Core.markConversationRead as any)(input, ctx)),

    // --------------------------------------------
    // Archive all read mail in a conversation (status='Archived')
    // --------------------------------------------
    archiveReadConversations: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z
          .object({
            conversationId: z.string().min(6),
          })
          .optional()
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Core.archiveReadConversations as any)(input, ctx)),

    // --------------------------------------------
    // Server-side "Read & Claim All" (one call)
    // --------------------------------------------
    readAndClaimLatestMail: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(
        z
          .object({
            conversationId: z.string().min(6),
            limit: z.number().int().min(1).max(200).optional(),
            characterId: z.string().min(6).optional(),
          })
          .optional()
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Core.readAndClaimLatestMail as any)(input, ctx)),

    distributeSantaChristmasTicketToProfile: procedure
      .use(customErrorFormatter(t))
      .input(
        z.object({
          profileId: z.string().min(6),
          dedupeKey: z.string().optional(),
        })
      )
      .mutation(({ input, ctx }) => (ctx.app.service.Core.distributeSantaChristmasTicketToProfile as any)(input, ctx)),

    distributeSantaChristmasTicket: procedure
      .input(
        z
          .object({
            batchSize: z.number().int().min(100).max(5000).optional(),
            dedupeKey: z.string().min(3).optional(),
          })
          .optional()
      )
      .query(({ input, ctx }) => (ctx.app.service.Core.distributeSantaChristmasTicket as any)(input, ctx)),

    syncGetPayloadsSince: procedure
      .input(
        z.object({
          since: z.string().datetime(),
        })
      )
      .query(({ input, ctx }) => (ctx.app.service.Core.syncGetPayloadsSince as any)(input, ctx)),

    updateSettings: procedure
      .use(hasRole('user', t))
      .use(customErrorFormatter(t))
      .input(z.any())
      .query(({ input, ctx }) => (ctx.app.service.Core.updateSettings as any)(input, ctx)),

    ask: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          data: z.object({
            conversationId: z.string(),
            messages: z.any(),
            // role: 'user' | 'assistant' | 'system';
            // content: string;
          }),
        })
      )
      // .output(Account)
      .mutation(({ input, ctx }) => (ctx.app.service.Core.ask as any)(input, ctx)),

    authorize: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(
        z.object({
          address: z.string(),
          token: z.string().optional(),
          data: z.string().optional(),
          loginAs: z.string().optional(),
        })
      )
      // .output(Account)
      .mutation(({ input, ctx }) => (ctx.app.service.Core.authorize as any)(input, ctx)),

    getAccount: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Account))
      .output(Account)
      .query(({ input, ctx }) => (ctx.app.service.Core.getAccount as any)(input, ctx)),

    getAccounts: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Account))
      .output(Account.array())
      .query(({ input, ctx }) => (ctx.app.service.Core.getAccounts as any)(input, ctx)),

    createAccount: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Account))
      .output(Account.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createAccount as any)(input, ctx)),

    updateAccount: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Account))
      .output(Account.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateAccount as any)(input, ctx)),

    getAchievement: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Achievement))
      .output(Achievement)
      .query(({ input, ctx }) => (ctx.app.service.Core.getAchievement as any)(input, ctx)),

    getAchievements: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Achievement))
      .output(Achievement.array())
      .query(({ input, ctx }) => (ctx.app.service.Core.getAchievements as any)(input, ctx)),

    createAchievement: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Achievement))
      .output(Achievement.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createAchievement as any)(input, ctx)),

    updateAchievement: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Achievement))
      .output(Achievement.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateAchievement as any)(input, ctx)),

    // Add similar procedures for Act, Agent, Application, Badge, BattlePass, Biome, BiomeFeature,
    // Bounty, Collection, Comment, Community, Company, Conversation, Data, Discussion, Energy, Event, Exchange,
    // File, Galaxy, Guide, Idea, Leaderboard, Log, Lore, Market, Memory, Message, Metaverse, NewsArticle, Npc,
    // Offer, Omniverse, Order, Payment, Permission, Person, Planet, Poll, Project, Proposal, Quest, Rating, Realm,
    // Revision, Referral, Review, Role, Season, Server, Session, SolarSystem, Star, Stash, Stock, Suggestion, Tag,
    // Team, Tournament, Trade, Universe, Validator, Vote, WorldEvent.
    // Act Procedures
    getAct: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Act))
      .output(Act)
      .query(({ input, ctx }) => (ctx.app.service.Core.getAct as any)(input, ctx)),

    getActs: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Act))
      .query(({ input, ctx }) => (ctx.app.service.Core.getActs as any)(input, ctx)),

    createAct: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Act))
      .output(Act.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createAct as any)(input, ctx)),

    updateAct: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Act))
      .output(Act.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateAct as any)(input, ctx)),

    // Agent Procedures
    getAgent: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Agent))
      .output(Agent)
      .query(({ input, ctx }) => (ctx.app.service.Core.getAgent as any)(input, ctx)),

    createAgent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Agent))
      .output(Agent.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createAgent as any)(input, ctx)),

    updateAgent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Agent))
      .output(Agent.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateAgent as any)(input, ctx)),

    // Application Procedures
    getApplication: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Application))
      .output(Application)
      .query(({ input, ctx }) => (ctx.app.service.Core.getApplication as any)(input, ctx)),

    createApplication: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Application))
      .output(Application.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createApplication as any)(input, ctx)),

    updateApplication: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Application))
      .output(Application.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateApplication as any)(input, ctx)),
    // Badge Procedures
    getBadge: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Badge))
      .output(Badge)
      .query(({ input, ctx }) => (ctx.app.service.Core.getBadge as any)(input, ctx)),

    createBadge: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Badge))
      .output(Badge.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createBadge as any)(input, ctx)),

    updateBadge: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Badge))
      .output(Badge.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateBadge as any)(input, ctx)),

    // BattlePass Procedures
    getBattlePass: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(BattlePass))
      .output(BattlePass)
      .query(({ input, ctx }) => (ctx.app.service.Core.getBattlePass as any)(input, ctx)),

    createBattlePass: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(BattlePass))
      .output(BattlePass.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createBattlePass as any)(input, ctx)),

    updateBattlePass: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(BattlePass))
      .output(BattlePass.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateBattlePass as any)(input, ctx)),

    // Biome Procedures
    getBiome: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Biome))
      .output(Biome)
      .query(({ input, ctx }) => (ctx.app.service.Core.getBiome as any)(input, ctx)),

    createBiome: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Biome))
      .output(Biome.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createBiome as any)(input, ctx)),

    updateBiome: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Biome))
      .output(Biome.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateBiome as any)(input, ctx)),
    // BiomeFeature Procedures
    getBiomeFeature: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(BiomeFeature))
      .output(BiomeFeature)
      .query(({ input, ctx }) => (ctx.app.service.Core.getBiomeFeature as any)(input, ctx)),

    createBiomeFeature: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(BiomeFeature)
      .output(BiomeFeature.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createBiomeFeature as any)(input, ctx)),
    updateBiomeFeature: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(BiomeFeature))
      .output(BiomeFeature.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateBiomeFeature as any)(input, ctx)),

    // Bounty Procedures
    getBounty: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Bounty))
      .output(Bounty)
      .query(({ input, ctx }) => (ctx.app.service.Core.getBounty as any)(input, ctx)),

    createBounty: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Bounty))
      .output(Bounty.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createBounty as any)(input, ctx)),

    updateBounty: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Bounty))
      .output(Bounty.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateBounty as any)(input, ctx)),

    // Collection Procedures
    getCollection: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Collection))
      .output(Collection)
      .query(({ input, ctx }) => (ctx.app.service.Core.getCollection as any)(input, ctx)),

    createCollection: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Collection))
      .output(Collection.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createCollection as any)(input, ctx)),

    updateCollection: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Collection))
      .output(Collection.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateCollection as any)(input, ctx)),

    // Comment Procedures
    getComment: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Comment))
      .output(Comment)
      .query(({ input, ctx }) => (ctx.app.service.Core.getComment as any)(input, ctx)),

    createComment: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Comment))
      .output(Comment.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createComment as any)(input, ctx)),

    updateComment: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Comment))
      .output(Comment.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateComment as any)(input, ctx)),

    // Community Procedures
    getCommunity: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Community))
      .output(Community)
      .query(({ input, ctx }) => (ctx.app.service.Core.getCommunity as any)(input, ctx)),

    createCommunity: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Community))
      .output(Community.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createCommunity as any)(input, ctx)),

    updateCommunity: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Community))
      .output(Community.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateCommunity as any)(input, ctx)),

    // Company Procedures
    getCompany: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Company))
      .output(Company)
      .query(({ input, ctx }) => (ctx.app.service.Core.getCompany as any)(input, ctx)),

    createCompany: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Company))
      .output(Company.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createCompany as any)(input, ctx)),

    updateCompany: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Company))
      .output(Company.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateCompany as any)(input, ctx)),

    // Data Procedures
    getData: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Data))
      .output(Data)
      .query(({ input, ctx }) => (ctx.app.service.Core.getData as any)(input, ctx)),

    createData: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Data))
      .output(Data.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createData as any)(input, ctx)),

    updateData: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Data))
      .output(Data.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateData as any)(input, ctx)),

    // Discussion Procedures
    getDiscussion: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Discussion))
      .output(Discussion)
      .query(({ input, ctx }) => (ctx.app.service.Core.getDiscussion as any)(input, ctx)),

    createDiscussion: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Discussion))
      .output(Discussion.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createDiscussion as any)(input, ctx)),

    updateDiscussion: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Discussion))
      .output(Discussion.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateDiscussion as any)(input, ctx)),

    // Energy Procedures
    getEnergy: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Energy))
      .output(Energy)
      .query(({ input, ctx }) => (ctx.app.service.Core.getEnergy as any)(input, ctx)),

    getEnergies: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Energy))
      // .output(Energy)
      .query(({ input, ctx }) => (ctx.app.service.Core.getEnergies as any)(input, ctx)),

    createEnergy: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Energy))
      .output(Energy.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createEnergy as any)(input, ctx)),

    updateEnergy: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Energy))
      .output(Energy.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateEnergy as any)(input, ctx)),

    // Event Procedures
    getEvent: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Event))
      .output(Event)
      .query(({ input, ctx }) => (ctx.app.service.Core.getEvent as any)(input, ctx)),

    createEvent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Event))
      .output(Event.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createEvent as any)(input, ctx)),

    updateEvent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Event))
      .output(Event.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateEvent as any)(input, ctx)),

    // File Procedures
    getFile: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(File))
      .output(File)
      .query(({ input, ctx }) => (ctx.app.service.Core.getFile as any)(input, ctx)),

    createFile: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(File))
      .output(File.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createFile as any)(input, ctx)),

    updateFile: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(File))
      .output(File.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateFile as any)(input, ctx)),

    // Galaxy Procedures
    getGalaxy: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Galaxy))
      .output(Galaxy)
      .query(({ input, ctx }) => (ctx.app.service.Core.getGalaxy as any)(input, ctx)),

    createGalaxy: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Galaxy))
      .output(Galaxy.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createGalaxy as any)(input, ctx)),

    updateGalaxy: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Galaxy))
      .output(Galaxy.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateGalaxy as any)(input, ctx)),

    // Guide Procedures
    getGuide: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Guide))
      .output(Guide)
      .query(({ input, ctx }) => (ctx.app.service.Core.getGuide as any)(input, ctx)),

    createGuide: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Guide))
      .output(Guide.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createGuide as any)(input, ctx)),

    updateGuide: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Guide))
      .output(Guide.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateGuide as any)(input, ctx)),
    // Idea Procedures
    getIdea: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Idea))
      .output(Idea)
      .query(({ input, ctx }) => (ctx.app.service.Core.getIdea as any)(input, ctx)),

    createIdea: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Idea))
      .output(Idea.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createIdea as any)(input, ctx)),

    updateIdea: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Idea))
      .output(Idea.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateIdea as any)(input, ctx)),

    // Leaderboard Procedures
    getLeaderboard: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Leaderboard))
      .output(Leaderboard)
      .query(({ input, ctx }) => (ctx.app.service.Core.getLeaderboard as any)(input, ctx)),

    createLeaderboard: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Leaderboard))
      .output(Leaderboard.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createLeaderboard as any)(input, ctx)),

    updateLeaderboard: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Leaderboard))
      .output(Leaderboard.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateLeaderboard as any)(input, ctx)),

    // Log Procedures
    getLog: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Log))
      .output(Log)
      .query(({ input, ctx }) => (ctx.app.service.Core.getLog as any)(input, ctx)),

    createLog: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Log))
      .output(Log.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createLog as any)(input, ctx)),

    updateLog: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Log))
      .output(Log.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateLog as any)(input, ctx)),

    // Lore Procedures
    getLore: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Lore))
      .output(Lore)
      .query(({ input, ctx }) => (ctx.app.service.Core.getLore as any)(input, ctx)),

    createLore: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Lore))
      .output(Lore.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createLore as any)(input, ctx)),

    updateLore: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Lore))
      .output(Lore.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateLore as any)(input, ctx)),

    // Memory Procedures
    getMemory: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Memory))
      .output(Memory)
      .query(({ input, ctx }) => (ctx.app.service.Core.getMemory as any)(input, ctx)),

    createMemory: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Memory))
      .output(Memory.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createMemory as any)(input, ctx)),

    updateMemory: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Memory))
      .output(Memory.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateMemory as any)(input, ctx)),

    // Message Procedures
    getMessage: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Message))
      .output(Message)
      .query(({ input, ctx }) => (ctx.app.service.Core.getMessage as any)(input, ctx)),

    createMessage: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Message))
      .output(Message.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createMessage as any)(input, ctx)),

    updateMessage: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Message))
      .output(Message.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateMessage as any)(input, ctx)),

    // Metaverse Procedures
    getMetaverse: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Metaverse))
      .output(Metaverse)
      .query(({ input, ctx }) => (ctx.app.service.Core.getMetaverse as any)(input, ctx)),

    createMetaverse: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Metaverse))
      .output(Metaverse.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createMetaverse as any)(input, ctx)),

    updateMetaverse: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Metaverse))
      .output(Metaverse.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateMetaverse as any)(input, ctx)),

    // NewsArticle Procedures
    getNewsArticle: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(NewsArticle))
      .output(NewsArticle)
      .query(({ input, ctx }) => (ctx.app.service.Core.getNewsArticle as any)(input, ctx)),

    createNewsArticle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(NewsArticle))
      .output(NewsArticle.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createNewsArticle as any)(input, ctx)),

    updateNewsArticle: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(NewsArticle))
      .output(NewsArticle.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateNewsArticle as any)(input, ctx)),

    // Npc Procedures
    getNpc: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Npc))
      .output(Npc)
      .query(({ input, ctx }) => (ctx.app.service.Core.getNpc as any)(input, ctx)),

    createNpc: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Npc))
      .output(Npc.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createNpc as any)(input, ctx)),

    updateNpc: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Npc))
      .output(Npc.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateNpc as any)(input, ctx)),

    // Offer Procedures
    getOffer: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Offer))
      .output(Offer)
      .query(({ input, ctx }) => (ctx.app.service.Core.getOffer as any)(input, ctx)),

    createOffer: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Offer))
      .output(Offer.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createOffer as any)(input, ctx)),

    updateOffer: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Offer))
      .output(Offer.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateOffer as any)(input, ctx)),

    // Omniverse Procedures
    getOmniverse: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Omniverse))
      .output(Omniverse)
      .query(({ input, ctx }) => (ctx.app.service.Core.getOmniverse as any)(input, ctx)),

    createOmniverse: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Omniverse))
      .output(Omniverse.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createOmniverse as any)(input, ctx)),

    updateOmniverse: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Omniverse))
      .output(Omniverse.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateOmniverse as any)(input, ctx)),

    // Order Procedures
    getOrder: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Order))
      .output(Order)
      .query(({ input, ctx }) => (ctx.app.service.Core.getOrder as any)(input, ctx)),

    createOrder: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Order))
      .output(Order.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createOrder as any)(input, ctx)),

    updateOrder: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Order))
      .output(Order.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateOrder as any)(input, ctx)),

    // Payment Procedures
    getPayment: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Payment))
      .output(Payment)
      .query(({ input, ctx }) => (ctx.app.service.Core.getPayment as any)(input, ctx)),

    createPayment: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Payment))
      .output(Payment.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createPayment as any)(input, ctx)),

    updatePayment: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Payment))
      .output(Payment.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updatePayment as any)(input, ctx)),

    // Permission Procedures
    getPermission: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Permission))
      .output(Permission)
      .query(({ input, ctx }) => (ctx.app.service.Core.getPermission as any)(input, ctx)),

    createPermission: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Permission))
      .output(Permission.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createPermission as any)(input, ctx)),

    updatePermission: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Permission))
      .output(Permission.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updatePermission as any)(input, ctx)),

    // Person Procedures
    getPerson: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Person))
      .output(Person)
      .query(({ input, ctx }) => (ctx.app.service.Core.getPerson as any)(input, ctx)),

    createPerson: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Person))
      .output(Person.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createPerson as any)(input, ctx)),

    updatePerson: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Person))
      .output(Person.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updatePerson as any)(input, ctx)),

    // Planet Procedures
    getPlanet: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Planet))
      .output(Planet)
      .query(({ input, ctx }) => (ctx.app.service.Core.getPlanet as any)(input, ctx)),

    createPlanet: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Planet))
      .output(Planet.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createPlanet as any)(input, ctx)),

    updatePlanet: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Planet))
      .output(Planet.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updatePlanet as any)(input, ctx)),

    // Poll Procedures
    getPoll: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Poll))
      .output(Poll)
      .query(({ input, ctx }) => (ctx.app.service.Core.getPoll as any)(input, ctx)),

    createPoll: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Poll))
      .output(Poll.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createPoll as any)(input, ctx)),

    updatePoll: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Poll))
      .output(Poll.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updatePoll as any)(input, ctx)),

    // Project Procedures
    getProject: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Project))
      .output(Project)
      .query(({ input, ctx }) => (ctx.app.service.Core.getProject as any)(input, ctx)),

    createProject: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Project))
      .output(Project.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createProject as any)(input, ctx)),

    updateProject: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Project))
      .output(Project.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateProject as any)(input, ctx)),

    // Proposal Procedures
    getProposal: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Proposal))
      .output(Proposal)
      .query(({ input, ctx }) => (ctx.app.service.Core.getProposal as any)(input, ctx)),
    createProposal: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Proposal))
      .output(Proposal.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createProposal as any)(input, ctx)),

    updateProposal: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Proposal))
      .output(Proposal.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateProposal as any)(input, ctx)),

    // Quest Procedures
    getQuest: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Quest))
      .output(Quest)
      .query(({ input, ctx }) => (ctx.app.service.Core.getQuest as any)(input, ctx)),

    createQuest: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Quest))
      .output(Quest.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createQuest as any)(input, ctx)),

    updateQuest: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Quest))
      .output(Quest.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateQuest as any)(input, ctx)),

    // Rating Procedures
    getRating: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Rating))
      .output(Rating)
      .query(({ input, ctx }) => (ctx.app.service.Core.getRating as any)(input, ctx)),

    createRating: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Rating))
      .output(Rating.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createRating as any)(input, ctx)),

    updateRating: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Rating))
      .output(Rating.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateRating as any)(input, ctx)),

    // Realm Procedures
    getRealm: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Realm))
      .output(Realm)
      .query(({ input, ctx }) => (ctx.app.service.Core.getRealm as any)(input, ctx)),

    getRealms: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Realm))
      .output(z.array(Realm))
      .query(({ input, ctx }) => (ctx.app.service.Core.getRealms as any)(input, ctx)),

    createRealm: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Realm))
      .output(Realm.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createRealm as any)(input, ctx)),

    updateRealm: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Realm))
      .output(Realm.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateRealm as any)(input, ctx)),

    // RealmEvent Procedures
    getRealmEvent: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmEvent))
      .output(RealmEvent)
      .query(({ input, ctx }) => (ctx.app.service.Core.getRealmEvent as any)(input, ctx)),

    getRealmEvents: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmEvent))
      .output(z.array(RealmEvent))
      .query(({ input, ctx }) => (ctx.app.service.Core.getRealmEvents as any)(input, ctx)),

    createRealmEvent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmEvent))
      .output(RealmEvent.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createRealmEvent as any)(input, ctx)),

    updateRealmEvent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmEvent))
      .output(RealmEvent.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateRealmEvent as any)(input, ctx)),

    // Revision Procedures
    getRevision: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Revision))
      .output(Revision)
      .query(({ input, ctx }) => (ctx.app.service.Core.getRevision as any)(input, ctx)),

    createRevision: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Revision))
      .output(Revision.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createRevision as any)(input, ctx)),

    updateRevision: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Revision))
      .output(Revision.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateRevision as any)(input, ctx)),

    // Referral Procedures
    getReferral: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Referral))
      .output(Referral)
      .query(({ input, ctx }) => (ctx.app.service.Core.getReferral as any)(input, ctx)),

    createReferral: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Referral))
      .output(Referral.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createReferral as any)(input, ctx)),

    updateReferral: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Referral))
      .output(Referral.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateReferral as any)(input, ctx)),
    // Review Procedures
    getReview: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Review))
      .output(Review)
      .query(({ input, ctx }) => (ctx.app.service.Core.getReview as any)(input, ctx)),

    createReview: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Review))
      .output(Review.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createReview as any)(input, ctx)),

    updateReview: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Review))
      .output(Review.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateReview as any)(input, ctx)),
    // Role Procedures
    getRole: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Role))
      .output(Role)
      .query(({ input, ctx }) => (ctx.app.service.Core.getRole as any)(input, ctx)),

    createRole: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Role))
      .output(Role.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createRole as any)(input, ctx)),

    updateRole: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Role))
      .output(Role.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateRole as any)(input, ctx)),

    // Season Procedures
    getSeason: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Season))
      .output(Season)
      .query(({ input, ctx }) => (ctx.app.service.Core.getSeason as any)(input, ctx)),

    createSeason: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Season))
      .output(Season.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createSeason as any)(input, ctx)),

    updateSeason: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Season))
      .output(Season.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateSeason as any)(input, ctx)),

    // RealmShard Procedures
    getRealmShard: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmShard))
      .output(RealmShard)
      .query(({ input, ctx }) => (ctx.app.service.Core.getRealmShard as any)(input, ctx)),

    getRealmShards: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmShard))
      .output(z.array(RealmShard))
      .query(({ input, ctx }) => (ctx.app.service.Core.getRealmShards as any)(input, ctx)),

    createRealmShard: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmShard))
      .output(RealmShard.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createRealmShard as any)(input, ctx)),

    updateRealmShard: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(RealmShard))
      .output(RealmShard.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateRealmShard as any)(input, ctx)),

    // Session Procedures
    getSession: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Session))
      .output(Session)
      .query(({ input, ctx }) => (ctx.app.service.Core.getSession as any)(input, ctx)),

    createSession: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Session))
      .output(Session.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createSession as any)(input, ctx)),

    updateSession: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Session))
      .output(Session.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateSession as any)(input, ctx)),

    // SolarSystem Procedures
    getSolarSystem: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(SolarSystem))
      .output(SolarSystem)
      .query(({ input, ctx }) => (ctx.app.service.Core.getSolarSystem as any)(input, ctx)),

    createSolarSystem: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(SolarSystem))
      .output(SolarSystem.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createSolarSystem as any)(input, ctx)),

    updateSolarSystem: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(SolarSystem))
      .output(SolarSystem.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateSolarSystem as any)(input, ctx)),

    // Star Procedures
    getStar: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Star))
      .output(Star)
      .query(({ input, ctx }) => (ctx.app.service.Core.getStar as any)(input, ctx)),

    createStar: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Star))
      .output(Star.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createStar as any)(input, ctx)),

    updateStar: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Star))
      .output(Star.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateStar as any)(input, ctx)),

    // Stash Procedures
    getStash: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Stash))
      .output(Stash)
      .query(({ input, ctx }) => (ctx.app.service.Core.getStash as any)(input, ctx)),

    createStash: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Stash))
      .output(Stash.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createStash as any)(input, ctx)),

    updateStash: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Stash))
      .output(Stash.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateStash as any)(input, ctx)),

    // Stock Procedures
    getStock: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Stock))
      .output(Stock)
      .query(({ input, ctx }) => (ctx.app.service.Core.getStock as any)(input, ctx)),

    createStock: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Stock))
      .output(Stock.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createStock as any)(input, ctx)),

    updateStock: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Stock))
      .output(Stock.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateStock as any)(input, ctx)),

    // Suggestion Procedures
    getSuggestion: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Suggestion))
      .output(Suggestion)
      .query(({ input, ctx }) => (ctx.app.service.Core.getSuggestion as any)(input, ctx)),

    createSuggestion: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Suggestion))
      .output(Suggestion.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createSuggestion as any)(input, ctx)),

    updateSuggestion: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Suggestion))
      .output(Suggestion.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateSuggestion as any)(input, ctx)),

    // Tag Procedures
    getTag: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Tag))
      .output(Tag)
      .query(({ input, ctx }) => (ctx.app.service.Core.getTag as any)(input, ctx)),

    createTag: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Tag))
      .output(Tag.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createTag as any)(input, ctx)),

    updateTag: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Tag))
      .output(Tag.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateTag as any)(input, ctx)),

    // Team Procedures
    getTeam: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Team))
      .output(Team)
      .query(({ input, ctx }) => (ctx.app.service.Core.getTeam as any)(input, ctx)),

    getTeams: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Team))
      .output(z.array(Team))
      .query(({ input, ctx }) => (ctx.app.service.Core.getTeams as any)(input, ctx)),

    createTeam: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Team))
      .output(Team.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createTeam as any)(input, ctx)),

    updateTeam: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Team))
      .output(Team.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateTeam as any)(input, ctx)),

    // Tournament Procedures
    getTournament: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Tournament))
      .output(Tournament)
      .query(({ input, ctx }) => (ctx.app.service.Core.getTournament as any)(input, ctx)),

    createTournament: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Tournament))
      .output(Tournament.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createTournament as any)(input, ctx)),

    updateTournament: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Tournament))
      .output(Tournament.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateTournament as any)(input, ctx)),

    // Trade Procedures
    getTrade: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Trade))
      .output(Trade)
      .query(({ input, ctx }) => (ctx.app.service.Core.getTrade as any)(input, ctx)),

    getTrades: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Trade))
      .output(z.array(Trade))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.getTrades as any)(input, ctx)),

    createTrade: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Trade))
      .output(Trade.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createTrade as any)(input, ctx)),

    updateTrade: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Trade))
      .output(Trade.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateTrade as any)(input, ctx)),

    // Universe Procedures
    getUniverse: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Universe))
      .output(Universe)
      .query(({ input, ctx }) => (ctx.app.service.Core.getUniverse as any)(input, ctx)),

    createUniverse: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Universe))
      .output(Universe.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createUniverse as any)(input, ctx)),

    updateUniverse: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Universe))
      .output(Universe.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateUniverse as any)(input, ctx)),

    // Validator Procedures
    getValidator: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Validator))
      .output(Validator)
      .query(({ input, ctx }) => (ctx.app.service.Core.getValidator as any)(input, ctx)),

    createValidator: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Validator))
      .output(Validator.pick({ id: true }))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createValidator as any)(input, ctx)),

    updateValidator: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Validator))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateValidator as any)(input, ctx)),

    // Vote Procedures
    getVote: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Vote))
      .query(({ input, ctx }) => (ctx.app.service.Core.getVote as any)(input, ctx)),

    createVote: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Vote))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createVote as any)(input, ctx)),

    updateVote: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Vote))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateVote as any)(input, ctx)),

    // WorldEvent Procedures
    getWorldEvent: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(WorldEvent))
      .query(({ input, ctx }) => (ctx.app.service.Core.getWorldEvent as any)(input, ctx)),

    createWorldEvent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(WorldEvent))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createWorldEvent as any)(input, ctx)),

    updateWorldEvent: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(WorldEvent))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateWorldEvent as any)(input, ctx)),

    // WorldRecord Procedures
    getWorldRecord: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(WorldRecord))
      .query(({ input, ctx }) => (ctx.app.service.Core.getWorldRecord as any)(input, ctx)),

    createWorldRecord: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(WorldRecord))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.createWorldRecord as any)(input, ctx)),

    updateWorldRecord: procedure
      .use(hasRole('admin', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(WorldRecord))
      .mutation(({ input, ctx }) => (ctx.app.service.Core.updateWorldRecord as any)(input, ctx)),

    info: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(z.any())
      .query(({ input, ctx }) => (ctx.app.service.Core.info as any)(input, ctx)),

    stats: procedure
      .use(hasRole('guest', t))
      .use(customErrorFormatter(t))
      .input(getQueryInput(Stat))
      .query(({ input, ctx }) => (ctx.app.service.Core.stats as any)(input, ctx)),
  });

export type Router = ReturnType<typeof createRouter>;
export type RouterInput = inferRouterInputs<Router>;
export type RouterOutput = inferRouterOutputs<Router>;
