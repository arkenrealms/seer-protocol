// mongo.ts

import mongoose, {
  Types,
  Model as MongooseModel,
  Schema,
  SchemaDefinition,
  SchemaOptions,
  Document,
  Query,
  UpdateWriteOpResult,
  QueryOptions,
  FilterQuery,
  UpdateQuery,
  UpdateWithAggregationPipeline,
  ProjectionType,
  Collection,
  VirtualType,
  HydratedDocument,
} from 'mongoose';
import crypto from 'crypto';
export type { Mixed, ObjectIdSchemaDefinition, AnyArray, StringSchemaDefinition } from 'mongoose'; // Mixed type
import pluralize from 'pluralize';
export { z } from 'zod';

export const toCamelCase = (str: string): string => {
  if (!str) return str;

  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
    .replace(/[\s:,()&/\-\+]+/g, '');
};

type PreHookMethod = keyof Query<any, any> | 'save' | 'validate';

interface VirtualOptions<T = any> {
  name: string;
  ref?: string;
  refPath?: string;
  localField?: string;
  foreignField?: string;
  justOne?: boolean;
  get?: (this: HydratedDocument<T>, value: any, virtual: VirtualType<T>) => any;
  set?: (this: HydratedDocument<T>, value: any, virtual: VirtualType<T>) => void;
  match?: any;
  options?: any;
}

function isObjectId(val: any): boolean {
  return val instanceof mongoose.Types.ObjectId || (val && typeof val === 'object' && val._bsontype === 'ObjectID');
}

function isPlainObject(val: any): boolean {
  return (
    val !== null && typeof val === 'object' && !Array.isArray(val) && Object.getPrototypeOf(val) === Object.prototype
  );
}
// ---------------------------------------------------------------------------
// Hash helper for zk / event batching
// ---------------------------------------------------------------------------
export function hashEvents(events: any[]): string {
  const raw = JSON.stringify(events);
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export { Document, Schema } from 'mongoose';

// ---------------------------------------------------------------------------
// Simple global sequence generator for SeerEvent.seq
// ---------------------------------------------------------------------------
interface CounterDocument extends Document {
  key: string;
  value: number;
}

const CounterSchema = new Schema<CounterDocument>({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

const CounterModel = mongoose.models.SeerCounter || mongoose.model<CounterDocument>('SeerCounter', CounterSchema);

export async function getNextSeq(key: string = 'seerEvent'): Promise<number> {
  const doc = await CounterModel.findOneAndUpdate({ key }, { $inc: { value: 1 } }, { upsert: true, new: true }).exec();
  return doc.value;
}

/**
 * Returns a *new* object / array, does not mutate the input.
 * - Root: `_id` (ObjectId) → `id: string`, and `_id` is removed
 * - Nested objects: if they have `_id` as ObjectId, it becomes a string; `id` is also added
 * - Any field that is an ObjectId anywhere in the tree becomes a string
 */
function deepNormalizeIds(value: any, isRoot = false): any {
  // Primitive or null → return as-is
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // ObjectId → string
  if (isObjectId(value)) {
    return value.toString();
  }

  // Arrays → map
  if (Array.isArray(value)) {
    return value.map((item) => deepNormalizeIds(item, false));
  }

  // Non-plain objects (Date, Map, mongoose docs, etc.) → leave as-is
  if (!isPlainObject(value)) {
    return value;
  }

  // Plain object: build a new object
  const out: any = {};

  for (const [key, val] of Object.entries(value)) {
    out[key] = deepNormalizeIds(val, false);
  }

  // Handle _id on this object (after children are normalized)
  if ('_id' in out) {
    const idStr = out._id.toString();

    if (!out.id) {
      out.id = idStr;
    }

    delete out._id;
  }

  return out;
}

export function addIdTransformHelpers<T>(schema: Schema<T>) {
  // toJSON / toObject for non-lean docs
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      return deepNormalizeIds(ret, true);
    },
  });

  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      return deepNormalizeIds(ret, true);
    },
  });

  // Query helper for lean() use-cases
  (schema.query as any).asJSON = async function () {
    const res = await (this as mongoose.Query<any, any>).lean().exec();

    if (Array.isArray(res)) {
      return res.map((doc) => deepNormalizeIds(doc, true));
    }

    return deepNormalizeIds(res, true);
  };
}

function applyJsonValueFromSchema(schemaPath: any, value: any) {
  if (!schemaPath) return value;

  // Simple scalar ObjectId field
  if (schemaPath.instance === 'ObjectId' && typeof value === 'string') {
    // @ts-ignore
    return new mongoose.Types.ObjectId(value);
  }

  // Array of ObjectId (or array of subdocs) – naive handling
  if (schemaPath.$embeddedSchemaType && schemaPath.$embeddedSchemaType.instance === 'ObjectId') {
    if (Array.isArray(value)) {
      // @ts-ignore
      return value.map((v) => (typeof v === 'string' ? new mongoose.Types.ObjectId(v) : v));
    }
  }

  return value;
}

/**
 * Mutates `target` (Mongoose doc or plain object) in-place based on `json`,
 * using `schema` to convert string IDs back into ObjectIds where needed.
 */
function applyJsonToTarget(schema: Schema, target: any, json: any, pathPrefix = '', isRoot = false) {
  if (!json || typeof json !== 'object') return;

  for (const [key, value] of Object.entries(json)) {
    // we treat top-level `id` as synthetic; don't reassign _id on existing docs
    if (isRoot && key === 'id') {
      continue;
    }

    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const schemaPath: any = schema.path(fullPath);

    if (Array.isArray(value)) {
      const arr: any[] = [];
      for (const item of value) {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const child: any = {};
          applyJsonToTarget(schema, child, item, fullPath, false);
          arr.push(child);
        } else {
          arr.push(applyJsonValueFromSchema(schemaPath, item));
        }
      }
      target[key] = arr;
    } else if (value && typeof value === 'object') {
      const child = target[key] ?? {};
      target[key] = child;
      applyJsonToTarget(schema, child, value, fullPath, false);
    } else {
      target[key] = applyJsonValueFromSchema(schemaPath, value);
    }
  }
}

/**
 * Public helper: apply JSON (from .asJSON/.toJSON) back onto a doc or plain object.
 * - Will NOT change _id on existing docs (we skip root `id`)
 * - Converts strings → ObjectId for fields whose schema type is ObjectId
 */
export function applyJsonToDoc<T = any>(schema: Schema, target: T, json: any): T {
  applyJsonToTarget(schema, target as any, json, '', true);
  return target;
}

// ---------------------------------------------------------------------------
// Ontology / Cluster layer
// ---------------------------------------------------------------------------

const MIN_CLUSTER_TAG_SCORE = 0.3; // below this = low-confidence match (with tags)
const CLUSTER_AMBIGUITY_DELTA = 0.2; // if top-2 scores are too close, log ambiguity

export interface WeightedTag {
  key: string;
  weight: number; // 0..1, 1 = strongest
}

export interface PkEntry {
  field: string; // e.g. 'token', 'characterId', 'assetId'
  type: 'string' | 'number' | 'objectId' | 'boolean';
  s?: string; // string-ish
  n?: number; // numeric
  o?: Types.ObjectId; // ObjectId
}

export interface ClusterDoc extends Document {
  kind: string; // modelName, e.g. 'Item'
  applicationId?: Types.ObjectId;

  keys: string[];
  primaryKey?: string;

  tags: WeightedTag[];

  currentId?: Types.ObjectId;
  currentRevision?: number;

  pk: PkEntry[];

  createdDate: Date;
  updatedDate: Date;
}

const ClusterSchema = new Schema<ClusterDoc>(
  {
    kind: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },

    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', index: true },

    keys: {
      type: [String],
      default: [],
      index: true,
    } as any,

    primaryKey: { type: String, index: true },

    tags: {
      type: [
        {
          key: { type: String, required: true },
          weight: {
            type: Number,
            min: 0,
            max: 1,
            default: 1, // 1.0 = strong / core tag
          },
        },
      ],
      default: [],
    } as any,

    currentId: { type: Schema.Types.ObjectId },
    currentRevision: { type: Number, default: 0 },

    pk: {
      type: [
        {
          field: { type: String, required: true },
          type: {
            type: String,
            enum: ['string', 'number', 'objectId', 'boolean'],
            required: true,
          },
          s: { type: String },
          n: { type: Number },
          o: { type: Schema.Types.ObjectId },
        },
      ],
      default: [],
    } as any,

    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
  },
  {
    collection: 'Cluster',
  }
);

// Unique: one cluster per (kind, applicationId, primaryKey)
ClusterSchema.index({ kind: 1, applicationId: 1, primaryKey: 1 }, { unique: true, sparse: true });

// Multikey indexes over pk entries
ClusterSchema.index({ kind: 1, applicationId: 1, 'pk.field': 1, 'pk.s': 1 });
ClusterSchema.index({ kind: 1, applicationId: 1, 'pk.field': 1, 'pk.n': 1 });
ClusterSchema.index({ kind: 1, applicationId: 1, 'pk.field': 1, 'pk.o': 1 });

addIdTransformHelpers(ClusterSchema as any);

export const ClusterModel = mongoose.models.Cluster || mongoose.model<ClusterDoc>('Cluster', ClusterSchema);

// ---------- ontology helpers -----------------------------------------------

function normalizeAppId(appId?: any): Types.ObjectId | undefined {
  if (!appId) return undefined;
  if (isObjectId(appId)) return appId as Types.ObjectId;

  try {
    // Force the "hex string" overload, not the deprecated number overload
    const str = String(appId);
    return new (mongoose.Types.ObjectId as any)(str);
  } catch {
    return undefined;
  }
}

function getPkFields(schema: Schema): string[] {
  const schemaAny = schema as any;
  const fromOptions = schemaAny.options?.pkFields as string[] | undefined;
  if (fromOptions && fromOptions.length) return fromOptions;
  return ['key', 'name', 'token'];
}

function getKeyFields(schema: Schema): string[] {
  const schemaAny = schema as any;
  const fromOptions = schemaAny.options?.keyFields as string[] | undefined;
  if (fromOptions && fromOptions.length) return fromOptions;
  return ['key', 'name', 'token'];
}

// Build pk entries from a doc using pkFields + schema types
function toPkEntriesFromDoc(doc: any, schema: Schema): PkEntry[] {
  const pkEntries: PkEntry[] = [];
  const pkFields = getPkFields(schema);

  for (const field of pkFields) {
    const value = doc[field];
    if (value === undefined || value === null) continue;

    const schemaPath: any = schema.path(field);
    const entry: PkEntry = { field, type: 'string' };

    if (!schemaPath) {
      entry.s = String(value);
    } else if (schemaPath.instance === 'ObjectId') {
      entry.type = 'objectId';
      const oid = isObjectId(value) ? (value as Types.ObjectId) : new (mongoose.Types.ObjectId as any)(value as any);
      entry.o = oid;
      entry.s = oid.toString();
    } else if (schemaPath.instance === 'Number') {
      entry.type = 'number';
      entry.n = Number(value);
      entry.s = String(entry.n);
    } else if (schemaPath.instance === 'Boolean') {
      entry.type = 'boolean';
      entry.s = value ? 'true' : 'false';
    } else {
      entry.type = 'string';
      entry.s = String(value);
    }

    pkEntries.push(entry);
  }

  return pkEntries;
}

// Build keys (aliases) from doc using keyFields
function buildKeysFromDoc(doc: any, schema: Schema): string[] {
  const keys: string[] = [];
  const keyFields = getKeyFields(schema);

  for (const field of keyFields) {
    const v = doc[field];
    if (typeof v === 'string' && v.trim()) {
      if (!keys.includes(v)) keys.push(v);
    }
  }

  return keys;
}

// Extract pk conditions (pk.elemMatch) from a filter
function buildPkConditionsFromFilter(filter: any, schema: Schema): { pkConditions: any[]; rawTags: any[] } {
  const pkConditions: any[] = [];
  const pkFields = getPkFields(schema);

  const rawTags = (filter.tags || []) as any[];

  for (const [field, value] of Object.entries(filter)) {
    if (field === '_id' || field === 'applicationId' || field === 'tags') continue;
    if (!pkFields.includes(field)) continue;

    const schemaPath: any = schema.path(field);
    const cond: any = { field };

    if (!schemaPath) {
      cond.type = 'string';
      cond.s = String(value);
    } else if (schemaPath.instance === 'ObjectId') {
      cond.type = 'objectId';
      if (isObjectId(value)) {
        cond.o = value as Types.ObjectId;
      } else {
        const str = String(value);
        cond.o = new (mongoose.Types.ObjectId as any)(str);
      }
    } else if (schemaPath.instance === 'Number') {
      cond.type = 'number';
      cond.n = Number(value);
    } else if (schemaPath.instance === 'Boolean') {
      cond.type = 'boolean';
      cond.s = value ? 'true' : 'false';
    } else {
      cond.type = 'string';
      cond.s = String(value);
    }

    pkConditions.push(cond);
  }

  return { pkConditions, rawTags };
}

// Upsert or update a cluster for an entity doc.
// - Respects revision: cluster.currentRevision only moves forward.
export async function upsertClusterForEntity(kind: string, schema: Schema, doc: any): Promise<ClusterDoc> {
  const appId = normalizeAppId(doc.applicationId);
  const keys = buildKeysFromDoc(doc, schema);
  const primaryKey = keys[0];

  const pkEntries = toPkEntriesFromDoc(doc, schema);

  const query: any = { kind };
  if (appId) query.applicationId = appId;
  if (primaryKey) query.primaryKey = primaryKey;

  let cluster = await ClusterModel.findOne(query).exec();

  const docRevision = typeof doc.revision === 'number' && !Number.isNaN(doc.revision) ? doc.revision : 1;

  if (!cluster) {
    cluster = new ClusterModel({
      kind,
      applicationId: appId,
      keys,
      primaryKey,
      tags: [], // will merge from doc.tags below
      pk: pkEntries,
      currentId: doc._id,
      currentRevision: docRevision,
    });
  } else {
    // merge keys
    const keySet = new Set(cluster.keys || []);
    for (const k of keys) keySet.add(k);
    cluster.keys = Array.from(keySet);

    // merge pk entries by (field,type)
    const pkMap = new Map<string, PkEntry>();
    for (const entry of cluster.pk || []) {
      pkMap.set(`${entry.field}:${entry.type}`, entry);
    }
    for (const entry of pkEntries) {
      pkMap.set(`${entry.field}:${entry.type}`, entry);
    }
    cluster.pk = Array.from(pkMap.values());

    // only advance currentId if revision is newer
    if (!cluster.currentRevision || docRevision > cluster.currentRevision) {
      cluster.currentId = doc._id;
      cluster.currentRevision = docRevision;
    }

    if (primaryKey) cluster.primaryKey = primaryKey;
  }

  // merge tags (WeightedTag) from doc.tags / doc.meta.tags
  const existingTagMap = new Map<string, number>();
  for (const t of cluster.tags || []) {
    const w = typeof t.weight === 'number' ? t.weight : 1;
    existingTagMap.set(t.key, Math.max(0, Math.min(1, w)));
  }

  const rawTags = (doc.tags || doc.meta?.tags || []) as any[];
  for (const t of rawTags) {
    let key: string;
    let weight = 1;
    if (typeof t === 'string') {
      key = t;
    } else if (t && typeof t === 'object') {
      key = t.key ?? t.name ?? String(t);
      if (typeof t.weight === 'number') {
        weight = Math.max(0, Math.min(1, t.weight));
      }
    } else {
      key = String(t);
    }
    const existing = existingTagMap.get(key) ?? 0;
    existingTagMap.set(key, Math.max(existing, weight));
  }

  cluster.tags = Array.from(existingTagMap.entries()).map(([key, weight]) => ({
    key,
    weight,
  }));

  cluster.updatedDate = new Date();
  await cluster.save();

  // link back to entity if it supports clusterId
  if ('clusterId' in doc && !doc.clusterId) {
    doc.clusterId = cluster._id;
  }

  return cluster;
}

// Resolve clusters for a filter (PK + tags), with scores.
export async function resolveClustersForFilter(
  kind: string,
  schema: Schema,
  applicationId: Types.ObjectId | string | undefined,
  filter: any
): Promise<(ClusterDoc & { score?: number })[]> {
  const appId = normalizeAppId(applicationId);

  const { pkConditions, rawTags } = buildPkConditionsFromFilter(filter, schema);
  const tagKeys = rawTags.map((t: any) => (typeof t === 'string' ? t : (t.key ?? t.name ?? String(t))));

  const baseMatch: any = { kind };
  if (appId) baseMatch.applicationId = appId;

  const and: any[] = [];

  for (const cond of pkConditions) {
    and.push({
      pk: { $elemMatch: cond },
    });
  }

  if (and.length) {
    baseMatch.$and = and;
  }

  const pipeline: any[] = [{ $match: baseMatch }];

  const hasTags = tagKeys.length > 0;
  if (hasTags) {
    // clusters must share at least one tag
    pipeline[0].$match['tags.key'] = { $in: tagKeys };
    pipeline.push({
      $addFields: {
        score: {
          $sum: {
            $map: {
              input: '$tags',
              as: 't',
              in: {
                $cond: [{ $in: ['$$t.key', tagKeys] }, '$$t.weight', 0],
              },
            },
          },
        },
      },
    });
    pipeline.push({ $sort: { score: -1, updatedDate: -1 } });
  } else {
    pipeline.push({ $sort: { updatedDate: -1 } });
  }

  const clusters = await ClusterModel.aggregate(pipeline).exec();
  return clusters as any;
}

// ---------------------------------------------------------------------------
// Schema & model helpers
// ---------------------------------------------------------------------------

const CommonFields = {
  // Ontology / cluster linkage + revision
  clusterId: { type: Schema.Types.ObjectId, ref: 'Cluster', index: true },
  revision: { type: Number, default: 1 },

  key: { type: String, minlength: 1, maxlength: 200, trim: true },
  name: { type: String },
  description: { type: String },
  status: {
    type: String,
    default: 'Active', // Default value set here
    enum: ['Paused', 'Pending', 'Active', 'Archived'],
  },
  data: { type: Object, default: {} }, // Default value set here
  meta: { type: Object, default: {} }, // Default value set here
  merkleLeaf: { type: String },
  merkleIndex: { type: Number },
  createdById: { type: Schema.Types.ObjectId, ref: 'Profile' },
  editedById: { type: Schema.Types.ObjectId, ref: 'Profile' },
  deletedById: { type: Schema.Types.ObjectId, ref: 'Profile' },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date },
  deletedDate: { type: Date },
};

const EntityFields = {
  applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'Profile' },
};

interface CacheConfig {
  enabled?: boolean;
  ttlMs?: number;
}

interface CustomSchemaOptions extends SchemaOptions {
  extend?: 'EntityFields' | 'CommonFields';
  indexes?: { [field: string]: any }[];
  virtuals?: VirtualOptions[];
  pre?: { method: PreHookMethod | RegExp; handler: (this: Document, next: any) => void }[];

  // Ontology config
  pkFields?: string[];
  keyFields?: string[];

  // Per-model cache configuration
  cache?: CacheConfig;
}

export function createSchema<T>(
  name: string,
  customFields: SchemaDefinition<T> = {} as SchemaDefinition<T>,
  options: CustomSchemaOptions = {}
): Schema<T> {
  const extend = options.extend !== undefined ? options.extend : 'EntityFields';
  const collectionName = options.collection || name;

  let schema: Schema<T>;

  const schemaOptions: any = {
    minimize: false,
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
    collection: collectionName,
  };

  // propagate ontology config into schema.options
  if (options.pkFields) schemaOptions.pkFields = options.pkFields;
  if (options.keyFields) schemaOptions.keyFields = options.keyFields;

  if (extend === 'EntityFields') {
    schema = new Schema<T>(
      {
        ...CommonFields,
        ...EntityFields,
        ...customFields,
      } as SchemaDefinition<T>,
      schemaOptions
    );
  } else {
    schema = new Schema<T>(
      {
        ...CommonFields,
        ...customFields,
      } as SchemaDefinition<T>,
      schemaOptions
    );
  }

  // schema.plugin(require('mongoose-autopopulate'));

  schema.set('toJSON', {
    virtuals: true, // Include virtual fields
    versionKey: false, // Remove the __v version field
    transform: (doc, ret) => {
      // @ts-ignore
      ret.id = ret._id.toString(); // Assign _id to id
      delete ret._id; // Remove _id from the output
      return ret;
    },
  });

  schema.set('toObject', {
    virtuals: true, // Include virtual fields
    versionKey: false, // Remove the __v version field
    transform: (doc, ret) => {
      // @ts-ignore
      ret.id = ret._id.toString(); // Assign _id to id
      delete ret._id; // Remove _id from the output
      return ret;
    },
  });

  addIdTransformHelpers(schema);

  // Apply indexes
  if (options.indexes) {
    options.indexes.forEach((index) => schema.index(index));
  } else {
    schema.index({ key: 1 });
    schema.index({ name: 1 });
    schema.index({ status: 1 });
  }

  // Apply virtuals
  if (options.virtuals) {
    options.virtuals.forEach((virtual) => {
      const virtualOptions: any = {
        localField: virtual.localField || `${toCamelCase(virtual.name)}Id`,
        foreignField: virtual.foreignField || '_id',
        justOne: virtual.justOne !== undefined ? virtual.justOne : !pluralize.isPlural(virtual.name),
      };

      if (virtual.refPath) {
        virtualOptions.refPath = virtual.refPath;
      } else if (virtual.ref) {
        virtualOptions.ref = virtual.ref;
      } else if (schema.path(virtual.name + 'Id')) {
        virtualOptions.ref = pluralize.singular(schema.path(virtual.name + 'Id').options.ref);
      } else {
        virtualOptions.ref = pluralize.singular(virtual.name.charAt(0).toUpperCase() + virtual.name.slice(1));
      }

      if (virtual.options) {
        virtualOptions.options = virtual.options;
      }

      if (virtual.match) {
        virtualOptions.match = virtual.match;
      }

      const schemaVirtual = schema.virtual(virtual.name, virtualOptions);

      if (virtual.get) {
        schemaVirtual.get(virtual.get);
      }

      if (virtual.set) {
        schemaVirtual.set(virtual.set);
      }
    });
  }

  // Apply pre middleware
  if (options.pre) {
    options.pre.forEach((preHook) => {
      schema.pre(preHook.method as any, preHook.handler); // Casting to 'any' for compatibility with Mongoose types
    });
  }

  return schema;
}

const modelMap: Record<string, Model<any>> = {};

export function createModel<T extends Document>(
  key: string,
  schemaFields: SchemaDefinition<T> = {} as SchemaDefinition<T>,
  options: CustomSchemaOptions = {}
) {
  if (modelMap[key]) return modelMap[key];

  const schema = createSchema<T>(key, schemaFields, options);

  // NEW: pass cache config to Model
  const res = new Model<T>(mongoose.model<T>(key, schema), { cache: options.cache });

  modelMap[key] = res;

  return res;
}

// ---------------------------------------------------------------------------
// zkSNARK verification hook (pluggable)
// ---------------------------------------------------------------------------

export type ZkProofPayload = {
  walletAddress: string; // address that "owns" this operation
  proof: any; // zk proof blob
  publicSignals?: any; // optional public inputs from the circuit
};

export type ZkVerifyContext = {
  kind: string; // model name, e.g. 'Item'
  operation: 'create' | 'update';
  filter?: any;
  update?: any;
  doc?: any; // doc(s) being created, for createWithProof
};

export type ZkVerifier = (payload: ZkProofPayload, ctx: ZkVerifyContext) => Promise<boolean> | boolean;

let globalZkVerifier: ZkVerifier | null = null;

// Call this during app bootstrap to plug in your real zk verifier.
export function setZkVerifier(verifier: ZkVerifier) {
  globalZkVerifier = verifier;
}

async function verifyZkOrThrow(payload: ZkProofPayload, ctx: ZkVerifyContext): Promise<void> {
  if (!globalZkVerifier) {
    // If no verifier is registered, treat as "no zk enforcement" (or throw if you want hard fail).
    return;
  }

  const ok = await globalZkVerifier(payload, ctx);
  if (!ok) {
    throw new Error('Invalid zk proof for operation');
  }
}

// ---------------------------------------------------------------------------
// Model wrapper
// ---------------------------------------------------------------------------

type ModelConfig = {
  cache?: CacheConfig;
};

export class Model<T extends Document> {
  protected model: MongooseModel<T>;
  protected schema: Schema;
  public filters: Record<string, any> = {};
  public filterOmitModels: string[] = ['Omniverse', 'Metaverse', 'Application'];
  public collection: Collection;

  private docSaveQueue = new WeakMap<Document, Promise<T>>();

  // NEW: cache config + store
  private cacheConfig: { enabled: boolean; ttlMs: number };
  private cache = new Map<string, { doc: T; fetchedAt: number }>();

  constructor(model: MongooseModel<T>, config: ModelConfig = {}) {
    this.model = model;
    this.collection = model.collection;
    this.schema = model.schema;

    this.cacheConfig = {
      enabled: config.cache?.enabled ?? false,
      ttlMs: config.cache?.ttlMs ?? 60_000, // default 60s
    };
  }

  private get kind(): string {
    return this.model.modelName;
  }

  private buildCacheKey(id: Types.ObjectId | string, applicationId?: any): string {
    const appId = normalizeAppId(applicationId);
    const appKey = appId ? appId.toString() : 'global';
    const idStr = typeof id === 'string' ? id : id.toString();
    return `${appKey}:${idStr}`;
  }

  private getFromCache(key: string): T | null {
    if (!this.cacheConfig.enabled) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.fetchedAt > this.cacheConfig.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.doc;
  }

  private setCache(key: string, doc: T): void {
    if (!this.cacheConfig.enabled) return;
    this.cache.set(key, { doc, fetchedAt: Date.now() });
  }

  private isClusterEnabled(): boolean {
    const name = this.model.modelName;
    if (name === 'Cluster') return false;
    return !this.filterOmitModels.includes(name);
  }

  //   // Cluster-aware find
  // find(
  //   filter: FilterQuery<T> = {},
  //   projection?: ProjectionType<T> | null,
  //   options?: mongoose.QueryOptions
  // ): Query<T[], T> {
  //   const finalFilter = this.applyDefaultFilters(filter);
  //   const q = this.model.find(finalFilter, projection, options);
  //   return this.wrapQueryWithCluster(q as any, false) as any;
  // }

  // // Cluster-aware findOne
  // findOne(
  //   filter: FilterQuery<T> = {},
  //   projection?: ProjectionType<T> | null,
  //   options?: QueryOptions
  // ): Query<T | null, T> {
  //   const finalFilter = this.applyDefaultFilters(filter);
  //   const q = this.model.findOne(finalFilter, projection, options);
  //   return this.wrapQueryWithCluster(q as any, true) as any;
  // }

  // // Cluster-aware findById (implemented as findOne({_id}))
  // findById(
  //   id: Types.ObjectId | string,
  //   projection?: ProjectionType<T> | null,
  //   options?: QueryOptions
  // ): Query<T | null, T> {
  //   const filter: any = { _id: id };
  //   const finalFilter = this.applyDefaultFilters(filter);
  //   const q = this.model.findOne(finalFilter, projection, options);
  //   return this.wrapQueryWithCluster(q as any, true) as any;
  // }

  // Wrap a query so that exec() does ontology resolution for find/findOne
  private wrapQueryWithCluster(q: Query<any, T>, isFindOne: boolean): Query<any, T> {
    if (!this.isClusterEnabled()) return q;

    const wrapper = this;
    const rawExec = q.exec;

    q.exec = async function execWithCluster(this: any, ...args: any[]) {
      const op = this.op; // 'find', 'findOne', etc.
      if (op !== 'find' && op !== 'findOne') {
        return rawExec.apply(this, args);
      }

      let filter = this.getFilter ? this.getFilter() : this._conditions || {};
      filter = { ...filter }; // clone

      // direct _id-only with no tags: try cache first, skip cluster
      const hasIdOnly =
        filter &&
        Object.keys(filter).length === 1 &&
        Object.prototype.hasOwnProperty.call(filter, '_id') &&
        !Object.prototype.hasOwnProperty.call(filter, 'tags');

      if (hasIdOnly) {
        const appId =
          filter.applicationId ??
          (wrapper.filterOmitModels.includes(wrapper.kind) ? undefined : wrapper.filters.applicationId);

        const idCond = filter._id;

        // Attempt cache lookup
        if (wrapper.cacheConfig.enabled && idCond) {
          if (op === 'findOne') {
            if (!idCond.$in && !idCond.$nin && typeof idCond !== 'object') {
              const key = wrapper.buildCacheKey(idCond, appId);
              const cached = wrapper.getFromCache(key);
              if (cached) return cached;
            }
          } else if (op === 'find') {
            if (idCond && typeof idCond === 'object' && '$in' in idCond) {
              const ids: any[] = idCond.$in || [];
              const results: any[] = [];
              let allHit = true;

              for (const id of ids) {
                const key = wrapper.buildCacheKey(id, appId);
                const cached = wrapper.getFromCache(key);
                if (!cached) {
                  allHit = false;
                  break;
                }
                results.push(cached);
              }

              if (allHit) {
                return results;
              }
            }
          }
        }

        // No cache hit, fallback to DB and then populate cache (for simple cases)
        const res = await rawExec.apply(this, args);

        if (wrapper.cacheConfig.enabled && res) {
          if (op === 'findOne' && res && !Array.isArray(res)) {
            const key = wrapper.buildCacheKey(res._id, appId);
            wrapper.setCache(key, res);
          } else if (op === 'find' && Array.isArray(res)) {
            for (const d of res) {
              if (!d || !d._id) continue;
              const key = wrapper.buildCacheKey(d._id, appId);
              wrapper.setCache(key, d);
            }
          }
        }

        return res;
      }

      // get pk/tags presence
      const { pkConditions, rawTags } = buildPkConditionsFromFilter(filter, wrapper.schema);
      const hasPk = pkConditions.length > 0;
      const hasTags = rawTags.length > 0;

      // If no pk fields and no tags, don't do ontology resolution
      if (!hasPk && !hasTags) {
        return rawExec.apply(this, args);
      }

      // Figure out applicationId
      const applicationId =
        filter.applicationId ??
        (wrapper.filterOmitModels.includes(wrapper.kind) ? undefined : wrapper.filters.applicationId);

      try {
        const clusters = await resolveClustersForFilter(wrapper.kind, wrapper.schema, applicationId as any, filter);

        if (!clusters.length) {
          // Fallback: raw query, then backfill Cluster
          const res = await rawExec.apply(this, args);
          if (res) {
            if (Array.isArray(res)) {
              for (const doc of res) {
                if (doc && wrapper.isClusterEnabled()) {
                  await upsertClusterForEntity(wrapper.kind, wrapper.schema, doc);
                }
              }
            } else if (wrapper.isClusterEnabled()) {
              await upsertClusterForEntity(wrapper.kind, wrapper.schema, res);
            }
          }
          return res;
        }

        const best = clusters[0];
        const bestScore = typeof best.score === 'number' ? best.score : 0;
        const secondScore =
          clusters.length > 1 && typeof clusters[1].score === 'number' ? (clusters[1].score as number) : 0;

        if (hasTags && bestScore < MIN_CLUSTER_TAG_SCORE) {
          console.warn('[Cluster] low-confidence resolution', {
            model: wrapper.kind,
            filter,
            bestClusterId: best._id?.toString(),
            bestScore,
          });

          const res = await rawExec.apply(this, args);
          if (res) {
            if (Array.isArray(res)) {
              for (const doc of res) {
                if (doc && wrapper.isClusterEnabled()) {
                  await upsertClusterForEntity(wrapper.kind, wrapper.schema, doc);
                }
              }
            } else if (wrapper.isClusterEnabled()) {
              await upsertClusterForEntity(wrapper.kind, wrapper.schema, res);
            }
          }
          return res;
        }

        if (hasTags && Math.abs(bestScore - secondScore) < CLUSTER_AMBIGUITY_DELTA && clusters.length > 1) {
          console.warn('[Cluster] ambiguous resolution', {
            model: wrapper.kind,
            filter,
            bestClusterId: best._id?.toString(),
            bestScore,
            secondScore,
            candidateIds: clusters.slice(0, 3).map((c) => c._id?.toString()),
          });
        }

        if (isFindOne) {
          if (!best.currentId) {
            const res = await rawExec.apply(this, args);
            if (res && wrapper.isClusterEnabled()) {
              await upsertClusterForEntity(wrapper.kind, wrapper.schema, res);
            }
            return res;
          }

          const newFilter: any = { _id: best.currentId };
          if (applicationId) newFilter.applicationId = applicationId;
          this._conditions = newFilter;

          // Try cache with resolved _id
          if (wrapper.cacheConfig.enabled) {
            const key = wrapper.buildCacheKey(best.currentId, applicationId);
            const cached = wrapper.getFromCache(key);
            if (cached) return cached;
          }

          const res = await rawExec.apply(this, args);

          if (res && wrapper.cacheConfig.enabled) {
            const key = wrapper.buildCacheKey(best.currentId, applicationId);
            wrapper.setCache(key, res);
          }

          return res;
        } else {
          const ids = clusters.map((c) => c.currentId).filter((id): id is Types.ObjectId => !!id);

          if (!ids.length) {
            const res = await rawExec.apply(this, args);
            if (res && Array.isArray(res) && wrapper.isClusterEnabled()) {
              for (const doc of res) {
                await upsertClusterForEntity(wrapper.kind, wrapper.schema, doc);
              }
            }
            return res;
          }

          const newFilter: any = { _id: { $in: ids } };
          if (applicationId) newFilter.applicationId = applicationId;
          this._conditions = newFilter;

          // Optional: serve from cache if we have all ids cached
          if (wrapper.cacheConfig.enabled) {
            const results: T[] = [];
            let allHit = true;

            for (const id of ids) {
              const key = wrapper.buildCacheKey(id, applicationId);
              const cached = wrapper.getFromCache(key);
              if (!cached) {
                allHit = false;
                break;
              }
              results.push(cached);
            }

            if (allHit) return results;
          }

          const res = await rawExec.apply(this, args);

          if (res && Array.isArray(res) && wrapper.cacheConfig.enabled) {
            for (const d of res) {
              if (!d || !d._id) continue;
              const key = wrapper.buildCacheKey(d._id, applicationId);
              wrapper.setCache(key, d);
            }
          }

          return res;
        }
      } catch (err) {
        console.warn('[Cluster] error during ontology resolution, falling back', {
          model: wrapper.kind,
          filter,
          error: (err as Error).message,
        });
        return rawExec.apply(this, args);
      }
    };

    return q;
  }

  populate(
    docs: T | T[],
    options: string | mongoose.PopulateOptions | string[] | mongoose.PopulateOptions[]
  ): Promise<T | T[]> {
    // If options is an array of strings, convert it to an array of PopulateOptions
    if (Array.isArray(options) && typeof options[0] === 'string') {
      options = (options as string[]).map((path) => ({ path }));
    }

    return this.model.populate(docs, options as string | mongoose.PopulateOptions | mongoose.PopulateOptions[]);
  }

  // New method to directly access a related model
  related(name: string) {
    return mongoose.model(name);
  }

  // New method to get related documents via virtuals
  findWithRelations(filter: FilterQuery<T> = {}, relations: string[] = [], options?: QueryOptions): Query<T[], T> {
    return this.find(filter, null, options).populate(relations.join(' '));
  }

  findOneWithRelations(
    filter: FilterQuery<T> = {},
    relations: string[] = [],
    options?: QueryOptions
  ): Query<T | null, T> {
    return this.findOne(filter, null, options).populate(relations.join(' '));
  }

  // Overridden exec method (raw)
  async exec(query: Query<any, T>): Promise<any> {
    return query.exec();
  }

  private applyDefaultFilters(filter: FilterQuery<T> = {}): FilterQuery<T> {
    const f: any = { ...filter };

    // applicationId scoping for most models
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      if (f.applicationId === undefined) {
        f.applicationId = this.filters.applicationId;
      }
    }

    // Default: ignore archived records, unless caller explicitly set status
    if (this.schema.path('status') && f.status === undefined) {
      f.status = { $ne: 'Archived' } as any;
    }

    return f;
  }

  // Cluster-aware find: returns Query, ontology resolution happens in exec()
  // Override the find method to include filters
  find(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: mongoose.QueryOptions
  ): Query<T[], T> {
    const finalFilter = this.applyDefaultFilters(filter);
    console.log('find', finalFilter);
    return this.model.find(finalFilter, projection, options);
  }

  // Override the findOne method to include filters
  findOne(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: QueryOptions
  ): Query<T | null, T> {
    const finalFilter = this.applyDefaultFilters(filter);
    console.log('findOne', finalFilter);
    return this.model.findOne(finalFilter, projection, options);
  }

  // Override the findById method so it also ignores Archived by default
  findById(
    id: Types.ObjectId | string,
    projection?: ProjectionType<T> | null,
    options?: QueryOptions
  ): Query<T | null, T> {
    const filter: any = { _id: id };
    const finalFilter = this.applyDefaultFilters(filter);
    return this.model.findOne(finalFilter, projection, options);
  }

  // Raw find (no cluster) if you ever need it
  findRaw(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: mongoose.QueryOptions
  ): Query<T[], T> {
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      // @ts-ignore
      filter.applicationId = this.filters.applicationId;
    }
    return this.model.find(filter, projection, options);
  }

  // Override the findOneAndUpdate method to include filters (raw)
  findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | mongoose.UpdateWithAggregationPipeline,
    options?: QueryOptions & { new?: boolean }
  ): Query<T | null, T> {
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      // @ts-ignore
      filter.applicationId = this.filters.applicationId;
    }

    return this.model.findOneAndUpdate(filter, update, options);
  }

  // Override the findOneAndDelete method to include filters (raw)
  findOneAndDelete(filter: FilterQuery<T>, options?: QueryOptions): Query<T | null, T> {
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      // @ts-ignore
      filter.applicationId = this.filters.applicationId;
    }

    return this.model.findOneAndDelete(filter, options);
  }

  // Override the findByIdAndUpdate method to include filters (raw)
  findByIdAndUpdate(
    id: Types.ObjectId | string,
    update: UpdateQuery<T> | mongoose.UpdateWithAggregationPipeline,
    options?: QueryOptions & { new?: boolean }
  ): Query<T | null, T> {
    const filter: FilterQuery<T> = { _id: id } as FilterQuery<T>;

    if (!this.filterOmitModels.includes(this.model.modelName)) {
      // @ts-ignore
      filter.applicationId = this.filters.applicationId;
    }

    return this.model.findOneAndUpdate(filter, update, options);
  }

  // Override the findByIdAndDelete method to include filters (raw)
  findByIdAndDelete(id: Types.ObjectId | string, options?: QueryOptions): Query<T | null, T> {
    const filter: FilterQuery<T> = { _id: id } as FilterQuery<T>;

    if (!this.filterOmitModels.includes(this.model.modelName)) {
      // @ts-ignore
      filter.applicationId = this.filters.applicationId;
    }

    return this.model.findOneAndDelete(filter, options);
  }

  create(doc: Partial<T>): Promise<T>;
  create(doc: Partial<T>[]): Promise<T[]>;
  create(doc: Partial<T> | Partial<T>[]): Promise<T | T[]> {
    console.log('create', this.filters.applicationId);
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      if (Array.isArray(doc)) {
        // @ts-ignore
        doc.forEach((d) => (d.applicationId = this.filters.applicationId));
      } else {
        // @ts-ignore
        doc.applicationId = this.filters.applicationId;
      }
    }

    const p = this.model.create(doc as any) as Promise<T | T[]>;

    if (!this.isClusterEnabled()) {
      return p;
    }

    return p.then(async (res: any) => {
      const docsArray = Array.isArray(res) ? res : [res];
      for (const d of docsArray) {
        // Pass the raw Mongoose document so _id, applicationId, revision, etc. are intact
        const cluster = await upsertClusterForEntity(this.kind, this.schema, d);
        if ('clusterId' in d && !d.clusterId) {
          d.clusterId = cluster._id;
          await d.save();
        }

        // NEW: seed cache
        if (this.cacheConfig.enabled && d._id) {
          const appId = (d as any).applicationId ?? this.filters.applicationId;
          const key = this.buildCacheKey(d._id, appId);
          this.setCache(key, d);
        }
      }
      return res;
    });
  }

  // Override the upsert method to include filters
  async upsert(
    filter: FilterQuery<T> = {},
    create: Partial<T> = {},
    update: UpdateQuery<T> = {},
    options: QueryOptions = {}
  ): Promise<T> {
    const existing = await this.findOne(filter, null, options).exec();
    if (existing) {
      await this.updateOne(filter, update, options).exec();
      return (await this.findOne(filter, null, options).exec()) as T;
    } else {
      return this.create(create) as Promise<T>;
    }
  }

  // Override the updateOne method to include filters (raw)
  updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: any
  ): Query<UpdateWriteOpResult, T> {
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      // @ts-ignore
      filter.applicationId = this.filters.applicationId;
      // @ts-ignore
      update.applicationId = this.filters.applicationId;
    }

    return this.model.updateOne(filter, update, options);
  }

  // Override the updateMany method to include filters (raw)
  updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: any
  ): Query<UpdateWriteOpResult, T> {
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      // @ts-ignore
      filter.applicationId = this.filters.applicationId;
    }

    return this.model.updateMany(filter, update, options);
  }

  // Count documents method
  countDocuments(): any {
    return this.model.countDocuments();
  }

  // Method for handling aggregate (raw)
  aggregate(...props: any[]): any {
    return this.model.aggregate(...props);
  }

  // Method for handling where conditions (raw)
  where(arg1: string, arg2?: any): Query<T[], T>;
  where(arg1: object): Query<T[], T>;
  where(arg1: string | object, arg2?: any): Query<T[], T> {
    return this.model.where(arg1 as any, arg2);
  }

  // Find all documents method (raw)
  findAll(): Query<T[], T> {
    return this.model.find();
  }

  async findOneProxy(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: QueryOptions
  ): Promise<(T & Record<string, any>) | null> {
    const doc = await this.findOne(filter, projection, options).exec();
    if (!doc) return null;

    // Return a doc+model merged proxy
    return createDocProxy(doc, this);
  }

  /**
   * saveQueued(doc):
   *   - If there's an existing in-flight save promise for the same doc, wait until that finishes.
   *   - Then call doc.save().
   *   - Store this new save promise in the WeakMap so future calls chain onto it.
   */
  public async saveQueued(doc: T): Promise<T> {
    const existingPromise = this.docSaveQueue.get(doc) ?? Promise.resolve<T>(doc);

    // Chain a new promise onto the existing one
    const newSavePromise = existingPromise
      .then(async () => {
        // By the time we reach here, previous saves are done.
        return await doc.save(); // Mongoose's normal doc.save()
      })
      .catch((err) => {
        // If the previous promise was rejected, propagate the error
        // but remove from the queue so a later call can try again
        this.docSaveQueue.delete(doc);
        throw err;
      });

    // Store the new promise in the queue
    this.docSaveQueue.set(doc, newSavePromise);

    // Return the doc once the new promise completes
    return newSavePromise;
  }

  // -------------------------------------------------------------------------
  // zkSNARK-aware helpers
  // -------------------------------------------------------------------------

  async createWithProof(doc: Partial<T>, proof: ZkProofPayload): Promise<T>;
  async createWithProof(docs: Partial<T>[], proof: ZkProofPayload): Promise<T[]>;
  async createWithProof(docOrDocs: Partial<T> | Partial<T>[], proof: ZkProofPayload): Promise<T | T[]> {
    await verifyZkOrThrow(proof, {
      kind: this.kind,
      operation: 'create',
      doc: docOrDocs,
    });

    return this.create(docOrDocs as any);
  }

  async updateOneWithProof(
    filter: FilterQuery<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    proof: ZkProofPayload,
    options?: any
  ): Promise<UpdateWriteOpResult> {
    await verifyZkOrThrow(proof, {
      kind: this.kind,
      operation: 'update',
      filter,
      update,
    });

    return this.updateOne(filter, update, options).exec();
  }

  // ---------------------------------------------------------------------------
  // JSON helpers (normalize ids, hide asJSON typings from callers)
  // ---------------------------------------------------------------------------

  /**
   * Find many docs and return normalized JSON (id instead of _id, ObjectIds → string).
   * This hides the mongoose Query/asJSON typing from callers.
   */
  async findJSON(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: QueryOptions
  ): Promise<any[]> {
    // Use the same default filter logic (applicationId, status != Archived)
    const q = this.find(filter, projection, options) as any;

    // If query helper asJSON exists, use it
    if (typeof q.asJSON === 'function') {
      return q.asJSON();
    }

    // Fallback: lean() + deepNormalizeIds
    const res = await q.lean().exec();
    if (Array.isArray(res)) {
      return res.map((doc: any) => deepNormalizeIds(doc, true));
    }
    return [];
  }

  /**
   * Find one doc and return normalized JSON (or null).
   */
  async findOneJSON(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T> | null,
    options?: QueryOptions
  ): Promise<any | null> {
    const q = this.findOne(filter, projection, options) as any;

    if (typeof q.asJSON === 'function') {
      return q.asJSON();
    }

    const res = await q.lean().exec();
    if (!res) return null;
    return deepNormalizeIds(res, true);
  }

  /**
   * Count documents with the same default filter behavior (applicationId, status != Archived).
   */
  async countDocumentsFiltered(filter: FilterQuery<T> = {}): Promise<number> {
    const finalFilter = this.applyDefaultFilters(filter);
    return this.model.countDocuments(finalFilter).exec();
  }
  insertMany(docs: any[], options?: any): Promise<any[]> {
    if (!Array.isArray(docs) || docs.length === 0) return Promise.resolve([]);

    // auto-inject applicationId like create() does
    if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
      for (const d of docs) {
        if (d.applicationId === undefined) d.applicationId = this.filters.applicationId;
      }
    }

    return (this.model as any).insertMany(docs, options);
  }
  /**
   * bulkWrite proxy:
   * - Applies default filters (applicationId scoping + status != Archived) to each op.filter
   * - Ensures applicationId is set on $setOnInsert for upserts (like create())
   */
  bulkWrite(
    operations: any[], // you can type as AnyBulkWriteOperation<T>[] if you want
    options: any = {}
  ): Promise<any> {
    const ops = (operations || []).map((op) => {
      // updateOne / updateMany
      if (op.updateOne?.filter) {
        op.updateOne.filter = this.applyDefaultFilters(op.updateOne.filter);

        // ensure $setOnInsert.applicationId for upserts
        const upsert = !!op.updateOne.upsert;
        if (upsert && this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
          const u = op.updateOne.update || {};
          op.updateOne.update = u;

          // If using aggregation pipeline updates, skip (hard to inject safely)
          if (!Array.isArray(u)) {
            u.$setOnInsert = u.$setOnInsert || {};
            if (u.$setOnInsert.applicationId === undefined) {
              u.$setOnInsert.applicationId = this.filters.applicationId;
            }
          }
        }

        return op;
      }

      if (op.updateMany?.filter) {
        op.updateMany.filter = this.applyDefaultFilters(op.updateMany.filter);
        return op;
      }

      // deleteOne / deleteMany
      if (op.deleteOne?.filter) {
        op.deleteOne.filter = this.applyDefaultFilters(op.deleteOne.filter);
        return op;
      }
      if (op.deleteMany?.filter) {
        op.deleteMany.filter = this.applyDefaultFilters(op.deleteMany.filter);
        return op;
      }

      // replaceOne (rare)
      if (op.replaceOne?.filter) {
        op.replaceOne.filter = this.applyDefaultFilters(op.replaceOne.filter);

        const upsert = !!op.replaceOne.upsert;
        if (upsert && this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
          // replacement doc must include applicationId
          if (op.replaceOne.replacement && op.replaceOne.replacement.applicationId === undefined) {
            op.replaceOne.replacement.applicationId = this.filters.applicationId;
          }
        }

        return op;
      }

      // insertOne
      if (op.insertOne?.document) {
        if (this.filters.applicationId && !this.filterOmitModels.includes(this.model.modelName)) {
          if (op.insertOne.document.applicationId === undefined) {
            op.insertOne.document.applicationId = this.filters.applicationId;
          }
        }
        return op;
      }

      return op;
    });

    // Delegate to real mongoose model bulkWrite
    return (this.model as any).bulkWrite(ops, options);
  }
}

// ---------------------------------------------------------------------------
// Virtual helpers & proxies
// ---------------------------------------------------------------------------

export const addTagVirtuals = (modelName: string) => [
  {
    name: 'tags',
    ref: 'Node',
    localField: '_id',
    foreignField: 'from',
    justOne: false,
    match: { relationKey: 'tag', fromModel: modelName },
  },
];

export const addApplicationVirtual = () => [
  {
    name: 'application',
    ref: 'Application',
    localField: 'applicationId',
    foreignField: '_id',
    justOne: true,
  },
];

export function createDocProxy<T extends Document>(doc: T, modelWrapper: Model<T>) {
  return new Proxy(doc as T & Record<string, any>, {
    get(target, prop, receiver) {
      // 1. If the property exists on the doc itself (fields, doc methods, etc.)
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      // 2. Otherwise, if the property is in your Model wrapper, return that
      if (prop in modelWrapper) {
        const val = Reflect.get(modelWrapper, prop, modelWrapper);
        // If it's a function (like saveQueued), bind it or adapt it
        if (typeof val === 'function') {
          // For example, if we want `proxyDoc.saveQueued()` to automatically
          // call modelWrapper.saveQueued(doc), we can do:
          if (prop === 'saveQueued') {
            return function (...args: any[]) {
              // automatically pass `doc` as the first arg
              // @ts-ignore
              return modelWrapper.saveQueued(doc, ...args);
            };
          }
          // Otherwise just bind the method normally
          return val.bind(modelWrapper);
        }
        return val;
      }

      // 3. If not on doc or modelWrapper, return undefined
      return undefined;
    },
  });
}
