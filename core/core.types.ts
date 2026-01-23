// core.types.ts

import { z } from 'zod';
import { HydratedDocument } from 'mongoose';
import * as schema from './core.schema';
import { Document, Model } from '../util/mongo';

// Export types from other modules if necessary
export type * from './core.router';
export type { RouterContext } from '../types';

export type MerkleTree = z.infer<typeof schema.MerkleTree>;
export type MerkleTreeDocument = MerkleTree & Document;

export type MerkleNode = z.infer<typeof schema.MerkleNode>;
export type MerkleNodeDocument = MerkleNode & Document;

// Define all core types from schemas
export type Account = z.infer<typeof schema.Account>;
export type AccountDocument = Account & Document;

export type Achievement = z.infer<typeof schema.Achievement>;
export type AchievementDocument = Achievement & Document;

export type Act = z.infer<typeof schema.Act>;
export type ActDocument = Act & Document;

export type Agent = z.infer<typeof schema.Agent>;
export type AgentDocument = Agent & Document;

export type Application = z.infer<typeof schema.Application>;
export type ApplicationDocument = Application & Document;

export type Badge = z.infer<typeof schema.Badge>;
export type BadgeDocument = Badge & Document;

export type BattlePass = z.infer<typeof schema.BattlePass>;
export type BattlePassDocument = BattlePass & Document;

export type Biome = z.infer<typeof schema.Biome>;
export type BiomeDocument = Biome & Document;

export type BiomeFeature = z.infer<typeof schema.BiomeFeature>;
export type BiomeFeatureDocument = BiomeFeature & Document;

export type Bounty = z.infer<typeof schema.Bounty>;
export type BountyDocument = Bounty & Document;

export type Counter = z.infer<typeof schema.Counter>;
export type CounterDocument = Counter & Document;

export type Collection = z.infer<typeof schema.Collection>;
export type CollectionDocument = Collection & Document;

export type Comment = z.infer<typeof schema.Comment>;
export type CommentDocument = Comment & Document;

export type Community = z.infer<typeof schema.Community>;
export type CommunityDocument = Community & Document;

export type Company = z.infer<typeof schema.Company>;
export type CompanyDocument = Company & Document;

export type Conversation = z.infer<typeof schema.Conversation>;
export type ConversationDocument = Conversation & Document;

export type ConversationMessage = z.infer<typeof schema.ConversationMessage>;
export type ConversationMessageDocument = ConversationMessage & Document;

export type Data = z.infer<typeof schema.Data>;
export type DataDocument = Data & Document;

export type Meta = z.infer<typeof schema.Meta>;
export type MetaDocument = Meta & Document;

export type Discussion = z.infer<typeof schema.Discussion>;
export type DiscussionDocument = Discussion & Document;

export type Energy = z.infer<typeof schema.Energy>;
export type EnergyDocument = Energy & Document;

export type Event = z.infer<typeof schema.Event>;
export type EventDocument = Event & Document;

export type File = z.infer<typeof schema.File>;
export type FileDocument = File & Document;

export type Galaxy = z.infer<typeof schema.Galaxy>;
export type GalaxyDocument = Galaxy & Document;

export type Guide = z.infer<typeof schema.Guide>;
export type GuideDocument = Guide & Document;

export type Idea = z.infer<typeof schema.Idea>;
export type IdeaDocument = Idea & Document;

export type Leaderboard = z.infer<typeof schema.Leaderboard>;
export type LeaderboardDocument = Leaderboard & Document;

export type Log = z.infer<typeof schema.Log>;
export type LogDocument = Log & Document;

export type Lore = z.infer<typeof schema.Lore>;
export type LoreDocument = Lore & Document;

export type Market = z.infer<typeof schema.Market>;
export type MarketDocument = Market & Document;

export type Memory = z.infer<typeof schema.Memory>;
export type MemoryDocument = Memory & Document;

export type Message = z.infer<typeof schema.Message>;
export type MessageDocument = Message & Document;

export type Metaverse = z.infer<typeof schema.Metaverse>;
export type MetaverseDocument = Metaverse & Document;

export type NewsArticle = z.infer<typeof schema.NewsArticle>;
export type NewsArticleDocument = NewsArticle & Document;

export type Npc = z.infer<typeof schema.Npc>;
export type NpcDocument = Npc & Document;

export type Offer = z.infer<typeof schema.Offer>;
export type OfferDocument = Offer & Document;

export type Omniverse = z.infer<typeof schema.Omniverse>;
export type OmniverseDocument = Omniverse & Document;

export type Order = z.infer<typeof schema.Order>;
export type OrderDocument = Order & Document;

export type Party = z.infer<typeof schema.Party>;
export type PartyDocument = Party & Document;

export type Payment = z.infer<typeof schema.Payment>;
export type PaymentDocument = HydratedDocument<Payment>;

export type Permission = z.infer<typeof schema.Permission>;
export type PermissionDocument = Permission & Document;

export type Person = z.infer<typeof schema.Person>;
export type PersonDocument = Person & Document;

export type Planet = z.infer<typeof schema.Planet>;
export type PlanetDocument = Planet & Document;

export type Poll = z.infer<typeof schema.Poll>;
export type PollDocument = Poll & Document;

export type Project = z.infer<typeof schema.Project>;
export type ProjectDocument = Project & Document;

export type Proposal = z.infer<typeof schema.Proposal>;
export type ProposalDocument = Proposal & Document;

export type Quest = z.infer<typeof schema.Quest>;
export type QuestDocument = Quest & Document;

export type Question = z.infer<typeof schema.Question>;
export type QuestionDocument = Question & Document;

export type Rating = z.infer<typeof schema.Rating>;
export type RatingDocument = Rating & Document;

export type Realm = z.infer<typeof schema.Realm>;
export type RealmDocument = Realm & Document;

export type RealmEvent = z.infer<typeof schema.RealmEvent>;
export type RealmEventDocument = RealmEvent & Document;

export type RealmShard = z.infer<typeof schema.RealmShard>;
export type RealmShardDocument = RealmShard & Document;

export type RealmTrait = z.infer<typeof schema.RealmTrait>;
export type RealmTraitDocument = RealmTrait & Document;

export type Revision = z.infer<typeof schema.Revision>;
export type RevisionDocument = Revision & Document;

export type Referral = z.infer<typeof schema.Referral>;
export type ReferralDocument = Referral & Document;

export type Review = z.infer<typeof schema.Review>;
export type ReviewDocument = Review & Document;

export type Role = z.infer<typeof schema.Role>;
export type RoleDocument = Role & Document;

export type Season = z.infer<typeof schema.Season>;
export type SeasonDocument = Season & Document;

export type Session = z.infer<typeof schema.Session>;
export type SessionDocument = Session & Document;

export type SolarSystem = z.infer<typeof schema.SolarSystem>;
export type SolarSystemDocument = SolarSystem & Document;

export type Star = z.infer<typeof schema.Star>;
export type StarDocument = Star & Document;

export type Stat = z.infer<typeof schema.Stat>;
export type StatDocument = Stat & Document;

export type Stash = z.infer<typeof schema.Stash>;
export type StashDocument = Stash & Document;

export type Stock = z.infer<typeof schema.Stock>;
export type StockDocument = Stock & Document;

export type Suggestion = z.infer<typeof schema.Suggestion>;
export type SuggestionDocument = Suggestion & Document;

export type Tag = z.infer<typeof schema.Tag>;
export type TagDocument = Tag & Document;

export type Team = z.infer<typeof schema.Team>;
export type TeamDocument = Team & Document;

export type Tournament = z.infer<typeof schema.Tournament>;
export type TournamentDocument = Tournament & Document;

export type Trade = z.infer<typeof schema.Trade>;
export type TradeDocument = Trade & Document;

export type Universe = z.infer<typeof schema.Universe>;
export type UniverseDocument = Universe & Document;

export type Validator = z.infer<typeof schema.Validator>;
export type ValidatorDocument = Validator & Document;

export type Vote = z.infer<typeof schema.Vote>;
export type VoteDocument = Vote & Document;

export type WorldEvent = z.infer<typeof schema.WorldEvent>;
export type WorldEventDocument = WorldEvent & Document;

export type WorldRecord = z.infer<typeof schema.WorldRecord>;
export type WorldRecordDocument = WorldRecord & Document;

export type Node = z.infer<typeof schema.Node>;
export type NodeDocument = Node & Document;

export type Prefab = z.infer<typeof schema.Prefab>;
export type PrefabDocument = Prefab & Document;

export type Object = z.infer<typeof schema.Object>;
export type ObjectDocument = Object & Document;

export type ObjectInteraction = z.infer<typeof schema.ObjectInteraction>;
export type ObjectInteractionDocument = ObjectInteraction & Document;

export type SeerEvent = z.infer<typeof schema.SeerEvent>;
export type SeerEventDocument = SeerEvent & Document;

export type SeerPayload = z.infer<typeof schema.SeerPayload>;
export type SeerPayloadDocument = SeerPayload & Document;

// Define model mappings
export type Mappings = {
  Account: Model<AccountDocument>;
  Achievement: Model<AchievementDocument>;
  Act: Model<ActDocument>;
  Agent: Model<AgentDocument>;
  Application: Model<ApplicationDocument>;
  Badge: Model<BadgeDocument>;
  BattlePass: Model<BattlePassDocument>;
  Biome: Model<BiomeDocument>;
  BiomeFeature: Model<BiomeFeatureDocument>;
  Bounty: Model<BountyDocument>;
  Counter: Model<CounterDocument>;
  Collection: Model<CollectionDocument>;
  Comment: Model<CommentDocument>;
  Community: Model<CommunityDocument>;
  Company: Model<CompanyDocument>;
  Conversation: Model<ConversationDocument>;
  ConversationMessage: Model<ConversationMessageDocument>;
  Data: Model<DataDocument>;
  Discussion: Model<DiscussionDocument>;
  Energy: Model<EnergyDocument>;
  Event: Model<EventDocument>;
  File: Model<FileDocument>;
  Galaxy: Model<GalaxyDocument>;
  Guide: Model<GuideDocument>;
  Idea: Model<IdeaDocument>;
  Leaderboard: Model<LeaderboardDocument>;
  Log: Model<LogDocument>;
  Lore: Model<LoreDocument>;
  Market: Model<MarketDocument>;
  Memory: Model<MemoryDocument>;
  Message: Model<MessageDocument>;
  Metaverse: Model<MetaverseDocument>;
  NewsArticle: Model<NewsArticleDocument>;
  Npc: Model<NpcDocument>;
  Object: Model<ObjectDocument>;
  ObjectInteraction: Model<ObjectInteractionDocument>;
  Offer: Model<OfferDocument>;
  Omniverse: Model<OmniverseDocument>;
  Order: Model<OrderDocument>;
  Payment: Model<PaymentDocument>;
  Party: Model<PartyDocument>;
  Permission: Model<PermissionDocument>;
  Person: Model<PersonDocument>;
  Planet: Model<PlanetDocument>;
  Poll: Model<PollDocument>;
  Prefab: Model<PrefabDocument>;
  Project: Model<ProjectDocument>;
  Proposal: Model<ProposalDocument>;
  Quest: Model<QuestDocument>;
  Question: Model<QuestionDocument>;
  Rating: Model<RatingDocument>;
  Realm: Model<RealmDocument>;
  RealmEvent: Model<RealmEventDocument>;
  RealmShard: Model<RealmShardDocument>;
  Revision: Model<RevisionDocument>;
  Referral: Model<ReferralDocument>;
  Review: Model<ReviewDocument>;
  Role: Model<RoleDocument>;
  Season: Model<SeasonDocument>;
  SeerEvent: Model<SeerEventDocument>;
  SeerPayload: Model<SeerPayloadDocument>;
  Session: Model<SessionDocument>;
  SolarSystem: Model<SolarSystemDocument>;
  Star: Model<StarDocument>;
  Stat: Model<StatDocument>;
  Stash: Model<StashDocument>;
  Stock: Model<StockDocument>;
  Suggestion: Model<SuggestionDocument>;
  Tag: Model<TagDocument>;
  Team: Model<TeamDocument>;
  Tournament: Model<TournamentDocument>;
  Trade: Model<TradeDocument>;
  Universe: Model<UniverseDocument>;
  Validator: Model<ValidatorDocument>;
  Vote: Model<VoteDocument>;
  WorldEvent: Model<WorldEventDocument>;
  WorldRecord: Model<WorldRecordDocument>;
  Node: Model<NodeDocument>; // Added Node model mapping
};
