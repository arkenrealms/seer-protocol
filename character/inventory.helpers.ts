import { createHash } from 'node:crypto';
import type { EntityPatch, PatchOp } from '../types';

export type WarpInventoryItemValue = {
  itemKey?: string;
  itemId?: string;
  quantity?: number;
  qty?: number;
  x?: number;
  y?: number;
  meta?: any;
};

export type WarpInventorySyncOp =
  | { op: 'add'; itemKey?: string; itemId?: string; quantity?: number; qty?: number; x?: number; y?: number }
  | { op: 'remove'; itemKey?: string; itemId?: string; quantity?: number; qty?: number }
  | { op: 'move'; itemKey?: string; itemId?: string; x?: number; y?: number }
  | { op: 'push'; key?: string; value?: WarpInventoryItemValue };

export type WarpInventoryEntitySyncHit = {
  characterId: string;
  ops: Array<Extract<WarpInventorySyncOp, { op: 'add' | 'remove' }>>;
};

export type WarpProjectedInventoryRecord = {
  recordId: string;
  recordPk: number;
  characterId: string;
  bagIndex: number;
  slotIndex: number;
  itemId?: string;
  itemKey?: string;
  quantity: number;
  hasExplicitQuantity: boolean;
  item: Record<string, any>;
};

export type WarpMaterializedInventoryTable = {
  tableName: 'characterInventoryItems';
  accessName: 'characterInventoryItems';
  primaryKey: 'recordPk';
  externalKey: 'recordId';
  verificationMode: 'audited';
  characterId: string;
  rows: WarpProjectedInventoryRecord[];
  bags: any[];
  nextRecordPk: number;
};

export type WarpPersistedInventoryTable = WarpMaterializedInventoryTable & {
  version: 1;
  audit: WarpCharacterInventoryAuditReceipt;
};

export type WarpCharacterInventoryPersistence = {
  inventory: any;
  data: Record<string, any>;
};

export type WarpCharacterInventoryItemDocument = {
  characterId: string;
  recordPk: number;
  recordId: string;
  bagIndex: number;
  slotIndex: number;
  itemId?: string;
  itemKey?: string;
  quantity: number;
  hasExplicitQuantity: boolean;
  item: Record<string, any>;
  applicationId?: unknown;
  ownerId?: unknown;
  audit?: WarpCharacterInventoryAuditReceipt;
};

export type WarpCharacterInventoryReceiptDocument = WarpCharacterInventoryAuditReceipt & {
  exportHash: string;
  applicationId?: unknown;
  ownerId?: unknown;
};

export type WarpCharacterInventoryPublicationDocument = WarpCharacterInventoryAuditPublication & {
  version: 1;
  verificationMode: 'audited';
  tableName: 'characterInventoryItems';
  characterId: string;
  rowCount: number;
  merkleRoot: string;
  updatedDate: string;
  applicationId?: unknown;
  ownerId?: unknown;
};

export type WarpCharacterInventoryAuditReceipt = {
  version: 1;
  verificationMode: 'audited';
  tableName: 'characterInventoryItems';
  characterId: string;
  rowCount: number;
  nextRecordPk: number;
  receiptHash: string;
  exportHash: string;
  updatedDate: string;
};

export type WarpCharacterInventoryAuditRow = {
  recordPk: number;
  recordId: string;
  characterId: string;
  bagIndex: number;
  slotIndex: number;
  itemId?: string;
  itemKey?: string;
  quantity: number;
  hasExplicitQuantity: boolean;
  item: Record<string, any>;
  rowHash: string;
};

export type WarpCharacterInventoryAuditExport = {
  receipt: WarpCharacterInventoryAuditReceipt;
  exportHash: string;
  publication: WarpCharacterInventoryAuditPublication;
  proofBundle: WarpCharacterInventoryAuditProofBundle;
  inventory: any;
  rows: WarpCharacterInventoryAuditRow[];
};

export type WarpCharacterInventoryAuditSignatureMaterial = {
  algorithm: 'sha256-envelope-v1';
  signerId: string;
  payload: string;
  payloadHash: string;
};

export type WarpCharacterInventoryAuditPublication = {
  publisherId: string;
  publishedAt: string;
  publicationHash: string;
  exportHash: string;
  receiptHash: string;
  signatureMaterial: WarpCharacterInventoryAuditSignatureMaterial;
};

export type WarpCharacterInventoryAuditProofStep = {
  hash: string;
  position: 'left' | 'right';
};

export type WarpCharacterInventoryAuditRowProof = {
  recordPk: number;
  recordId: string;
  rowHash: string;
  leafHash: string;
  proof: WarpCharacterInventoryAuditProofStep[];
};

export type WarpCharacterInventoryAuditProofBundle = {
  algorithm: 'sha256-merkle-v1';
  tableName: 'characterInventoryItems';
  characterId: string;
  receiptHash: string;
  exportHash: string;
  publicationHash: string;
  rowCount: number;
  merkleRoot: string;
  rows: WarpCharacterInventoryAuditRowProof[];
};

export type WarpInventoryRecordFilter = {
  characterId?: unknown;
  recordPk?: unknown;
  recordId?: unknown;
  itemId?: unknown;
  itemKey?: unknown;
};

export type NormalizeWarpInventoryPatchOptions = {
  resolveItemByKey?: (props: { itemKey: string; value: WarpInventoryItemValue }) => Promise<unknown>;
  fallbackToItemKey?: boolean;
  throwOnUnknownItemKey?: boolean;
  defaultX?: number;
  defaultY?: number;
};

const WARP_INVENTORY_INTERNAL_FIELD = '__warp';
const WARP_CHARACTER_INVENTORY_TABLES_FIELD = 'warpTables';
const WARP_CHARACTER_INVENTORY_TABLE_FIELD = 'characterInventoryItems';

const WARP_INVENTORY_TABLE_CONFIG = Object.freeze({
  tableName: 'characterInventoryItems' as const,
  accessName: 'characterInventoryItems' as const,
  primaryKey: 'recordPk' as const,
  externalKey: 'recordId' as const,
  verificationMode: 'audited' as const,
});

type WarpInventoryInternalMeta = {
  recordPk?: number;
  recordId?: string;
  verificationMode?: 'audited';
};

function clampInventoryQuantity(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.floor(numeric));
}

function coerceInventoryCoordinate(value: unknown): number | undefined {
  if (value == null) return undefined;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, Math.floor(numeric));
}

function maybeParseJsonValue<T = any>(value: T): T {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  const looksLikeJson =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'));
  if (!looksLikeJson) return value;

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function normalizeInventoryItemId(itemId: unknown): string | undefined {
  const parsed = maybeParseJsonValue(itemId);

  if (parsed == null) {
    return undefined;
  }

  if (typeof parsed === 'string') {
    return parsed;
  }

  if (typeof parsed === 'object') {
    if (typeof (parsed as any).$oid === 'string') {
      return (parsed as any).$oid;
    }
    if (typeof (parsed as any).valueOf === 'function') {
      const value = (parsed as any).valueOf();
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
        return String(value);
      }
    }
  }

  if (typeof parsed === 'number' || typeof parsed === 'bigint') {
    return String(parsed);
  }

  return undefined;
}

function normalizeInventoryItemValue(item: any) {
  const parsedItem = maybeParseJsonValue(item);
  const nextItem = parsedItem && typeof parsedItem === 'object' ? { ...parsedItem } : {};

  if (nextItem.itemKey != null) {
    nextItem.itemKey = String(nextItem.itemKey);
  }

  const normalizedItemId = normalizeInventoryItemId(nextItem.itemId);
  if (normalizedItemId != null) {
    nextItem.itemId = normalizedItemId;
  }

  const normalizedX = coerceInventoryCoordinate(nextItem.x);
  if (normalizedX != null) {
    nextItem.x = normalizedX;
  }

  const normalizedY = coerceInventoryCoordinate(nextItem.y);
  if (normalizedY != null) {
    nextItem.y = normalizedY;
  }

  if (nextItem.quantity != null || nextItem.qty != null || nextItem.count != null) {
    nextItem.quantity = clampInventoryQuantity(nextItem.quantity ?? nextItem.qty ?? nextItem.count, 1);
  }

  return nextItem;
}

function normalizeWarpInventoryInternalMeta(value: unknown): WarpInventoryInternalMeta | null {
  const parsed = maybeParseJsonValue(value);
  if (!parsed || typeof parsed !== 'object') return null;

  const recordPk = Number((parsed as any).recordPk);
  const recordId =
    typeof (parsed as any).recordId === 'string' && (parsed as any).recordId.trim().length > 0
      ? String((parsed as any).recordId)
      : undefined;

  return {
    ...(Number.isInteger(recordPk) && recordPk > 0 ? { recordPk } : {}),
    ...(recordId ? { recordId } : {}),
    verificationMode: 'audited',
  };
}

function stripWarpInventoryInternalItem(item: any) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const nextItem = { ...item };
  delete (nextItem as any)[WARP_INVENTORY_INTERNAL_FIELD];
  return nextItem;
}

function normalizeResolvedInventoryItemId(resolved: unknown): string | undefined {
  if (resolved == null) return undefined;
  if (typeof resolved === 'object') {
    const resolvedItem = resolved as any;
    return normalizeInventoryItemId(resolvedItem._id ?? resolvedItem.id ?? resolvedItem.itemId ?? resolvedItem);
  }
  return normalizeInventoryItemId(resolved);
}

function normalizeInventorySyncQuantity(value: unknown): number {
  return clampInventoryQuantity(value, 1);
}

function pushInventorySyncQuantity(target: Record<string, number>, key: string, quantity: number) {
  target[key] = (target[key] ?? 0) + quantity;
}

function buildNormalizedInventoryPushValue(
  value: WarpInventoryItemValue,
  itemIdentity: { itemId?: string; itemKey?: string },
  defaults: Pick<NormalizeWarpInventoryPatchOptions, 'defaultX' | 'defaultY'>
) {
  const normalizedX = coerceInventoryCoordinate(value.x ?? defaults.defaultX);
  const normalizedY = coerceInventoryCoordinate(value.y ?? defaults.defaultY);

  return {
    ...(itemIdentity.itemId ? { itemId: itemIdentity.itemId } : {}),
    ...(itemIdentity.itemKey ? { itemKey: itemIdentity.itemKey } : {}),
    ...(normalizedX != null ? { x: normalizedX } : {}),
    ...(normalizedY != null ? { y: normalizedY } : {}),
    ...(value.meta != null ? { meta: value.meta } : {}),
  };
}

async function resolveNormalizedInventoryItemIdentity(
  value: WarpInventoryItemValue,
  options: NormalizeWarpInventoryPatchOptions
): Promise<{ itemId?: string; itemKey?: string }> {
  if (value.itemId) {
    const normalizedItemId = normalizeInventoryItemId(value.itemId);
    if (normalizedItemId) {
      return { itemId: normalizedItemId };
    }
  }

  if (value.itemKey) {
    const itemKey = String(value.itemKey);
    const resolved = options.resolveItemByKey ? await options.resolveItemByKey({ itemKey, value }) : null;
    const normalizedItemId = normalizeResolvedInventoryItemId(resolved);

    if (normalizedItemId) {
      return { itemId: normalizedItemId };
    }

    if (options.throwOnUnknownItemKey) {
      throw new Error(`Unknown itemKey in inventory patch: ${itemKey}`);
    }

    if (options.fallbackToItemKey !== false) {
      return { itemKey };
    }
  }

  return {};
}

export function isWarpInventoryItemsKey(key: unknown): boolean {
  if (key == null) return false;

  const normalizedKey = String(key);
  return normalizedKey === 'inventory.0.items' || /^inventory\.\d+\.items(?:\.|$)/.test(normalizedKey);
}

function canApplyInventoryPushAtKey(key: unknown): boolean {
  if (key == null) return true;
  return isWarpInventoryItemsKey(key);
}

export async function normalizeWarpInventoryPatch(
  patch: ReadonlyArray<PatchOp | Record<string, any>> | undefined,
  options: NormalizeWarpInventoryPatchOptions = {}
): Promise<PatchOp[]> {
  const out: PatchOp[] = [];

  for (const rawPatchOp of Array.isArray(patch) ? patch : []) {
    const patchOp = maybeParseJsonValue(rawPatchOp as any);
    if (!patchOp || typeof patchOp !== 'object') continue;

    if (
      ((patchOp as any).op === 'add' || (patchOp as any).op === 'remove' || (patchOp as any).op === 'move') &&
      ((patchOp as any).itemId != null || (patchOp as any).itemKey != null)
    ) {
      const directValue = normalizeInventoryItemValue(patchOp as any);
      const itemIdentity = await resolveNormalizedInventoryItemIdentity(directValue, options);

      out.push({
        op: (patchOp as any).op,
        ...(itemIdentity.itemId ? { itemId: itemIdentity.itemId } : {}),
        ...(itemIdentity.itemKey ? { itemKey: itemIdentity.itemKey } : {}),
        ...((patchOp as any).op !== 'move'
          ? { quantity: normalizeInventorySyncQuantity((patchOp as any).quantity ?? (patchOp as any).qty ?? 1) }
          : {}),
        ...(directValue.x != null ? { x: directValue.x } : {}),
        ...(directValue.y != null ? { y: directValue.y } : {}),
      } as PatchOp);
      continue;
    }

    if (patchOp.op !== 'push' || !isWarpInventoryItemsKey((patchOp as any).key)) {
      out.push(patchOp as PatchOp);
      continue;
    }

    const nextValue = normalizeInventoryItemValue((patchOp as any).value);
    const quantity = normalizeInventorySyncQuantity(nextValue.quantity ?? nextValue.qty ?? 1);
    const itemIdentity = await resolveNormalizedInventoryItemIdentity(nextValue, options);
    if (!itemIdentity.itemId && !itemIdentity.itemKey) {
      out.push(patchOp as PatchOp);
      continue;
    }

    const normalizedPushValue = buildNormalizedInventoryPushValue(
      nextValue,
      itemIdentity,
      { defaultX: options.defaultX, defaultY: options.defaultY }
    );

    for (let index = 0; index < quantity; index += 1) {
      out.push({
        op: 'push',
        key: String((patchOp as any).key),
        value: normalizedPushValue,
      });
    }
    continue;

  }

  return out;
}

export async function normalizeWarpInventorySyncOps(
  ops: ReadonlyArray<WarpInventorySyncOp | Record<string, any>> | undefined,
  options: NormalizeWarpInventoryPatchOptions = {}
): Promise<WarpInventorySyncOp[]> {
  return (await normalizeWarpInventoryPatch(
    ops as ReadonlyArray<PatchOp | Record<string, any>> | undefined,
    options
  )) as WarpInventorySyncOp[];
}

export function inventorySyncOpsFromWarpPatchOps(
  patchOps: ReadonlyArray<Record<string, any>> | undefined
): Array<Extract<WarpInventorySyncOp, { op: 'add' | 'remove' }>> {
  const addsByKey: Record<string, number> = {};
  const addsById: Record<string, number> = {};
  const removalsByKey: Record<string, number> = {};
  const removalsById: Record<string, number> = {};

  for (const rawPatchOp of Array.isArray(patchOps) ? patchOps : []) {
    const patchOp = maybeParseJsonValue(rawPatchOp);
    if (!patchOp || typeof patchOp !== 'object') continue;

    const opType = String((patchOp as any).op || '');
    const value = normalizeInventoryItemValue((patchOp as any).value);
    const directItemKey = (patchOp as any).itemKey ? String((patchOp as any).itemKey) : undefined;
    const directItemId = normalizeInventoryItemId((patchOp as any).itemId);
    const quantity = normalizeInventorySyncQuantity(
      (patchOp as any).quantity ?? (patchOp as any).qty ?? value.quantity ?? value.qty ?? 1
    );

    if (opType === 'add' || opType === 'remove') {
      if (directItemKey) {
        pushInventorySyncQuantity(opType === 'add' ? addsByKey : removalsByKey, directItemKey, quantity);
      } else if (directItemId) {
        pushInventorySyncQuantity(opType === 'add' ? addsById : removalsById, directItemId, quantity);
      }
      continue;
    }

    if (!isWarpInventoryItemsKey((patchOp as any).key)) continue;

    if (opType === 'push') {
      if (value.itemKey) {
        pushInventorySyncQuantity(addsByKey, String(value.itemKey), quantity);
      } else if (value.itemId) {
        pushInventorySyncQuantity(addsById, String(value.itemId), quantity);
      }
      continue;
    }

    if (opType === 'pull') {
      if (value.itemKey) {
        pushInventorySyncQuantity(removalsByKey, String(value.itemKey), quantity);
      } else if (value.itemId) {
        pushInventorySyncQuantity(removalsById, String(value.itemId), quantity);
      }
    }
  }

  const out: Array<Extract<WarpInventorySyncOp, { op: 'add' | 'remove' }>> = [];
  for (const itemKey of Object.keys(addsByKey)) out.push({ op: 'add', itemKey, quantity: addsByKey[itemKey] });
  for (const itemId of Object.keys(addsById)) out.push({ op: 'add', itemId, quantity: addsById[itemId] });
  for (const itemKey of Object.keys(removalsByKey)) out.push({ op: 'remove', itemKey, quantity: removalsByKey[itemKey] });
  for (const itemId of Object.keys(removalsById)) out.push({ op: 'remove', itemId, quantity: removalsById[itemId] });
  return out;
}

export function inventorySyncHitsFromEntityPatches(patches: EntityPatch[] | undefined): WarpInventoryEntitySyncHit[] {
  const out: WarpInventoryEntitySyncHit[] = [];

  for (const entityPatch of patches || []) {
    if (entityPatch?.entityType !== 'character.inventory') continue;

    const characterId = String(entityPatch?.entityId || '');
    if (!characterId) continue;

    const ops = inventorySyncOpsFromWarpPatchOps(entityPatch?.ops as Array<Record<string, any>>);
    if (!ops.length) continue;

    out.push({ characterId, ops });
  }

  return out;
}

export function inventorySyncOpsFromEntityPatches(
  patches: EntityPatch[] | undefined
): Array<Extract<WarpInventorySyncOp, { op: 'add' | 'remove' }>> {
  return inventorySyncHitsFromEntityPatches(patches).flatMap((hit) => hit.ops);
}

function normalizeWarpInventoryForStorage(inventory: any) {
  const parsedInventory = maybeParseJsonValue(inventory);
  const normalizedInventory = Array.isArray(parsedInventory)
    ? parsedInventory.map((entry: any) => {
        const parsedEntry = maybeParseJsonValue(entry);
        const parsedItems = maybeParseJsonValue(parsedEntry?.items);

        return {
          ...(parsedEntry && typeof parsedEntry === 'object' ? parsedEntry : {}),
          items: Array.isArray(parsedItems) ? parsedItems.map((item: any) => normalizeInventoryItemValue(item)) : [],
        };
      })
    : [];

  if (!normalizedInventory[0]) {
    normalizedInventory[0] = { items: [] };
  }

  if (!Array.isArray(normalizedInventory[0].items)) {
    normalizedInventory[0].items = [];
  }

  return normalizedInventory;
}

export function ensureWarpCharacterInventory(inventory: any) {
  const normalizedInventory = normalizeWarpInventoryForStorage(inventory);
  return normalizedInventory.map((entry: any) => ({
    ...cloneWarpInventoryBag(entry),
    items: Array.isArray(entry?.items) ? entry.items.map((item: any) => stripWarpInventoryInternalItem(item)) : [],
  }));
}

export function ensureWarpCharacterInventoryForCharacter(character: any) {
  return serializeWarpCharacterInventoryTable(materializeWarpCharacterInventoryTableFromCharacter(character), {
    publicView: true,
  });
}

export function isCharacterOwnedByProfile(character: any, profileId: unknown): boolean {
  if (!character || profileId == null) return false;

  const normalizedProfileId = String(profileId);
  const ownerId =
    character?.ownerId != null
      ? String(character.ownerId)
      : character?.profileId != null
        ? String(character.profileId)
        : character?.profile?.id != null
          ? String(character.profile.id)
          : null;

  return ownerId === normalizedProfileId;
}

function cloneWarpInventoryBag(entry: any) {
  const parsedEntry = maybeParseJsonValue(entry);
  return {
    ...(parsedEntry && typeof parsedEntry === 'object' ? parsedEntry : {}),
    items: [],
  };
}

function buildWarpInventoryRecordId(
  characterId: string,
  recordPk: number
): string {
  return [characterId || 'characterInventory', String(recordPk)].join(':');
}

export function parseWarpInventoryRecordId(recordId: unknown): { characterId: string; recordPk: number } | null {
  if (typeof recordId !== 'string' || recordId.trim().length === 0) {
    return null;
  }

  const normalizedRecordId = recordId.trim();
  const separatorIndex = normalizedRecordId.lastIndexOf(':');
  if (separatorIndex <= 0 || separatorIndex >= normalizedRecordId.length - 1) {
    return null;
  }

  const characterId = normalizedRecordId.slice(0, separatorIndex).trim();
  const recordPk = Number(normalizedRecordId.slice(separatorIndex + 1));
  if (!characterId || !Number.isInteger(recordPk) || recordPk <= 0) {
    return null;
  }

  return { characterId, recordPk };
}

function cloneWarpInventoryRecord(record: WarpProjectedInventoryRecord): WarpProjectedInventoryRecord {
  return {
    ...record,
    item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(record.item)),
  };
}

function normalizeWarpPersistedInventoryTable(
  value: unknown,
  options: { characterId?: unknown } = {}
): WarpMaterializedInventoryTable | null {
  const parsed = maybeParseJsonValue(value);
  if (!parsed || typeof parsed !== 'object') return null;

  const persisted = parsed as Partial<WarpPersistedInventoryTable>;
  const rows = Array.isArray(persisted.rows) ? persisted.rows : [];
  const bags = Array.isArray(persisted.bags) ? persisted.bags : [];
  const nextRecordPk = Number(persisted.nextRecordPk);
  const characterId =
    options.characterId != null && String(options.characterId).length > 0
      ? String(options.characterId)
      : typeof persisted.characterId === 'string'
        ? persisted.characterId
        : '';

  if (!rows.length && !bags.length && !Number.isInteger(nextRecordPk)) {
    return null;
  }

  const normalizedRows: WarpProjectedInventoryRecord[] = rows
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const row = entry as Partial<WarpProjectedInventoryRecord>;
      const recordPk = Number(row.recordPk);
      const item = normalizeInventoryItemValue(stripWarpInventoryInternalItem(row.item));

      return {
        recordId:
          typeof row.recordId === 'string' && row.recordId.trim().length > 0
            ? row.recordId
            : buildWarpInventoryRecordId(characterId, recordPk),
        recordPk: Number.isInteger(recordPk) && recordPk > 0 ? recordPk : 0,
        characterId,
        bagIndex: Math.max(0, Math.floor(Number(row.bagIndex ?? 0))),
        slotIndex: Math.max(0, Math.floor(Number(row.slotIndex ?? 0))),
        ...(row.itemId != null ? { itemId: String(row.itemId) } : {}),
        ...(row.itemKey != null ? { itemKey: String(row.itemKey) } : {}),
        quantity: clampInventoryQuantity(row.quantity, 1),
        hasExplicitQuantity:
          typeof row.hasExplicitQuantity === 'boolean'
            ? row.hasExplicitQuantity
            : item.quantity != null || clampInventoryQuantity(row.quantity, 1) !== 1,
        item,
      };
    })
    .filter((row) => row.recordPk > 0);

  if (!normalizedRows.length && !bags.length) {
    return null;
  }

  let normalizedNextRecordPk = Number.isInteger(nextRecordPk) && nextRecordPk > 0 ? nextRecordPk : 1;
  for (const row of normalizedRows) {
    if (row.recordPk >= normalizedNextRecordPk) {
      normalizedNextRecordPk = row.recordPk + 1;
    }
  }

  return {
    ...WARP_INVENTORY_TABLE_CONFIG,
    characterId,
    rows: normalizeWarpInventoryRowsLayout(normalizedRows),
    bags: bags.map((entry) => cloneWarpInventoryBag(entry)),
    nextRecordPk: normalizedNextRecordPk,
  };
}

function readWarpCharacterInventoryTableMirror(character: any): WarpPersistedInventoryTable | null {
  const data = maybeParseJsonValue(character?.data);
  if (!data || typeof data !== 'object') return null;

  const warpTables = (data as any)[WARP_CHARACTER_INVENTORY_TABLES_FIELD];
  if (!warpTables || typeof warpTables !== 'object') return null;

  const normalized = normalizeWarpPersistedInventoryTable((warpTables as any)[WARP_CHARACTER_INVENTORY_TABLE_FIELD], {
    characterId: character?.id ?? character?._id,
  });

  if (!normalized) {
    return null;
  }

  return {
    version: 1,
    ...normalized,
    audit: buildWarpCharacterInventoryAuditReceipt(normalized),
  };
}

function compactWarpInventoryDocument<T extends Record<string, any>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

function normalizeWarpInventoryRowsLayout(rows: WarpProjectedInventoryRecord[]): WarpProjectedInventoryRecord[] {
  const sortedRows = rows
    .map((row) => ({ ...row, item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(row.item)) }))
    .sort((left, right) => {
      return left.bagIndex - right.bagIndex || left.slotIndex - right.slotIndex || left.recordPk - right.recordPk;
    });

  const slotIndexesByBag = new Map<number, number>();
  return sortedRows.map((row) => {
    const nextSlotIndex = slotIndexesByBag.get(row.bagIndex) ?? 0;
    slotIndexesByBag.set(row.bagIndex, nextSlotIndex + 1);
    return {
      ...row,
      slotIndex: nextSlotIndex,
    };
  });
}

function normalizeWarpInventoryRecordFilter(filter: WarpInventoryRecordFilter = {}) {
  const recordPk = Number(filter.recordPk);
  const parsedRecordId =
    typeof filter.recordId === 'string' && filter.recordId.trim().length > 0
      ? filter.recordId.trim()
      : undefined;
  const parsedInventoryRecordId = parsedRecordId ? parseWarpInventoryRecordId(parsedRecordId) : null;
  const characterId =
    filter.characterId != null && String(filter.characterId).trim().length > 0
      ? String(filter.characterId).trim()
      : parsedInventoryRecordId?.characterId;
  const itemId = normalizeInventoryItemId(filter.itemId);
  const itemKey =
    filter.itemKey != null && String(filter.itemKey).trim().length > 0
      ? String(filter.itemKey).trim()
      : undefined;

  return {
    ...(characterId ? { characterId } : {}),
    ...(Number.isInteger(recordPk) && recordPk > 0 ? { recordPk } : {}),
    ...(parsedRecordId ? { recordId: parsedRecordId } : {}),
    ...(itemId ? { itemId } : {}),
    ...(itemKey ? { itemKey } : {}),
  };
}

export function filterWarpInventoryTableRows(
  table: WarpMaterializedInventoryTable,
  filter: WarpInventoryRecordFilter = {}
): WarpProjectedInventoryRecord[] {
  const normalizedFilter = normalizeWarpInventoryRecordFilter(filter);

  return table.rows
    .filter((row) => {
      if (normalizedFilter.characterId && row.characterId !== normalizedFilter.characterId) return false;
      if (normalizedFilter.recordPk && row.recordPk !== normalizedFilter.recordPk) return false;
      if (normalizedFilter.recordId && row.recordId !== normalizedFilter.recordId) return false;
      if (normalizedFilter.itemId && row.itemId !== normalizedFilter.itemId) return false;
      if (normalizedFilter.itemKey && row.itemKey !== normalizedFilter.itemKey) return false;
      return true;
    })
    .map((row) => cloneWarpInventoryRecord(row));
}

export function findWarpInventoryTableRow(
  table: WarpMaterializedInventoryTable,
  filter: WarpInventoryRecordFilter = {}
): WarpProjectedInventoryRecord | null {
  return filterWarpInventoryTableRows(table, filter)[0] ?? null;
}

export function materializeWarpInventoryTable(
  inventory: any,
  options: { characterId?: unknown } = {}
): WarpMaterializedInventoryTable {
  const normalizedCharacterId = options.characterId == null ? '' : String(options.characterId);
  const normalizedInventory = normalizeWarpInventoryForStorage(inventory);
  const bags = normalizedInventory.map((entry: any) => cloneWarpInventoryBag(entry));
  const rows: WarpProjectedInventoryRecord[] = [];

  let nextRecordPk = 1;
  for (const bag of normalizedInventory) {
    const items = Array.isArray(bag?.items) ? bag.items : [];
    for (const item of items) {
      const internal = normalizeWarpInventoryInternalMeta((item as any)?.[WARP_INVENTORY_INTERNAL_FIELD]);
      if (internal?.recordPk && internal.recordPk >= nextRecordPk) {
        nextRecordPk = internal.recordPk + 1;
      }
    }
  }

  for (let bagIndex = 0; bagIndex < normalizedInventory.length; bagIndex += 1) {
    const bag = normalizedInventory[bagIndex];
    const items = Array.isArray(bag?.items) ? bag.items : [];

    for (let slotIndex = 0; slotIndex < items.length; slotIndex += 1) {
      const item = normalizeInventoryItemValue(items[slotIndex]);
      const internal = normalizeWarpInventoryInternalMeta((item as any)?.[WARP_INVENTORY_INTERNAL_FIELD]);
      const recordPk = internal?.recordPk && internal.recordPk > 0 ? internal.recordPk : nextRecordPk++;
      const quantity = clampInventoryQuantity(item.quantity ?? item.qty ?? item.count, 1);
      const hasExplicitQuantity = item.quantity != null || item.qty != null || item.count != null;

      rows.push({
        recordId: internal?.recordId ?? buildWarpInventoryRecordId(normalizedCharacterId, recordPk),
        recordPk,
        characterId: normalizedCharacterId,
        bagIndex,
        slotIndex,
        ...(item.itemId ? { itemId: String(item.itemId) } : {}),
        ...(item.itemKey ? { itemKey: String(item.itemKey) } : {}),
        quantity,
        hasExplicitQuantity,
        item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(item)),
      });
    }
  }

  return {
    ...WARP_INVENTORY_TABLE_CONFIG,
    characterId: normalizedCharacterId,
    rows: normalizeWarpInventoryRowsLayout(rows),
    bags,
    nextRecordPk,
  };
}

export function materializeWarpCharacterInventoryTable(characterId: unknown, inventory: any): WarpMaterializedInventoryTable {
  return materializeWarpInventoryTable(inventory, { characterId });
}

export function materializeWarpCharacterInventoryTableFromCharacter(character: any): WarpMaterializedInventoryTable {
  const mirroredTable = readWarpCharacterInventoryTableMirror(character);
  if (mirroredTable) {
    return {
      ...mirroredTable,
      rows: mirroredTable.rows.map((row) => cloneWarpInventoryRecord(row)),
      bags: mirroredTable.bags.map((entry: any) => cloneWarpInventoryBag(entry)),
    };
  }

  return materializeWarpCharacterInventoryTable(character?.id ?? character?._id, character?.inventory);
}

export function projectWarpCharacterInventoryRecords(characterId: unknown, inventory: any): WarpProjectedInventoryRecord[] {
  return materializeWarpCharacterInventoryTable(characterId, inventory).rows;
}

export function serializeWarpInventoryTable(
  table: WarpMaterializedInventoryTable,
  options: {
    publicView?: boolean;
  } = {}
) {
  const normalizedInventory = table.bags.map((entry: any) => cloneWarpInventoryBag(entry));
  if (!normalizedInventory[0]) {
    normalizedInventory[0] = { items: [] };
  }

  for (const record of normalizeWarpInventoryRowsLayout(table.rows)) {
    if (!normalizedInventory[record.bagIndex]) {
      normalizedInventory[record.bagIndex] = { items: [] };
    }

    const nextBag = normalizedInventory[record.bagIndex];
    if (!Array.isArray(nextBag.items)) {
      nextBag.items = [];
    }

    const nextItem = normalizeInventoryItemValue(stripWarpInventoryInternalItem(record.item));
    if (record.hasExplicitQuantity || nextItem.quantity != null || record.quantity !== 1) {
      nextItem.quantity = record.quantity;
    } else {
      delete (nextItem as any).quantity;
      delete (nextItem as any).qty;
      delete (nextItem as any).count;
    }

    if (!options.publicView) {
      (nextItem as any)[WARP_INVENTORY_INTERNAL_FIELD] = {
        recordPk: record.recordPk,
        recordId: record.recordId,
        verificationMode: 'audited',
      };
    }

    nextBag.items.push(nextItem);
  }

  return options.publicView ? ensureWarpCharacterInventory(normalizedInventory) : normalizedInventory;
}

export function serializeWarpCharacterInventoryTable(
  table: WarpMaterializedInventoryTable,
  options: {
    publicView?: boolean;
  } = {}
) {
  return serializeWarpInventoryTable(table, options);
}

export function materializeWarpCharacterInventoryTableFromRows(
  characterId: unknown,
  rows: ReadonlyArray<Partial<WarpProjectedInventoryRecord>> | undefined
): WarpMaterializedInventoryTable {
  const normalizedCharacterId = characterId == null ? '' : String(characterId);
  const normalizedRows: WarpProjectedInventoryRecord[] = (Array.isArray(rows) ? rows : [])
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const item = normalizeInventoryItemValue(stripWarpInventoryInternalItem((entry as any).item));
      const rawRecordPk = Number((entry as any).recordPk);
      const parsedRecordId =
        typeof (entry as any).recordId === 'string' && (entry as any).recordId.trim().length > 0
          ? String((entry as any).recordId)
          : buildWarpInventoryRecordId(normalizedCharacterId, rawRecordPk);

      return {
        recordId: parsedRecordId,
        recordPk: Number.isInteger(rawRecordPk) && rawRecordPk > 0 ? rawRecordPk : 0,
        characterId:
          (entry as any).characterId != null && String((entry as any).characterId).trim().length > 0
            ? String((entry as any).characterId)
            : normalizedCharacterId,
        bagIndex: Math.max(0, Math.floor(Number((entry as any).bagIndex ?? 0))),
        slotIndex: Math.max(0, Math.floor(Number((entry as any).slotIndex ?? 0))),
        ...(normalizeInventoryItemId((entry as any).itemId) ? { itemId: normalizeInventoryItemId((entry as any).itemId) } : {}),
        ...((entry as any).itemKey != null ? { itemKey: String((entry as any).itemKey) } : {}),
        quantity: clampInventoryQuantity((entry as any).quantity ?? item.quantity ?? item.qty ?? item.count, 1),
        hasExplicitQuantity:
          typeof (entry as any).hasExplicitQuantity === 'boolean'
            ? (entry as any).hasExplicitQuantity
            : item.quantity != null || item.qty != null || item.count != null,
        item,
      };
    })
    .filter((row) => row.recordPk > 0);

  let nextRecordPk = 1;
  for (const row of normalizedRows) {
    if (row.recordPk >= nextRecordPk) {
      nextRecordPk = row.recordPk + 1;
    }
  }

  return {
    ...WARP_INVENTORY_TABLE_CONFIG,
    characterId: normalizedCharacterId,
    rows: normalizeWarpInventoryRowsLayout(normalizedRows),
    bags: [],
    nextRecordPk,
  };
}

export function buildWarpCharacterInventoryPublicView(
  characterId: unknown,
  rows: ReadonlyArray<Partial<WarpProjectedInventoryRecord>> | undefined
) {
  return serializeWarpCharacterInventoryTable(materializeWarpCharacterInventoryTableFromRows(characterId, rows), {
    publicView: true,
  });
}

export function mirrorWarpCharacterInventoryTable(table: WarpMaterializedInventoryTable): WarpPersistedInventoryTable {
  const audit = buildWarpCharacterInventoryAuditReceipt(table);
  return {
    version: 1,
    audit,
    ...WARP_INVENTORY_TABLE_CONFIG,
    characterId: table.characterId,
    rows: normalizeWarpInventoryRowsLayout(table.rows).map((row) => cloneWarpInventoryRecord(row)),
    bags: table.bags.map((entry) => cloneWarpInventoryBag(entry)),
    nextRecordPk: table.nextRecordPk,
  };
}

export function buildWarpCharacterInventoryAuditReceipt(
  table: WarpMaterializedInventoryTable
): WarpCharacterInventoryAuditReceipt {
  const canonicalRows = normalizeWarpInventoryRowsLayout(table.rows).map((row) => ({
    recordPk: row.recordPk,
    recordId: row.recordId,
    characterId: row.characterId,
    bagIndex: row.bagIndex,
    slotIndex: row.slotIndex,
    itemId: row.itemId ?? null,
    itemKey: row.itemKey ?? null,
    quantity: row.quantity,
    hasExplicitQuantity: row.hasExplicitQuantity,
    item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(row.item)),
  }));

  const receiptHash = createHash('sha256')
    .update(
      JSON.stringify({
        tableName: WARP_INVENTORY_TABLE_CONFIG.tableName,
        characterId: table.characterId,
        nextRecordPk: table.nextRecordPk,
        rows: canonicalRows,
      })
    )
    .digest('hex');
  const rows = buildWarpCharacterInventoryAuditRows(table);
  const exportHash = buildWarpCharacterInventoryAuditExportHashFromRows({
    characterId: table.characterId,
    receiptHash,
    rows,
  });

  return {
    version: 1,
    verificationMode: 'audited',
    tableName: WARP_INVENTORY_TABLE_CONFIG.tableName,
    characterId: table.characterId,
    rowCount: canonicalRows.length,
    nextRecordPk: table.nextRecordPk,
    receiptHash,
    exportHash,
    updatedDate: new Date().toISOString(),
  };
}

export function buildWarpCharacterInventoryAuditRows(
  table: WarpMaterializedInventoryTable
): WarpCharacterInventoryAuditRow[] {
  return normalizeWarpInventoryRowsLayout(table.rows).map((row) => {
    const normalizedItem = normalizeInventoryItemValue(stripWarpInventoryInternalItem(row.item));
    const rowHash = createHash('sha256')
      .update(
        JSON.stringify({
          tableName: WARP_INVENTORY_TABLE_CONFIG.tableName,
          characterId: table.characterId,
          recordPk: row.recordPk,
          recordId: row.recordId,
          bagIndex: row.bagIndex,
          slotIndex: row.slotIndex,
          itemId: row.itemId ?? null,
          itemKey: row.itemKey ?? null,
          quantity: row.quantity,
          hasExplicitQuantity: row.hasExplicitQuantity,
          item: normalizedItem,
        })
      )
      .digest('hex');

    return {
      recordPk: row.recordPk,
      recordId: row.recordId,
      characterId: row.characterId,
      bagIndex: row.bagIndex,
      slotIndex: row.slotIndex,
      ...(row.itemId ? { itemId: row.itemId } : {}),
      ...(row.itemKey ? { itemKey: row.itemKey } : {}),
      quantity: row.quantity,
      hasExplicitQuantity: row.hasExplicitQuantity,
      item: normalizedItem,
      rowHash,
    };
  });
}

function buildWarpCharacterInventoryAuditExportHashFromRows(args: {
  characterId: string;
  receiptHash: string;
  rows: ReadonlyArray<Pick<WarpCharacterInventoryAuditRow, 'recordPk' | 'recordId' | 'rowHash'>>;
}): string {
  return createHash('sha256')
    .update(
      JSON.stringify({
        tableName: WARP_INVENTORY_TABLE_CONFIG.tableName,
        characterId: args.characterId,
        receiptHash: args.receiptHash,
        rowCount: args.rows.length,
        rows: args.rows.map((row) => ({
          recordPk: row.recordPk,
          recordId: row.recordId,
          rowHash: row.rowHash,
        })),
      })
    )
    .digest('hex');
}

function resolveWarpCharacterInventoryAuditPublisherId(): string {
  const publisherId = process.env.SEER_NODE_WALLET ?? 'seer-node-1';
  return String(publisherId || 'seer-node-1');
}

export function buildWarpCharacterInventoryAuditPublication(args: {
  receipt: Pick<WarpCharacterInventoryAuditReceipt, 'characterId' | 'receiptHash' | 'exportHash'>;
  publishedAt?: string;
  publisherId?: string;
}): WarpCharacterInventoryAuditPublication {
  const publisherId = String(args.publisherId ?? resolveWarpCharacterInventoryAuditPublisherId());
  const publishedAt = String(args.publishedAt ?? new Date().toISOString());
  const exportHash = String(args.receipt.exportHash);
  const receiptHash = String(args.receipt.receiptHash);
  const publicationHash = createHash('sha256')
    .update(
      JSON.stringify({
        tableName: WARP_INVENTORY_TABLE_CONFIG.tableName,
        characterId: String(args.receipt.characterId),
        publisherId,
        publishedAt,
        exportHash,
        receiptHash,
      })
    )
    .digest('hex');

  return {
    publisherId,
    publishedAt,
    publicationHash,
    exportHash,
    receiptHash,
  };
}

export function buildWarpCharacterInventoryAuditExportHash(
  table: WarpMaterializedInventoryTable,
  receipt?: Pick<WarpCharacterInventoryAuditReceipt, 'receiptHash'> | null
): string {
  const rows = buildWarpCharacterInventoryAuditRows(table);
  const receiptHash = receipt?.receiptHash ?? buildWarpCharacterInventoryAuditReceipt(table).receiptHash;

  return buildWarpCharacterInventoryAuditExportHashFromRows({
    characterId: table.characterId,
    receiptHash,
    rows,
  });
}

export function buildWarpCharacterInventoryAuditExport(
  table: WarpMaterializedInventoryTable,
  receipt?: unknown
): WarpCharacterInventoryAuditExport {
  const rows = buildWarpCharacterInventoryAuditRows(table);
  const currentReceipt: WarpCharacterInventoryAuditReceipt = isWarpCharacterInventoryAuditReceiptCurrent(
    receipt,
    table
  )
    ? {
        version: 1,
        verificationMode: 'audited',
        tableName: 'characterInventoryItems',
        characterId: String((receipt as WarpCharacterInventoryAuditReceipt).characterId),
        rowCount: Number((receipt as WarpCharacterInventoryAuditReceipt).rowCount),
        nextRecordPk: Number((receipt as WarpCharacterInventoryAuditReceipt).nextRecordPk),
        receiptHash: String((receipt as WarpCharacterInventoryAuditReceipt).receiptHash),
        exportHash: String((receipt as WarpCharacterInventoryAuditReceipt).exportHash),
        updatedDate: String((receipt as WarpCharacterInventoryAuditReceipt).updatedDate),
      }
    : buildWarpCharacterInventoryAuditReceipt(table);

  return {
    receipt: currentReceipt,
    exportHash: currentReceipt.exportHash,
    publication: buildWarpCharacterInventoryAuditPublication({ receipt: currentReceipt }),
    inventory: serializeWarpCharacterInventoryTable(table, { publicView: true }),
    rows,
  };
}

export function isWarpCharacterInventoryAuditReceiptCurrent(
  receipt: unknown,
  table: WarpMaterializedInventoryTable
): boolean {
  if (!receipt || typeof receipt !== 'object') {
    return false;
  }

  const expected = buildWarpCharacterInventoryAuditReceipt(table);
  const candidate = receipt as Partial<WarpCharacterInventoryAuditReceipt>;

  return (
    candidate.version === expected.version &&
    candidate.verificationMode === expected.verificationMode &&
    candidate.tableName === expected.tableName &&
    String(candidate.characterId ?? '') === expected.characterId &&
    Number(candidate.rowCount ?? -1) === expected.rowCount &&
    Number(candidate.nextRecordPk ?? -1) === expected.nextRecordPk &&
    String(candidate.receiptHash ?? '') === expected.receiptHash &&
    String((candidate as Record<string, unknown>).exportHash ?? '') ===
      buildWarpCharacterInventoryAuditExportHash(table, expected)
  );
}

export function buildWarpCharacterInventoryItemDocuments(
  character: any,
  table: WarpMaterializedInventoryTable
): WarpCharacterInventoryItemDocument[] {
  const audit = buildWarpCharacterInventoryAuditReceipt(table);
  return normalizeWarpInventoryRowsLayout(table.rows).map((row) =>
    compactWarpInventoryDocument({
      characterId: table.characterId,
      recordPk: row.recordPk,
      recordId: row.recordId,
      bagIndex: row.bagIndex,
      slotIndex: row.slotIndex,
      itemId: row.itemId,
      itemKey: row.itemKey,
      quantity: row.quantity,
      hasExplicitQuantity: row.hasExplicitQuantity,
      item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(row.item)),
      applicationId: character?.applicationId,
      ownerId: character?.ownerId,
      audit,
    })
  );
}

export function buildWarpCharacterInventoryReceiptDocument(
  character: any,
  table: WarpMaterializedInventoryTable
): WarpCharacterInventoryReceiptDocument {
  const audit = buildWarpCharacterInventoryAuditReceipt(table);
  const exportHash = buildWarpCharacterInventoryAuditExportHash(table, audit);

  return compactWarpInventoryDocument({
    ...audit,
    exportHash,
    applicationId: character?.applicationId,
    ownerId: character?.ownerId,
  });
}

export async function syncWarpCharacterInventoryItemModel(
  model: { bulkWrite?: (operations: any[], options?: any) => Promise<any> } | null | undefined,
  character: any,
  table: WarpMaterializedInventoryTable
) {
  if (!model || typeof model.bulkWrite !== 'function') {
    return;
  }

  const documents = buildWarpCharacterInventoryItemDocuments(character, table);
  const retainedRecordPks = documents
    .map((document) => Number(document.recordPk))
    .filter((recordPk) => Number.isInteger(recordPk) && recordPk > 0);

  const operations = [
    ...documents.map((document) => ({
      replaceOne: {
        filter: {
          characterId: table.characterId,
          recordPk: document.recordPk,
        },
        replacement: document,
        upsert: true,
      },
    })),
    {
      deleteMany: {
        filter: retainedRecordPks.length
          ? {
              characterId: table.characterId,
              recordPk: {
                $nin: retainedRecordPks,
              },
            }
          : {
              characterId: table.characterId,
            },
      },
    },
  ];

  await model.bulkWrite(operations, { ordered: true });
}

export async function syncWarpCharacterInventoryReceiptModel(
  model:
    | {
        replaceOne?: (
          filter: Record<string, unknown>,
          replacement: Record<string, unknown>,
          options?: Record<string, unknown>
        ) => Promise<any>;
        bulkWrite?: (operations: any[], options?: any) => Promise<any>;
      }
    | null
    | undefined,
  character: any,
  table: WarpMaterializedInventoryTable
) {
  if (!model) {
    return;
  }

  const receipt = buildWarpCharacterInventoryReceiptDocument(character, table);
  const filter = { characterId: table.characterId };

  if (typeof model.replaceOne === 'function') {
    await model.replaceOne(filter, receipt, { upsert: true });
    return;
  }

  if (typeof model.bulkWrite === 'function') {
    await model.bulkWrite(
      [
        {
          replaceOne: {
            filter,
            replacement: receipt,
            upsert: true,
          },
        },
      ],
      { ordered: true }
    );
  }
}

export async function syncWarpCharacterInventoryAuthority(
  models: {
    itemModel?: { bulkWrite?: (operations: any[], options?: any) => Promise<any> } | null;
    receiptModel?:
      | {
          replaceOne?: (
            filter: Record<string, unknown>,
            replacement: Record<string, unknown>,
            options?: Record<string, unknown>
          ) => Promise<any>;
          bulkWrite?: (operations: any[], options?: any) => Promise<any>;
        }
      | null;
  },
  character: any,
  table: WarpMaterializedInventoryTable
) {
  await syncWarpCharacterInventoryItemModel(models.itemModel, character, table);
  await syncWarpCharacterInventoryReceiptModel(models.receiptModel, character, table);
}

export function buildWarpCharacterInventoryPersistence(
  character: any,
  table: WarpMaterializedInventoryTable
): WarpCharacterInventoryPersistence {
  const currentData = maybeParseJsonValue(character?.data);
  const nextData =
    currentData && typeof currentData === 'object' && !Array.isArray(currentData) ? { ...currentData } : {};
  const currentWarpTables =
    nextData[WARP_CHARACTER_INVENTORY_TABLES_FIELD] &&
    typeof nextData[WARP_CHARACTER_INVENTORY_TABLES_FIELD] === 'object' &&
    !Array.isArray(nextData[WARP_CHARACTER_INVENTORY_TABLES_FIELD])
      ? { ...(nextData[WARP_CHARACTER_INVENTORY_TABLES_FIELD] as Record<string, unknown>) }
      : {};

  const mirroredTable = mirrorWarpCharacterInventoryTable(table);
  currentWarpTables[WARP_CHARACTER_INVENTORY_TABLE_FIELD] = mirroredTable;
  nextData[WARP_CHARACTER_INVENTORY_TABLES_FIELD] = currentWarpTables;

  return {
    inventory: serializeWarpCharacterInventoryTable(table),
    data: nextData,
  };
}

function ensureWarpInventoryBag(table: WarpMaterializedInventoryTable, bagIndex: number) {
  while (table.bags.length <= bagIndex) {
    table.bags.push({ items: [] });
  }

  if (!table.bags[bagIndex]) {
    table.bags[bagIndex] = { items: [] };
  }
}

function nextWarpInventoryRecordPk(table: WarpMaterializedInventoryTable): number {
  const recordPk = table.nextRecordPk;
  table.nextRecordPk += 1;
  return recordPk;
}

function resolveWarpInventoryTargetBagIndex(key: unknown): number {
  if (key == null) return 0;
  const match = String(key).match(/^inventory\.(\d+)\.items(?:\.|$)/);
  if (!match) return 0;

  const bagIndex = Number(match[1]);
  return Number.isInteger(bagIndex) && bagIndex >= 0 ? bagIndex : 0;
}

export function exchangeWarpInventoryItemInTable(
  inventoryTable: WarpMaterializedInventoryTable,
  request: { itemId?: string; itemKey?: string; quantity?: number; qty?: number }
) {
  const normalizedItemId = normalizeInventoryItemId(request?.itemId);
  const normalizedItemKey = request?.itemKey ? String(request.itemKey) : undefined;
  let remainingQuantity = normalizeInventorySyncQuantity(request?.quantity ?? request?.qty ?? 1);

  if (!normalizedItemId && !normalizedItemKey) {
    return inventoryTable;
  }

  const nextRecords: WarpProjectedInventoryRecord[] = [];
  for (const record of inventoryTable.rows) {
    const matches =
      (normalizedItemId != null && record.itemId === normalizedItemId) ||
      (normalizedItemKey != null && record.itemKey === normalizedItemKey);

    if (!matches || remainingQuantity <= 0) {
      nextRecords.push(record);
      continue;
    }

    if (!record.hasExplicitQuantity) {
      remainingQuantity -= 1;
      continue;
    }

    const nextQuantity = Math.max(0, record.quantity - remainingQuantity);
    const removedQuantity = record.quantity - nextQuantity;
    remainingQuantity = Math.max(0, remainingQuantity - removedQuantity);

    if (nextQuantity <= 0) {
      continue;
    }

    nextRecords.push({
      ...record,
      quantity: nextQuantity,
      item: normalizeInventoryItemValue({
        ...record.item,
        quantity: nextQuantity,
      }),
    });
  }

  return {
    ...inventoryTable,
    rows: nextRecords,
  };
}

export function exchangeWarpInventoryItem(
  characterId: unknown,
  inventory: any,
  request: { itemId?: string; itemKey?: string; quantity?: number; qty?: number }
) {
  const inventoryTable = materializeWarpCharacterInventoryTable(characterId, inventory);
  return serializeWarpInventoryTable(exchangeWarpInventoryItemInTable(inventoryTable, request));
}

export function applyWarpInventorySyncOpsToTable(
  inventoryTable: WarpMaterializedInventoryTable,
  ops: WarpInventorySyncOp[] | undefined
) {
  const nextRecords = inventoryTable.rows.map((record) => ({
    ...record,
    item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(record.item)),
  }));

  for (const rawOp of Array.isArray(ops) ? ops : []) {
    const op = maybeParseJsonValue(rawOp);
    if (!op || typeof op !== 'object') {
      continue;
    }

    if ((op as any).op === 'push') {
      if (!canApplyInventoryPushAtKey((op as any).key)) {
        continue;
      }

      const nextItem = normalizeInventoryItemValue((op as any).value);
      if (!nextItem.itemKey && !nextItem.itemId) {
        continue;
      }

      const bagIndex = resolveWarpInventoryTargetBagIndex((op as any).key);
      ensureWarpInventoryBag(inventoryTable, bagIndex);
      const quantity = clampInventoryQuantity(nextItem.quantity ?? nextItem.qty ?? nextItem.count, 1);
      const hasExplicitQuantity = nextItem.quantity != null || nextItem.qty != null || nextItem.count != null;
      const recordPk = nextWarpInventoryRecordPk(inventoryTable);

      nextRecords.push({
        recordId: buildWarpInventoryRecordId(inventoryTable.characterId, recordPk),
        recordPk,
        characterId: inventoryTable.characterId,
        bagIndex,
        slotIndex: nextRecords.filter((record) => record.bagIndex === bagIndex).length,
        ...(nextItem.itemId ? { itemId: String(nextItem.itemId) } : {}),
        ...(nextItem.itemKey ? { itemKey: String(nextItem.itemKey) } : {}),
        quantity,
        hasExplicitQuantity,
        item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(nextItem)),
      });
      continue;
    }

    const quantity = clampInventoryQuantity((op as any)?.quantity ?? (op as any)?.qty ?? 1, 1);
    const itemKey = (op as any)?.itemKey ? String((op as any).itemKey) : null;
    const itemId = (op as any)?.itemId ? String((op as any).itemId) : null;

    if (!itemKey && !itemId) {
      continue;
    }

    const matches = (entry: any) => {
      if (itemKey && entry?.itemKey) return String(entry.itemKey) === itemKey;
      if (itemId && entry?.itemId) return String(entry.itemId) === itemId;
      return false;
    };

    const existingIndex = nextRecords.findIndex(matches);

    if (op.op === 'move' && existingIndex >= 0) {
      nextRecords[existingIndex] = {
        ...nextRecords[existingIndex],
        item: {
          ...nextRecords[existingIndex].item,
          ...(coerceInventoryCoordinate((op as any).x) != null ? { x: coerceInventoryCoordinate((op as any).x) } : {}),
          ...(coerceInventoryCoordinate((op as any).y) != null ? { y: coerceInventoryCoordinate((op as any).y) } : {}),
        },
      };
      continue;
    }

    if (op.op === 'add') {
      const shouldTreatAsStack =
        existingIndex >= 0 &&
        (nextRecords[existingIndex]?.item?.quantity != null ||
          nextRecords[existingIndex]?.item?.count != null ||
          itemKey != null ||
          (op as any)?.quantity != null ||
          (op as any)?.qty != null);

      if (shouldTreatAsStack) {
        const currentQuantity = clampInventoryQuantity(
          nextRecords[existingIndex]?.item?.quantity ??
            nextRecords[existingIndex]?.item?.count ??
            nextRecords[existingIndex]?.quantity ??
            1,
          1
        );
        nextRecords[existingIndex] = {
          ...nextRecords[existingIndex],
          quantity: currentQuantity + quantity,
          hasExplicitQuantity: true,
          item: {
            ...nextRecords[existingIndex].item,
            quantity: currentQuantity + quantity,
            ...(coerceInventoryCoordinate((op as any).x) != null ? { x: coerceInventoryCoordinate((op as any).x) } : {}),
            ...(coerceInventoryCoordinate((op as any).y) != null ? { y: coerceInventoryCoordinate((op as any).y) } : {}),
          },
        };
      } else {
        const nextItem = normalizeInventoryItemValue({
          ...(itemKey ? { itemKey } : {}),
          ...(itemId ? { itemId } : {}),
          ...((op as any)?.quantity != null || (op as any)?.qty != null ? { quantity } : {}),
          ...(coerceInventoryCoordinate((op as any).x) != null ? { x: coerceInventoryCoordinate((op as any).x) } : {}),
          ...(coerceInventoryCoordinate((op as any).y) != null ? { y: coerceInventoryCoordinate((op as any).y) } : {}),
        });
        ensureWarpInventoryBag(inventoryTable, 0);
        const recordPk = nextWarpInventoryRecordPk(inventoryTable);
        nextRecords.push({
          recordId: buildWarpInventoryRecordId(inventoryTable.characterId, recordPk),
          recordPk,
          characterId: inventoryTable.characterId,
          bagIndex: 0,
          slotIndex: nextRecords.filter((record) => record.bagIndex === 0).length,
          ...(nextItem.itemId ? { itemId: String(nextItem.itemId) } : {}),
          ...(nextItem.itemKey ? { itemKey: String(nextItem.itemKey) } : {}),
          quantity: clampInventoryQuantity(nextItem.quantity ?? nextItem.qty ?? nextItem.count, 1),
          hasExplicitQuantity: nextItem.quantity != null || nextItem.qty != null || nextItem.count != null,
          item: normalizeInventoryItemValue(stripWarpInventoryInternalItem(nextItem)),
        });
      }
      continue;
    }

    if (op.op === 'remove' && existingIndex >= 0) {
      const hasStackQuantity = nextRecords[existingIndex]?.hasExplicitQuantity;
      if (!hasStackQuantity) {
        nextRecords.splice(existingIndex, 1);
        continue;
      }

      const currentQuantity = clampInventoryQuantity(
        nextRecords[existingIndex]?.quantity ?? nextRecords[existingIndex]?.item?.count ?? 1,
        1
      );
      const nextQuantity = Math.max(0, currentQuantity - quantity);
      if (nextQuantity <= 0) {
        nextRecords.splice(existingIndex, 1);
      } else {
        nextRecords[existingIndex] = {
          ...nextRecords[existingIndex],
          quantity: nextQuantity,
          item: {
            ...nextRecords[existingIndex].item,
            quantity: nextQuantity,
          },
        };
      }
    }
  }

  return {
    ...inventoryTable,
    rows: nextRecords,
  };
}

export function applyWarpInventorySyncOpsForCharacter(
  characterId: unknown,
  inventory: any,
  ops: WarpInventorySyncOp[] | undefined
) {
  const inventoryTable = materializeWarpCharacterInventoryTable(characterId, inventory);
  return serializeWarpInventoryTable(applyWarpInventorySyncOpsToTable(inventoryTable, ops));
}

export function applyWarpInventorySyncOps(inventory: any, ops: WarpInventorySyncOp[] | undefined) {
  const inventoryTable = materializeWarpInventoryTable(inventory);
  return serializeWarpInventoryTable(applyWarpInventorySyncOpsToTable(inventoryTable, ops));
}
