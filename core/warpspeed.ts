import * as fs from 'node:fs';
import * as path from 'node:path';

import type { inferProcedureBuilderResolverOptions } from '@trpc/server';
import type { AnyProcedureBuilder } from '@trpc/server/unstable-core-do-not-import';

import type { RouterContext } from '../types';
import {
  applyWarpInventorySyncOps,
  applyWarpInventorySyncOpsToTable,
  buildWarpCharacterInventoryAuditExport,
  buildWarpCharacterInventoryAuditReceipt,
  buildWarpCharacterInventoryPublicView,
  buildWarpCharacterInventoryPersistence,
  ensureWarpCharacterInventory,
  ensureWarpCharacterInventoryForCharacter,
  exchangeWarpInventoryItem,
  exchangeWarpInventoryItemInTable,
  filterWarpInventoryTableRows,
  findWarpInventoryTableRow,
  isWarpCharacterInventoryAuditReceiptCurrent,
  isCharacterOwnedByProfile,
  materializeWarpCharacterInventoryTable,
  materializeWarpCharacterInventoryTableFromCharacter,
  materializeWarpCharacterInventoryTableFromRows,
  normalizeWarpInventorySyncOps,
  parseWarpInventoryRecordId,
  serializeWarpCharacterInventoryTable,
  syncWarpCharacterInventoryAuthority,
} from '../character/inventory.helpers';
import { ARXError } from '../util/rpc';

type WarpSpeedReducerConfig = {
  reducerName: string;
  tablePlan?: {
    table?: string;
    accessName?: string;
    model?: string;
  };
  runtime?: {
    kind?: string;
  };
  integration?: {
    featureFlags?: string[];
  };
};

type WarpSpeedTableIndexConfig = {
  kind: 'byId' | 'findOne';
  filter?: string;
};

type WarpSpeedTableConfig = {
  tableName: string;
  accessName?: string;
  model: string;
  primaryKey?: string;
  externalKey?: string | null;
  indexes?: Record<string, WarpSpeedTableIndexConfig>;
  operations?: {
    findOneByFilter?: {
      filter?: string;
    };
    findManyByFilter?: {
      filter?: string;
    };
    updateById?: {
      id?: string;
      data?: string;
    };
    create?: {
      data?: string;
    };
  };
};

type WarpSpeedReducerRuntime = {
  manifest?: {
    tables?: WarpSpeedTableConfig[];
    reducers?: WarpSpeedReducerConfig[];
  };
  tableNames?: string[];
  reducerNames?: string[];
  getTableConfig?: (tableName: string) => WarpSpeedTableConfig | null;
  getReducerConfig?: (reducerName: string) => WarpSpeedReducerConfig | null;
  isReducerEnabled?: (reducerName: string, env?: NodeJS.ProcessEnv) => boolean;
  executeReducer(args: {
    reducerName: string;
    input: unknown;
    ctx: unknown;
  }): Promise<unknown>;
};

let cachedArtifactDir: string | null = null;
let cachedRuntimePromise: Promise<WarpSpeedReducerRuntime | null> | null = null;
const compiledIndexFilterCache = new Map<string, (args: Record<string, unknown>) => Record<string, unknown>>();

const ENABLED_VALUE = 'true';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getReducerArtifactDir = (): string | null => {
  const value = process.env.WARPSPEED_ARTIFACT_DIR;
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const deriveReducerFeatureFlags = (reducerName: string): string[] => {
  const normalized = reducerName
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  return [
    'WARPSPEED_ENABLE_ROUTE_REDUCERS',
    'WARPSPEED_ENABLE_REDUCERS',
    `WARPSPEED_ENABLE_${normalized}_REDUCER`,
  ];
};

const resolveReducerFeatureFlags = (runtime: WarpSpeedReducerRuntime, reducerName: string): string[] => {
  const reducerConfig =
    runtime.getReducerConfig?.(reducerName) ??
    runtime.manifest?.reducers?.find((reducer) => reducer.reducerName === reducerName) ??
    null;

  if (
    Array.isArray(reducerConfig?.integration?.featureFlags) &&
    reducerConfig.integration.featureFlags.length > 0
  ) {
    return reducerConfig.integration.featureFlags;
  }

  return deriveReducerFeatureFlags(reducerName);
};

const isReducerEnabled = (runtime: WarpSpeedReducerRuntime, reducerName: string): boolean => {
  if (typeof runtime.isReducerEnabled === 'function') {
    return runtime.isReducerEnabled(reducerName, process.env);
  }

  return resolveReducerFeatureFlags(runtime, reducerName).some((name) => process.env[name] === ENABLED_VALUE);
};

const buildQueryFilter = (query: any): Record<string, any> => {
  const where = query?.where;
  if (!where || typeof where !== 'object' || Array.isArray(where)) return {};

  const buildField = (field: string, condition: any) => {
    if (condition == null) return undefined;

    const normalizedField = field === 'id' || field === '_id' ? '_id' : field;
    if (typeof condition !== 'object' || Array.isArray(condition)) {
      return { [normalizedField]: condition };
    }

    const isPlainObject =
      Object.prototype.toString.call(condition) === '[object Object]' ||
      condition?.constructor?.name === 'Object';
    if (!isPlainObject) {
      return { [normalizedField]: condition };
    }

    if ('equals' in condition) {
      if (condition.equals === undefined) return undefined;
      return { [normalizedField]: condition.equals };
    }

    if ('contains' in condition) {
      const term = condition.contains ?? '';
      if (typeof term === 'string' && term.length === 0) return undefined;
      return {
        [normalizedField]: { $regex: escapeRegExp(String(term)), $options: 'i' },
      };
    }

    if ('in' in condition && Array.isArray(condition.in)) {
      if (condition.in.length === 0) return undefined;
      return { [normalizedField]: { $in: condition.in } };
    }

    return { [normalizedField]: condition };
  };

  const getLogicalChildren = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return [value];
    return [];
  };

  const parseWhereNode = (node: any): Record<string, any> | undefined => {
    if (!node || typeof node !== 'object') return undefined;

    const andClauses: any[] = [];
    const orClauses: any[] = [];

    for (const key of Object.keys(node)) {
      if (key === 'OR' || key === 'AND') continue;
      const fragment = buildField(key, node[key]);
      if (fragment) andClauses.push(fragment);
    }

    for (const child of getLogicalChildren(node.OR)) {
      const parsed = parseWhereNode(child);
      if (parsed) orClauses.push(parsed);
    }

    for (const child of getLogicalChildren(node.AND)) {
      const parsed = parseWhereNode(child);
      if (parsed) andClauses.push(parsed);
    }

    if (andClauses.length && orClauses.length) {
      return { $and: [...andClauses, { $or: orClauses }] };
    }
    if (andClauses.length) {
      return andClauses.length === 1 ? andClauses[0] : { $and: andClauses };
    }
    if (orClauses.length) {
      return { $or: orClauses };
    }

    return undefined;
  };

  return parseWhereNode(where) ?? {};
};

const buildModelAccessor = (ctx: RouterContext, modelName: string) => {
  const model = (ctx.app.model as Record<string, any>)[modelName];

  return {
    async findOne(filter: Record<string, unknown>, select?: Record<string, unknown>) {
      if (!model || typeof model.findOne !== 'function') {
        throw new Error(`Reducer model ${modelName} is unavailable`);
      }

      let query = model.findOne(filter);
      if (select && query && typeof query.select === 'function') {
        query = query.select(select);
      }

      const normalizedQuery = query && typeof query.lean === 'function' ? query.lean() : query;
      if (!normalizedQuery || typeof normalizedQuery.exec !== 'function') {
        throw new Error(`Reducer model ${modelName} does not expose exec()`);
      }

      return normalizedQuery.exec();
    },
    async findById(id: unknown, select?: Record<string, unknown>) {
      if (!model || typeof model.findById !== 'function') {
        throw new Error(`Reducer model ${modelName} cannot find by id`);
      }

      let query = model.findById(id);
      if (select && query && typeof query.select === 'function') {
        query = query.select(select);
      }

      const normalizedQuery = query && typeof query.lean === 'function' ? query.lean() : query;
      if (!normalizedQuery || typeof normalizedQuery.exec !== 'function') {
        throw new Error(`Reducer model ${modelName} findById query does not expose exec()`);
      }

      return normalizedQuery.exec();
    },
    async findByIdAndUpdate(id: unknown, data: Record<string, unknown>) {
      if (!model || typeof model.findByIdAndUpdate !== 'function') {
        throw new Error(`Reducer model ${modelName} cannot update by id`);
      }

      let query = model.findByIdAndUpdate(id, data, { new: true });
      if (!query) {
        throw new Error(`Reducer model ${modelName} did not return an update query`);
      }

      if (typeof query.lean === 'function') {
        query = query.lean();
      }

      if (typeof query.exec !== 'function') {
        throw new Error(`Reducer model ${modelName} update query does not expose exec()`);
      }

      return query.exec();
    },
    async find(filter: Record<string, unknown>, select?: Record<string, unknown>) {
      if (!model || typeof model.find !== 'function') {
        throw new Error(`Reducer model ${modelName} cannot find many`);
      }

      let query = model.find(filter);
      if (select && query && typeof query.select === 'function') {
        query = query.select(select);
      }

      const normalizedQuery = query && typeof query.lean === 'function' ? query.lean() : query;
      if (!normalizedQuery || typeof normalizedQuery.exec !== 'function') {
        throw new Error(`Reducer model ${modelName} find query does not expose exec()`);
      }

      return normalizedQuery.exec();
    },
    async create(data: Record<string, unknown>) {
      if (!model || typeof model.create !== 'function') {
        throw new Error(`Reducer model ${modelName} cannot create`);
      }

      const created = await model.create(data);
      return typeof created?.toObject === 'function' ? created.toObject() : created;
    },
  };
};

const buildIndexFilter = (filterSource: string, args: Record<string, unknown>): Record<string, unknown> => {
  let compiledFilter = compiledIndexFilterCache.get(filterSource);
  if (!compiledFilter) {
    compiledFilter = new Function('args', `return (${filterSource});`) as (
      args: Record<string, unknown>
    ) => Record<string, unknown>;
    compiledIndexFilterCache.set(filterSource, compiledFilter);
  }

  const filter = compiledFilter(args);
  if (!filter || typeof filter !== 'object' || Array.isArray(filter)) {
    throw new Error(`Reducer index filter ${filterSource} did not return an object`);
  }

  return filter;
};

const unwrapFilterValue = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }

  if ('equals' in (value as Record<string, unknown>)) {
    return (value as Record<string, unknown>).equals;
  }

  return value;
};

const normalizeCharacterInventoryTableFilter = (
  input: Record<string, unknown> | null | undefined
): {
  characterId?: string;
  recordPk?: number;
  recordId?: string;
  itemId?: string;
  itemKey?: string;
} => {
  const source =
    input?.where && typeof input.where === 'object' && !Array.isArray(input.where)
      ? (input.where as Record<string, unknown>)
      : (input ?? {});

  const recordIdValue = unwrapFilterValue(source.recordId);
  const parsedRecordId =
    typeof recordIdValue === 'string' && recordIdValue.trim().length > 0 ? recordIdValue.trim() : undefined;
  const parsedInventoryRecordId = parsedRecordId ? parseWarpInventoryRecordId(parsedRecordId) : null;
  const characterIdValue = unwrapFilterValue(source.characterId);
  const recordPkValue = unwrapFilterValue(source.recordPk);
  const itemIdValue = unwrapFilterValue(source.itemId);
  const itemKeyValue = unwrapFilterValue(source.itemKey);
  const recordPk = Number(recordPkValue);

  return {
    ...(typeof characterIdValue === 'string' && characterIdValue.trim().length > 0
      ? { characterId: characterIdValue.trim() }
      : parsedInventoryRecordId?.characterId
        ? { characterId: parsedInventoryRecordId.characterId }
        : {}),
    ...(Number.isInteger(recordPk) && recordPk > 0 ? { recordPk } : parsedInventoryRecordId?.recordPk ? { recordPk: parsedInventoryRecordId.recordPk } : {}),
    ...(parsedRecordId ? { recordId: parsedRecordId } : {}),
    ...(typeof itemIdValue === 'string' && itemIdValue.trim().length > 0 ? { itemId: itemIdValue.trim() } : {}),
    ...(typeof itemKeyValue === 'string' && itemKeyValue.trim().length > 0 ? { itemKey: itemKeyValue.trim() } : {}),
  };
};

const normalizeTableConfig = (tableConfig: WarpSpeedTableConfig) => ({
  tableName: tableConfig.tableName,
  accessName: tableConfig.accessName || tableConfig.tableName,
  model: tableConfig.model,
  primaryKey:
    typeof tableConfig.primaryKey === 'string' && tableConfig.primaryKey.trim().length > 0
      ? tableConfig.primaryKey.trim()
      : 'id',
  externalKey:
    typeof tableConfig.externalKey === 'string' && tableConfig.externalKey.trim().length > 0
      ? tableConfig.externalKey.trim()
      : null,
});

const decorateTableBinding = (tableConfig: WarpSpeedTableConfig, binding: Record<string, any>) => {
  const normalized = normalizeTableConfig(tableConfig);

  return Object.freeze({
    ...binding,
    tableName: normalized.tableName,
    accessName: normalized.accessName,
    model: normalized.model,
    primaryKey: normalized.primaryKey,
    externalKey: normalized.externalKey,
    keyLayout: Object.freeze({
      primaryKey: normalized.primaryKey,
      externalKey: normalized.externalKey,
    }),
    getInternalKey:
      typeof binding.getInternalKey === 'function' ? binding.getInternalKey.bind(binding) : () => null,
    getExternalKey:
      typeof binding.getExternalKey === 'function' ? binding.getExternalKey.bind(binding) : () => null,
  });
};

const buildCharacterInventoryItemsTableAccessor = (ctx: RouterContext, tableConfig: WarpSpeedTableConfig) => {
  const characterInventoryItemModel = (ctx.app.model as Record<string, any>).CharacterInventoryItem;
  const characterInventoryReceiptModel = (ctx.app.model as Record<string, any>).CharacterInventoryReceipt;
  const characterInventoryPublicationModel = (ctx.app.model as Record<string, any>).CharacterInventoryPublication;
  const characterInventoryItemAccessor =
    characterInventoryItemModel &&
    (typeof characterInventoryItemModel.find === 'function' ||
      typeof characterInventoryItemModel.findOne === 'function')
      ? buildModelAccessor(ctx, 'CharacterInventoryItem')
      : null;
  const characterInventoryReceiptAccessor =
    characterInventoryReceiptModel && typeof characterInventoryReceiptModel.findOne === 'function'
      ? buildModelAccessor(ctx, 'CharacterInventoryReceipt')
      : null;
  const characterAccessor = buildModelAccessor(ctx, 'Character');

  const resolveCollectionFilter = (input: Record<string, unknown> | null | undefined) =>
    normalizeCharacterInventoryTableFilter(input);

  const loadCollectionReceipt = async (characterId: string) => {
    if (!characterInventoryReceiptAccessor || !characterId) {
      return null;
    }

    return characterInventoryReceiptAccessor.findOne({ characterId });
  };

  const loadAuthoritativeCharacterInventoryTable = async (character: Record<string, unknown> | null | undefined) => {
    const characterId =
      character?.id != null && String(character.id).trim().length > 0
        ? String(character.id)
        : character?._id != null && String(character._id).trim().length > 0
          ? String(character._id)
          : '';

    const filter = characterId ? { characterId } : {};
    const collectionRows = await loadCollectionRows(filter);
    if (Array.isArray(collectionRows) && collectionRows.length > 0) {
      const table = materializeWarpCharacterInventoryTableFromRows(characterId, collectionRows);
      const receipt = await loadCollectionReceipt(characterId);
      if (
        character &&
        (characterInventoryItemModel || characterInventoryReceiptModel) &&
        !isWarpCharacterInventoryAuditReceiptCurrent(receipt, table)
      ) {
        await syncWarpCharacterInventoryAuthority(
          {
            itemModel: characterInventoryItemModel,
            receiptModel: characterInventoryReceiptModel,
            publicationModel: characterInventoryPublicationModel,
          },
          character,
          table
        );
      }
      return table;
    }

    if (!characterId || !character) {
      return null;
    }

    const table = materializeWarpCharacterInventoryTableFromCharacter(character);
    if (
      Array.isArray(collectionRows) &&
      collectionRows.length === 0 &&
      (characterInventoryItemModel || characterInventoryReceiptModel) &&
      table.rows.length > 0
    ) {
      await syncWarpCharacterInventoryAuthority(
        {
          itemModel: characterInventoryItemModel,
          receiptModel: characterInventoryReceiptModel,
          publicationModel: characterInventoryPublicationModel,
        },
        character,
        table
      );
    }

    return table;
  };

  const loadCollectionRows = async (filter: {
    characterId?: string;
    recordPk?: number;
    recordId?: string;
    itemId?: string;
    itemKey?: string;
  }) => {
    if (!characterInventoryItemAccessor || !filter.characterId) {
      return null;
    }

    const rows = await characterInventoryItemAccessor.find(filter);
    return Array.isArray(rows) ? rows : [];
  };

  const resolveTable = async (input: Record<string, unknown> | null | undefined) => {
    const filter = normalizeCharacterInventoryTableFilter(input);
    const collectionRows = await loadCollectionRows(filter);
    if (Array.isArray(collectionRows) && collectionRows.length > 0) {
      return {
        filter,
        table: materializeWarpCharacterInventoryTableFromRows(filter.characterId, collectionRows),
      };
    }

    if (!filter.characterId) {
      return { filter, table: null };
    }

    const character = await characterAccessor.findById(filter.characterId);
    if (!character) {
      return { filter, table: null };
    }

    const table = await loadAuthoritativeCharacterInventoryTable(character);

    return {
      filter,
      table,
    };
  };

  const tableAccessor: Record<string, any> = {
    async findOneByFilter(input: Record<string, unknown>) {
      if (characterInventoryItemAccessor) {
        const collectionResult = await characterInventoryItemAccessor.findOne(resolveCollectionFilter(input));
        if (collectionResult) {
          return collectionResult;
        }
      }
      const { filter, table } = await resolveTable(input);
      return table ? findWarpInventoryTableRow(table, filter) : null;
    },
    async findManyByFilter(input: Record<string, unknown>) {
      if (characterInventoryItemAccessor) {
        const collectionRows = await characterInventoryItemAccessor.find(resolveCollectionFilter(input));
        if (Array.isArray(collectionRows) && collectionRows.length > 0) {
          return collectionRows;
        }
      }
      const { filter, table } = await resolveTable(input);
      return table ? filterWarpInventoryTableRows(table, filter) : [];
    },
    getInternalKey(recordId: unknown) {
      return parseWarpInventoryRecordId(recordId)?.recordPk ?? null;
    },
    async getReceipt(characterId: unknown) {
      const normalizedCharacterId = characterId == null ? '' : String(characterId);
      const { table } = await resolveTable({ characterId: normalizedCharacterId });

      if (characterInventoryReceiptAccessor && normalizedCharacterId) {
        const receipt = await characterInventoryReceiptAccessor.findOne({ characterId: normalizedCharacterId });
        if (receipt && (!table || isWarpCharacterInventoryAuditReceiptCurrent(receipt, table))) {
          return receipt;
        }
      }

      return table ? buildWarpCharacterInventoryAuditReceipt(table) : null;
    },
    async updateById(characterId: unknown, data: Record<string, unknown>) {
      if (!characterInventoryItemModel || typeof characterInventoryItemModel.bulkWrite !== 'function') {
        throw new Error('Workflow table characterInventoryItems cannot update without CharacterInventoryItem model');
      }

      const normalizedCharacterId = characterId == null ? '' : String(characterId);
      const character =
        data?.character && typeof data.character === 'object'
          ? (data.character as Record<string, unknown>)
          : await characterAccessor.findById(normalizedCharacterId);

      if (!character) {
        throw new Error(`Character ${normalizedCharacterId} is unavailable for characterInventoryItems sync`);
      }

      const tableSource =
        data?.table && typeof data.table === 'object'
          ? (data.table as Record<string, unknown>)
          : data;
      const rows = Array.isArray((tableSource as Record<string, unknown>)?.rows)
        ? ((tableSource as Record<string, unknown>).rows as Array<Record<string, unknown>>)
        : [];
      const table = materializeWarpCharacterInventoryTableFromRows(normalizedCharacterId, rows);

      await syncWarpCharacterInventoryAuthority(
        {
          itemModel: characterInventoryItemModel,
          receiptModel: characterInventoryReceiptModel,
          publicationModel: characterInventoryPublicationModel,
        },
        character,
        table
      );
      return rows;
    },
  };

  for (const [accessName, indexConfig] of Object.entries(tableConfig.indexes ?? {})) {
    if (indexConfig.kind === 'findOne') {
      tableAccessor[accessName] = {
        async findOne(args: Record<string, unknown>) {
          if (characterInventoryItemAccessor) {
            const collectionResult = await characterInventoryItemAccessor.findOne(resolveCollectionFilter(args));
            if (collectionResult) {
              return collectionResult;
            }
          }
          const { filter, table } = await resolveTable(args);
          return table ? findWarpInventoryTableRow(table, filter) : null;
        },
      };
    }
  }

  return decorateTableBinding(tableConfig, tableAccessor);
};

const buildTableAccessor = (ctx: RouterContext, tableConfig: WarpSpeedTableConfig) => {
  if (tableConfig.tableName === 'characterInventoryItems') {
    return buildCharacterInventoryItemsTableAccessor(ctx, tableConfig);
  }

  const modelAccessor = buildModelAccessor(ctx, tableConfig.model);
  const tableAccessor: Record<string, any> = {
    async findOneByFilter(input: unknown) {
      return modelAccessor.findOne(buildQueryFilter(input));
    },
    async findManyByFilter(input: unknown) {
      return modelAccessor.find(buildQueryFilter(input));
    },
    async updateById(id: unknown, data: Record<string, unknown>) {
      const updated = await modelAccessor.findByIdAndUpdate(id, data);
      return updated;
    },
    async create(data: Record<string, unknown>) {
      return modelAccessor.create(data);
    },
  };

  for (const [accessName, indexConfig] of Object.entries(tableConfig.indexes ?? {})) {
    if (indexConfig.kind === 'byId') {
      tableAccessor[accessName] = {
        async get(id: unknown) {
          return modelAccessor.findById(id);
        },
      };
      continue;
    }

    if (indexConfig.kind === 'findOne' && typeof indexConfig.filter === 'string') {
      tableAccessor[accessName] = {
        async findOne(args: Record<string, unknown>) {
          return modelAccessor.findOne(buildIndexFilter(indexConfig.filter as string, args));
        },
      };
    }
  }

  return decorateTableBinding(tableConfig, tableAccessor);
};

const buildReducerCtx = (ctx: RouterContext, runtime: WarpSpeedReducerRuntime) => {
  const db: Record<string, any> = {
    model(modelName: string) {
      return buildModelAccessor(ctx, modelName);
    },
    table(tableName: string) {
      const tableConfig =
        runtime.getTableConfig?.(tableName) ??
        runtime.manifest?.tables?.find((table) => table.tableName === tableName) ??
        null;

      if (!tableConfig) {
        throw new Error(`Reducer table ${tableName} is unavailable`);
      }

      return buildTableAccessor(ctx, tableConfig);
    },
  };

  for (const tableConfig of runtime.manifest?.tables ?? []) {
    db[tableConfig.accessName || tableConfig.tableName] = buildTableAccessor(ctx, tableConfig);
  }

  return {
    db,
    helpers: {
      getFilter: buildQueryFilter,
      ensureWarpCharacterInventory,
      ensureWarpCharacterInventoryForCharacter,
      applyWarpInventorySyncOps,
      applyWarpInventorySyncOpsToTable,
      buildWarpCharacterInventoryAuditExport,
      buildWarpCharacterInventoryAuditReceipt,
      buildWarpCharacterInventoryPersistence,
      buildWarpCharacterInventoryPublicView,
      exchangeWarpInventoryItem,
      exchangeWarpInventoryItemInTable,
      isCharacterOwnedByProfile,
      loadCharacterInventoryReceipt: async (_workflowCtx: unknown, characterId: unknown) =>
        loadCharacterInventoryReceiptFromContext(ctx, characterId),
      loadAuthoritativeCharacterInventoryTable: async (
        workflowCtxOrCharacter: Record<string, unknown> | null | undefined,
        maybeCharacter?: Record<string, unknown> | null | undefined
      ) => {
        const character = maybeCharacter ?? workflowCtxOrCharacter;
        const characterId =
          character?.id != null && String(character.id).trim().length > 0
            ? String(character.id)
            : character?._id != null && String(character._id).trim().length > 0
              ? String(character._id)
              : '';

        const inventoryTableAccessor = db.characterInventoryItems;
        const characterInventoryItemModel = (ctx.app.model as Record<string, any>).CharacterInventoryItem;
        const characterInventoryReceiptModel = (ctx.app.model as Record<string, any>).CharacterInventoryReceipt;
        const characterInventoryPublicationModel = (ctx.app.model as Record<string, any>).CharacterInventoryPublication;
        if (!inventoryTableAccessor || typeof inventoryTableAccessor.findManyByFilter !== 'function') {
          return character ? materializeWarpCharacterInventoryTableFromCharacter(character) : null;
        }

        const collectionRows = characterId
          ? await inventoryTableAccessor.findManyByFilter({
              where: {
                characterId: {
                  equals: characterId,
                },
              },
            })
          : [];

        if (Array.isArray(collectionRows) && collectionRows.length > 0) {
          const table = materializeWarpCharacterInventoryTableFromRows(characterId, collectionRows);
          const receipt =
            characterInventoryReceiptModel && typeof characterInventoryReceiptModel.findOne === 'function'
              ? await buildModelAccessor(ctx, 'CharacterInventoryReceipt').findOne({ characterId })
              : null;

          if (
            character &&
            (characterInventoryItemModel || characterInventoryReceiptModel) &&
            !isWarpCharacterInventoryAuditReceiptCurrent(receipt, table)
          ) {
            await syncWarpCharacterInventoryAuthority(
              {
                itemModel: characterInventoryItemModel,
                receiptModel: characterInventoryReceiptModel,
                publicationModel: characterInventoryPublicationModel,
              },
              character,
              table
            );
          }

          return table;
        }

        if (!character) {
          return null;
        }

        const table = materializeWarpCharacterInventoryTableFromCharacter(character);
        if (
          characterId &&
          Array.isArray(collectionRows) &&
          collectionRows.length === 0 &&
          (characterInventoryItemModel || characterInventoryReceiptModel) &&
          table.rows.length > 0
        ) {
            await syncWarpCharacterInventoryAuthority(
              {
                itemModel: characterInventoryItemModel,
                receiptModel: characterInventoryReceiptModel,
                publicationModel: characterInventoryPublicationModel,
              },
              character,
              table
            );
        }

        return table;
      },
      materializeWarpCharacterInventoryTable,
      materializeWarpCharacterInventoryTableFromCharacter,
      materializeWarpCharacterInventoryTableFromRows,
      serializeWarpCharacterInventoryTable,
    },
    app: {
      filters: ctx.app.filters || {},
    },
    client: {
      roles: ctx.client?.roles || [],
      ...(ctx.client?.profile?.id
        ? {
            profile: {
              id: String(ctx.client.profile.id),
            },
          }
        : {}),
    },
    now: Date.now(),
  };
};

const loadRuntime = async (artifactDir: string): Promise<WarpSpeedReducerRuntime | null> => {
  if (cachedRuntimePromise && cachedArtifactDir === artifactDir) {
    return cachedRuntimePromise;
  }

  cachedArtifactDir = artifactDir;
  cachedRuntimePromise = (async () => {
    const loaderPath = path.join(artifactDir, 'loader.cjs');
    if (!fs.existsSync(loaderPath)) {
      return null;
    }

    try {
      const loader = require(loaderPath);
      if (!loader || typeof loader.loadWarpSpeedArtifacts !== 'function') {
        return null;
      }

      const runtime = await loader.loadWarpSpeedArtifacts(artifactDir);
      if (!runtime || typeof runtime.executeReducer !== 'function') {
        return null;
      }

      return runtime as WarpSpeedReducerRuntime;
    } catch {
      return null;
    }
  })();

  return cachedRuntimePromise;
};

const rehydrateWarpSpeedError = (error: unknown): unknown => {
  if (error instanceof ARXError) {
    return error;
  }

  if (!error || typeof error !== 'object') {
    return error;
  }

  const structured = error as { name?: unknown; code?: unknown; message?: unknown };
  if (structured.name === 'ARXError' && typeof structured.code === 'string') {
    return new ARXError(structured.code as any, typeof structured.message === 'string' ? structured.message : undefined);
  }

  return error;
};

const resolveItemByKeyFromContext = async (
  ctx: RouterContext,
  itemKey: string
): Promise<Record<string, unknown> | null> => {
  const itemModel = (ctx?.app?.model as Record<string, any> | undefined)?.Item;
  if (!itemModel || typeof itemModel.findOne !== 'function') {
    return null;
  }

  let query = itemModel.findOne({ key: itemKey });
  if (query && typeof query.lean === 'function') {
    query = query.lean();
  }

  if (!query || typeof query.exec !== 'function') {
    return null;
  }

  const result = await query.exec();
  return result && typeof result === 'object' ? result : null;
};

const loadCharacterInventoryReceiptFromContext = async (
  ctx: RouterContext,
  characterId: unknown
): Promise<Record<string, unknown> | null> => {
  const normalizedCharacterId = characterId == null ? '' : String(characterId).trim();
  if (!normalizedCharacterId) {
    return null;
  }

  const receiptModel = (ctx?.app?.model as Record<string, any> | undefined)?.CharacterInventoryReceipt;
  if (!receiptModel || typeof receiptModel.findOne !== 'function') {
    return null;
  }

  let query = receiptModel.findOne({ characterId: normalizedCharacterId });
  if (query && typeof query.lean === 'function') {
    query = query.lean();
  }

  if (!query || typeof query.exec !== 'function') {
    return null;
  }

  const result = await query.exec();
  return result && typeof result === 'object' ? result : null;
};

const normalizeWarpSpeedReducerInput = async ({
  reducerName,
  input,
  ctx,
}: {
  reducerName: string;
  input: unknown;
  ctx: RouterContext;
}): Promise<unknown> => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (reducerName === 'character.applyCharacterInventoryPatch' && Array.isArray((input as any).ops)) {
    const normalizedOps = await normalizeWarpInventorySyncOps((input as any).ops, {
      resolveItemByKey: async ({ itemKey }) => await resolveItemByKeyFromContext(ctx, itemKey),
      fallbackToItemKey: true,
      defaultX: 1,
      defaultY: 1,
    });

    return {
      ...(input as Record<string, unknown>),
      ops: normalizedOps,
    };
  }

  if (reducerName !== 'character.exchangeCharacterItem') {
    return input;
  }

  const normalizedOps = await normalizeWarpInventorySyncOps(
    [
      {
        op: 'remove',
        itemId: (input as any).itemId,
        itemKey: (input as any).itemKey,
        quantity: (input as any).quantity,
      },
    ],
    {
      resolveItemByKey: async ({ itemKey }) => await resolveItemByKeyFromContext(ctx, itemKey),
      fallbackToItemKey: true,
    }
  );
  const normalizedOp = normalizedOps[0];

  if (!normalizedOp || typeof normalizedOp !== 'object') {
    return input;
  }

  if (normalizedOp.op !== 'add' && normalizedOp.op !== 'remove') {
    return input;
  }

  return {
    ...(input as Record<string, unknown>),
    ...(normalizedOp.itemId ? { itemId: normalizedOp.itemId } : {}),
    ...(normalizedOp.itemKey ? { itemKey: normalizedOp.itemKey } : {}),
    ...(normalizedOp.quantity != null ? { quantity: normalizedOp.quantity } : {}),
  };
};

export const maybeInvokeWarpSpeedReducer = async <T>({
  reducerName,
  input,
  ctx,
  fallback,
}: {
  reducerName: string;
  input: unknown;
  ctx: RouterContext;
  fallback: (normalizedInput: unknown) => Promise<T> | T;
}): Promise<T> => {
  const normalizedInput = await normalizeWarpSpeedReducerInput({
    reducerName,
    input,
    ctx,
  });
  const artifactDir = getReducerArtifactDir();
  if (!artifactDir) {
    return await fallback(normalizedInput);
  }

  const runtime = await loadRuntime(artifactDir);
  const reducerConfig =
    runtime?.getReducerConfig?.(reducerName) ??
    runtime?.manifest?.reducers?.find((reducer) => reducer.reducerName === reducerName) ??
    null;

  if (!runtime || !reducerConfig || !isReducerEnabled(runtime, reducerName)) {
    return await fallback(normalizedInput);
  }

  try {
    return (await runtime.executeReducer({
      reducerName,
      input: normalizedInput,
      ctx: buildReducerCtx(ctx, runtime),
    })) as T;
  } catch (error) {
    throw rehydrateWarpSpeedError(error);
  }
};

type WarpRouteKind = 'reducer' | 'procedure' | 'view';
type WarpServiceName = string;

type WarpRouteCallArgs = {
  input: unknown;
  ctx: RouterContext;
};

type WarpResolver<TBuilder extends AnyProcedureBuilder> = (
  args: inferProcedureBuilderResolverOptions<TBuilder>
) => Promise<unknown>;

type NormalizeProcedureBuilder<TBuilder> = TBuilder extends AnyProcedureBuilder ? TBuilder : never;

type WarpNamedProcedureBuilder<TBuilder extends AnyProcedureBuilder> = Omit<
  TBuilder,
  'use' | 'input' | 'output' | 'meta' | 'query' | 'mutation'
> & {
  use(
    middleware: Parameters<TBuilder['use']>[0]
  ): WarpNamedProcedureBuilder<NormalizeProcedureBuilder<ReturnType<TBuilder['use']>>>;
  input(
    schema: Parameters<TBuilder['input']>[0]
  ): WarpNamedProcedureBuilder<NormalizeProcedureBuilder<ReturnType<TBuilder['input']>>>;
  output(
    schema: Parameters<TBuilder['output']>[0]
  ): WarpNamedProcedureBuilder<NormalizeProcedureBuilder<ReturnType<TBuilder['output']>>>;
  meta(
    meta: Parameters<TBuilder['meta']>[0]
  ): WarpNamedProcedureBuilder<NormalizeProcedureBuilder<ReturnType<TBuilder['meta']>>>;
  query(handler?: Parameters<TBuilder['query']>[0]): ReturnType<TBuilder['query']>;
  mutation(handler?: Parameters<TBuilder['mutation']>[0]): ReturnType<TBuilder['mutation']>;
};

type WarpTrpcBindings<TBuilder extends AnyProcedureBuilder> = {
  reducer(unitName: string): WarpNamedProcedureBuilder<TBuilder>;
  procedure(unitName: string): WarpNamedProcedureBuilder<TBuilder>;
  view(unitName: string): WarpNamedProcedureBuilder<TBuilder>;
};

const getCoreServiceMethodName = (unitName: string): string => {
  const tokens = unitName.split('.');
  return tokens[tokens.length - 1] || unitName;
};

const invokeServiceByUnitName = async ({
  serviceName,
  unitName,
  input,
  ctx,
}: {
  serviceName: WarpServiceName;
  unitName: string;
  input: unknown;
  ctx: RouterContext;
}): Promise<unknown> => {
  const methodName = getCoreServiceMethodName(unitName);
  const services = ctx?.app?.service as Record<string, unknown> | undefined;
  const service = services?.[serviceName] as Record<string, unknown> | undefined;
  const method = service?.[methodName];

  if (typeof method !== 'function') {
    throw new Error(`${serviceName} service fallback ${methodName} is unavailable`);
  }

  return await Reflect.apply(method, service, [input, ctx]);
};

const executeWarpNamedRoute = async ({
  serviceName,
  kind,
  unitName,
  input,
  ctx,
}: {
  serviceName: WarpServiceName;
  kind: WarpRouteKind;
  unitName: string;
  input: unknown;
  ctx: RouterContext;
}): Promise<unknown> => {
  const fallback = async (normalizedInput: unknown) =>
    await invokeServiceByUnitName({ serviceName, unitName, input: normalizedInput, ctx });
  return await maybeInvokeWarpSpeedReducer({
    reducerName: unitName,
    input,
    ctx,
    fallback,
  });
};

const wrapWarpProcedureBuilder = <TBuilder extends AnyProcedureBuilder>({
  baseProcedure,
  serviceName,
  kind,
  unitName,
}: {
  baseProcedure: TBuilder;
  serviceName: WarpServiceName;
  kind: WarpRouteKind;
  unitName: string;
}): WarpNamedProcedureBuilder<TBuilder> => {
  const wrap = <TNextBuilder extends AnyProcedureBuilder>(
    nextProcedure: TNextBuilder
  ): WarpNamedProcedureBuilder<TNextBuilder> =>
    wrapWarpProcedureBuilder({
      baseProcedure: nextProcedure,
      serviceName,
      kind,
      unitName,
    });

  const buildDefaultHandler =
    () =>
    async ({ input, ctx }: WarpRouteCallArgs): Promise<unknown> =>
      await executeWarpNamedRoute({
        serviceName,
        kind,
        unitName,
        input,
        ctx,
      });

  const wrapped = Object.create(baseProcedure) as WarpNamedProcedureBuilder<TBuilder>;

  wrapped.use = ((middleware: Parameters<TBuilder['use']>[0]) => {
    return wrap(
      baseProcedure.use(middleware) as NormalizeProcedureBuilder<ReturnType<TBuilder['use']>>
    );
  }) as WarpNamedProcedureBuilder<TBuilder>['use'];

  wrapped.input = ((schema: Parameters<TBuilder['input']>[0]) => {
    return wrap(
      baseProcedure.input(schema) as NormalizeProcedureBuilder<ReturnType<TBuilder['input']>>
    );
  }) as WarpNamedProcedureBuilder<TBuilder>['input'];

  wrapped.output = ((schema: Parameters<TBuilder['output']>[0]) => {
    return wrap(
      baseProcedure.output(schema) as NormalizeProcedureBuilder<ReturnType<TBuilder['output']>>
    );
  }) as WarpNamedProcedureBuilder<TBuilder>['output'];

  wrapped.meta = ((meta: Parameters<TBuilder['meta']>[0]) => {
    return wrap(baseProcedure.meta(meta) as NormalizeProcedureBuilder<ReturnType<TBuilder['meta']>>);
  }) as WarpNamedProcedureBuilder<TBuilder>['meta'];

  wrapped.query = ((handler?: Parameters<TBuilder['query']>[0]) => {
    const resolver = handler ?? (buildDefaultHandler() as WarpResolver<TBuilder>);
    return baseProcedure.query(resolver as Parameters<TBuilder['query']>[0]) as ReturnType<TBuilder['query']>;
  }) as WarpNamedProcedureBuilder<TBuilder>['query'];

  wrapped.mutation = ((handler?: Parameters<TBuilder['mutation']>[0]) => {
    const resolver = handler ?? (buildDefaultHandler() as WarpResolver<TBuilder>);
    return baseProcedure.mutation(resolver as Parameters<TBuilder['mutation']>[0]) as ReturnType<TBuilder['mutation']>;
  }) as WarpNamedProcedureBuilder<TBuilder>['mutation'];

  return wrapped;
};

export const createWarpTrpcBindings = <TBuilder extends AnyProcedureBuilder>(
  baseProcedure: TBuilder,
  { serviceName = 'Core' }: { serviceName?: WarpServiceName } = {}
): WarpTrpcBindings<TBuilder> => ({
  reducer(unitName: string): WarpNamedProcedureBuilder<TBuilder> {
    return wrapWarpProcedureBuilder({
      baseProcedure,
      serviceName,
      kind: 'reducer',
      unitName,
    });
  },
  procedure(unitName: string): WarpNamedProcedureBuilder<TBuilder> {
    return wrapWarpProcedureBuilder({
      baseProcedure,
      serviceName,
      kind: 'procedure',
      unitName,
    });
  },
  view(unitName: string): WarpNamedProcedureBuilder<TBuilder> {
    return wrapWarpProcedureBuilder({
      baseProcedure,
      serviceName,
      kind: 'view',
      unitName,
    });
  },
});

export const resetWarpSpeedReducerRuntimeForTests = (): void => {
  cachedArtifactDir = null;
  cachedRuntimePromise = null;
};

export const buildWarpSpeedReducerCtxForTests = buildReducerCtx;
export const rehydrateWarpSpeedErrorForTests = rehydrateWarpSpeedError;
export const normalizeWarpSpeedReducerInputForTests = normalizeWarpSpeedReducerInput;
