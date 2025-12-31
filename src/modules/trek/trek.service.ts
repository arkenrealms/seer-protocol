// arken/packages/seer/packages/protocol/src/modules/trek/trek.service.ts
//

import crypto from 'crypto';
import get from 'lodash/get';
import set from 'lodash/set';

import type { RouterContext } from '../../types';
import type { PatchOp, EntityPatch } from '@arken/node/types';

/**
 * Trek Service (server-authoritative)
 *
 * UI contract:
 * - getState returns a "UI shaped" object:
 *   { stopIndex, status, canAdvance, feed, choices, stats }
 *
 * - nextStop:
 *   - only generates an OPEN node if there is no open node
 *
 * - choose:
 *   - applies effects for a choice on the OPEN node
 *   - closes the node (openNodeId -> null)
 *
 * IMPORTANT UI invariant:
 * - Nodes MUST NOT contain a "Next Stop" choice.
 *   "Next Stop" is a global UI button that exists ONLY when there is no open node.
 *
 * Inventory sync:
 * - Trek does NOT own inventory syncing anymore.
 * - When choices apply inventory effects, Trek emits a standard "syncCharacterInventory" event.
 */

// -------------------------------
// Inventory Sync Standard (shared contract)
// -------------------------------
export type InventorySyncOp =
  | { op: 'add'; itemKey: string; qty?: number }
  | { op: 'remove'; itemKey: string; qty?: number };

export type SyncCharacterInventoryPayload =
  | {
      characterId: string;
      mode: 'patch';
      ops: InventorySyncOp[];
      reason?: string;
      source?: string;
    }
  | {
      characterId: string;
      mode: 'refresh';
      reason?: string;
      source?: string;
    };

// -------------------------------
// Hardcoded “DB records” (for now)
// -------------------------------
const TREK_DEFS = {
  'trek.default': {
    key: 'trek.default',
    name: 'Trek',
    nodeTypeWeights: [
      { w: 55, v: 'dialog' },
      { w: 20, v: 'reward' },
      { w: 10, v: 'npc' },
      { w: 10, v: 'battle' },
      { w: 5, v: 'minigame' },
    ],
    grantableItems: ['runic-bag'],
  },
} as const;

type TrekDef = (typeof TREK_DEFS)[keyof typeof TREK_DEFS];

// -------------------------------
// Types (Run storage)
// -------------------------------
export type TrekNode = {
  id: string;
  createdDate: string;
  nodeType: string;
  presentation: {
    title?: string;
    text: string;
    npc?: { id?: string; name?: string; tags?: string[] };
  };
  choices: Array<{
    id: string;
    label: string;
    effects: EntityPatch[];
    opens?: { kind: string; refId: string; data?: any };
    tags?: string[];
  }>;
  tags?: string[];
};

export type TrekRun = {
  id: string;
  defKey: string;
  seed: string;

  // ✅ seeded cursor (persists across thousands of stops)
  rngState: number;

  stepIndex: number;
  openNodeId?: string | null;

  // ✅ anti-spam: server-authoritative busy window
  busyUntil?: string | null;

  nodes: Record<string, TrekNode>;
  history: Array<{ nodeId: string; chosenChoiceId?: string; at: string }>;
};

export type TrekUiChoice = {
  id: string;
  label: string;
  enabled: boolean;

  // ✅ needed so UI can call choose(runId, nodeId, choiceId)
  nodeId: string;

  tags?: string[];
};

export type TrekUiState = {
  stopIndex: number;
  status: 'READY' | 'AWAIT_CHOICE' | 'BUSY';
  canAdvance: boolean;
  feed: TrekUiFeedItem[];
  choices: TrekUiChoice[];
  busyMs?: number;
  stats?: { warmth: number; supplies: number; morale: number };
};

// -------------------------------
// Types (UI state shape)
// -------------------------------
export type TrekUiFeedItem = {
  id: string;
  kind: 'dialog' | 'reward' | 'npc' | 'battle' | 'minigame' | 'system';
  tone?: string;
  title?: string;
  text: string;
  nodeId?: string;
  choiceId?: string;
  createdDate?: string;
};

export type TrekGetStateInput = {
  metaverseId?: string;
  trekId?: string; // maps to defKey
  defKey?: string; // allow direct usage too
};

export type TrekNextStopInput = {
  defKey?: string;
};

export type TrekChooseInput = {
  runId: string;
  nodeId: string;
  choiceId: string;
};

export type TrekGetStateResult = {
  runId: string;
  state: TrekUiState;
};

export type TrekNextStopResult = {
  runId: string;
  openNodeId: string | null;
  run: TrekRun;
  state: TrekUiState;
};

export type TrekChooseResult = {
  runId: string;
  state: TrekUiState;
};

// -------------------------------
// Helpers: time, ids, rng, weighted
// -------------------------------
function nowIso() {
  return new Date().toISOString();
}
function newId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}
function hashToUint32(input: string) {
  const h = crypto.createHash('sha256').update(input).digest();
  return h.readUInt32LE(0);
}
function makeRngFromState(initialState: number) {
  let state = initialState >>> 0 || 1;
  const next = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1_000_000) / 1_000_000;
  };
  const getState = () => state >>> 0;
  return { next, getState };
}
function getBusyMs(run: TrekRun) {
  const until = run.busyUntil ? Date.parse(run.busyUntil) : 0;
  return Math.max(0, until - Date.now());
}

function assertNotBusy(run: TrekRun) {
  const ms = getBusyMs(run);
  if (ms > 0) {
    const err: any = new Error(`BUSY (${ms}ms remaining)`);
    err.code = 'TREK_BUSY';
    err.busyMs = ms;
    throw err;
  }
}

function setBusy(run: TrekRun, ms = 3000) {
  run.busyUntil = new Date(Date.now() + ms).toISOString();
}
function pruneRun(run: TrekRun, max = 100) {
  run.history = (run.history || []).slice(-max);

  const keep = new Set<string>();
  for (const h of run.history) keep.add(h.nodeId);
  if (run.openNodeId) keep.add(run.openNodeId);

  const entries = Object.entries(run.nodes || {}).filter(([id]) => keep.has(id));
  run.nodes = Object.fromEntries(entries);
}
function pickWeighted<T>(rng: () => number, items: ReadonlyArray<{ w: number; v: T }>): T {
  const total = items.reduce((s, x) => s + x.w, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.w;
    if (r <= 0) return it.v;
  }
  return items[items.length - 1].v;
}

// -------------------------------
// Patch application
// -------------------------------
function applyPatchToObject(obj: any, patch: PatchOp[]) {
  for (const p of patch) {
    if (p.op === 'set') {
      set(obj, p.key, p.value);
    } else if (p.op === 'unset') {
      const parts = p.key.split('.');
      const last = parts.pop();
      const parent = parts.reduce((acc: any, k) => (acc ? acc[k] : undefined), obj);
      if (parent && last) delete parent[last];
    } else if (p.op === 'inc') {
      const cur = Number(get(obj, p.key)) || 0;
      set(obj, p.key, cur + Number(p.value || 0));
    } else if (p.op === 'push') {
      const cur = get(obj, p.key);
      const arr = Array.isArray(cur) ? cur : [];
      arr.push(p.value);
      set(obj, p.key, arr);
    } else if (p.op === 'merge') {
      const cur = get(obj, p.key);
      const base = cur && typeof cur === 'object' ? cur : {};
      set(obj, p.key, { ...base, ...(p.value || {}) });
    }
  }
}

/**
 * Normalize inventory patch: push {itemKey} -> push {itemId}
 * Assumes inventory uses key path "inventory.0.items".
 */
async function normalizeInventoryPatch(ctx: RouterContext, patch: PatchOp[]) {
  const out: PatchOp[] = [];

  for (const p of patch) {
    if (p.op === 'push' && (p.key === 'inventory.0.items' || p.key.startsWith('inventory.0.items'))) {
      const v = (p as any).value || {};
      if (v.itemId) {
        out.push(p);
        continue;
      }
      if (v.itemKey) {
        const item = await ctx.app.model.Item?.findOne?.({ key: v.itemKey })?.exec?.();
        if (!item) continue;

        out.push({
          op: 'push',
          key: p.key,
          value: { itemId: item._id, x: v.x ?? 1, y: v.y ?? 1, meta: v.meta ?? undefined },
        });
        continue;
      }
    }

    out.push(p);
  }

  return out;
}

// -------------------------------
// Inventory sync emitter (server -> client hint)
// -------------------------------
async function emitSyncCharacterInventory(ctx: RouterContext, payload: SyncCharacterInventoryPayload) {
  // You asked for this exact convention:
  // ctx.client.emit.syncCharacterInventory.mutate(DATA_HERE)
  try {
    await (ctx.client as any)?.emit?.syncCharacterInventory?.mutate?.(payload);
  } catch (e) {
    // never crash gameplay because a push failed
    console.warn('Trek.Service.emitSyncCharacterInventory failed', e);
  }
}

function inventoryOpsFromEntityPatches(patches: EntityPatch[] | undefined): InventorySyncOp[] {
  const ops: InventorySyncOp[] = [];
  for (const ep of patches || []) {
    if (ep?.entityType !== 'character.inventory' || !Array.isArray(ep.ops)) continue;

    for (const op of ep.ops as any[]) {
      // Add item (push inventory.0.items { itemKey, x?, y? })
      if (
        op?.op === 'push' &&
        (op.key === 'inventory.0.items' || String(op.key || '').startsWith('inventory.0.items')) &&
        op?.value?.itemKey
      ) {
        ops.push({ op: 'add', itemKey: op.value.itemKey, qty: 1 });
      }

      // Remove item (if you later add an explicit remove op; we support it in the standard now)
      // Example future patch: { op: 'pull', key: 'inventory.0.items', value: { itemKey } }
      if (
        op?.op === 'pull' &&
        (op.key === 'inventory.0.items' || String(op.key || '').startsWith('inventory.0.items'))
      ) {
        const itemKey = op?.value?.itemKey;
        if (itemKey) ops.push({ op: 'remove', itemKey, qty: 1 });
      }
    }
  }
  return ops;
}

// -------------------------------
// Trek state layout in character.data
// -------------------------------
function trekRootKey() {
  return `modes.trek`;
}
function activeRunIdKey() {
  return `${trekRootKey()}.activeRunId`;
}
function runsKey() {
  return `${trekRootKey()}.runs`;
}
function runKey(runId: string) {
  return `${runsKey()}.${runId}`;
}

// -------------------------------
// Effects builders (generic)
// -------------------------------
function mkPatch(entityType: string, entityId: string, ops: PatchOp[]): EntityPatch {
  return { entityType, entityId, ops };
}

// -------------------------------
// Node generation (replaceable by AI later)
// -------------------------------
function generateNodeText(nodeType: string, stepIndex: number) {
  if (nodeType === 'dialog') return `You press onward. The wind carries distant whispers.`;
  if (nodeType === 'reward') return `Something glints in the snow. A small cache awaits.`;
  if (nodeType === 'npc') return `A traveler emerges from the fog and waves you closer.`;
  if (nodeType === 'battle') return `Tracks circle you. Something is hunting.`;
  if (nodeType === 'minigame') return `A strange device hums. It looks like a challenge.`;
  return `An event unfolds.`;
}

/**
 * compileNode produces an OPEN node with contextual choices.
 *
 * IMPORTANT:
 * - DO NOT include a "Next Stop" choice here.
 *   The UI has a separate global Next Stop button that exists only when no node is open.
 */
function compileNode(params: {
  nodeId: string;
  nodeType: string;
  stepIndex: number;
  def: TrekDef;
  characterId: string;
  profileId: string;
}): TrekNode {
  const { nodeId, nodeType, stepIndex, def, characterId, profileId } = params;

  const choices: TrekNode['choices'] = [];

  if (nodeType === 'dialog') {
    choices.push({ id: 'push', label: 'Push forward', effects: [], tags: ['flow'] });
    choices.push({ id: 'rest', label: 'Rest briefly', effects: [], tags: ['flow'] });
    choices.push({ id: 'scout', label: 'Scout the ridge', effects: [], tags: ['flow'] });
  }

  if (nodeType === 'reward') {
    const itemKey = def.grantableItems[0];

    choices.push({
      id: 'claim',
      label: 'Take Supplies',
      effects: [
        mkPatch('character.inventory', characterId, [
          { op: 'push', key: 'inventory.0.items', value: { itemKey, x: 1, y: 1 } },
        ]),
        mkPatch('character.data', characterId, [{ op: 'set', key: `${trekRootKey()}.lastGrantDate`, value: nowIso() }]),
      ],
      tags: ['effect', 'reward'],
    });

    choices.push({ id: 'leave', label: 'Leave it', effects: [], tags: ['flow'] });
  }

  if (nodeType === 'npc') {
    choices.push({
      id: 'talk',
      label: 'Talk',
      effects: [mkPatch('profile.meta', profileId, [{ op: 'inc', key: `reputation.npc.traveler`, value: 1 }])],
      tags: ['effect', 'npc'],
    });

    choices.push({
      id: 'insult',
      label: 'Insult',
      effects: [mkPatch('profile.meta', profileId, [{ op: 'inc', key: `reputation.npc.traveler`, value: -2 }])],
      tags: ['effect', 'npc', 'negative'],
    });

    choices.push({ id: 'moveOn', label: 'Move on', effects: [], tags: ['flow'] });
  }

  if (nodeType === 'battle') {
    const encId = newId('enc');

    choices.push({
      id: 'fight',
      label: 'Fight',
      effects: [
        mkPatch('character.data', characterId, [
          {
            op: 'set',
            key: `${trekRootKey()}.activeEncounter`,
            value: {
              kind: 'battle',
              refId: encId,
              difficulty: Math.min(10, 1 + Math.floor(stepIndex / 3)),
              seed: `${characterId}:${stepIndex}:${encId}`,
              createdDate: nowIso(),
            },
          },
        ]),
      ],
      opens: { kind: 'battle', refId: encId },
      tags: ['effect', 'battle'],
    });

    choices.push({ id: 'flee', label: 'Flee', effects: [], tags: ['flow'] });
  }

  if (nodeType === 'minigame') {
    const miniId = newId('mini');

    choices.push({
      id: 'attempt',
      label: 'Attempt Challenge',
      effects: [
        mkPatch('character.data', characterId, [
          {
            op: 'set',
            key: `${trekRootKey()}.activeEncounter`,
            value: {
              kind: 'minigame',
              refId: miniId,
              minigameKey: 'trek.lockpick',
              seed: `${characterId}:${stepIndex}:${miniId}`,
              createdDate: nowIso(),
            },
          },
        ]),
      ],
      opens: { kind: 'minigame', refId: miniId },
      tags: ['effect', 'minigame'],
    });

    choices.push({ id: 'skip', label: 'Skip', effects: [], tags: ['flow'] });
  }

  // safety: always ensure at least one choice exists
  if (!choices.length) choices.push({ id: 'ok', label: 'Continue', effects: [], tags: ['flow'] });

  return {
    id: nodeId,
    createdDate: nowIso(),
    nodeType,
    presentation: {
      title: def.name,
      text: generateNodeText(nodeType, stepIndex),
      npc: nodeType === 'npc' ? { name: 'Traveler', tags: ['wanderer'] } : undefined,
    },
    choices,
    tags: ['trek'],
  };
}

// -------------------------------
// State -> UI adapter
// -------------------------------
function runToUiState(run: TrekRun): TrekUiState {
  const busyMs = getBusyMs(run);
  const openNode = run.openNodeId ? run.nodes?.[run.openNodeId] : undefined;

  const feed: TrekUiFeedItem[] = [];

  for (const h of run.history || []) {
    const n = run.nodes?.[h.nodeId];
    if (!n) continue;
    feed.push({
      id: `hist_${h.nodeId}_${h.at}`,
      kind: (n.nodeType as any) || 'dialog',
      tone: n.nodeType,
      title: n.presentation?.title,
      text: n.presentation?.text || '',
      nodeId: n.id,
      choiceId: h.chosenChoiceId,
      createdDate: n.createdDate,
    });
  }

  if (openNode) {
    feed.push({
      id: `open_${openNode.id}`,
      kind: (openNode.nodeType as any) || 'dialog',
      tone: openNode.nodeType,
      title: openNode.presentation?.title,
      text: openNode.presentation?.text || '',
      nodeId: openNode.id,
      createdDate: openNode.createdDate,
    });
  }

  const choices: TrekUiChoice[] = (openNode?.choices || []).map((c) => ({
    id: c.id,
    label: c.label,
    enabled: busyMs > 0 ? false : true,
    nodeId: openNode?.id || '',
    tags: c.tags,
  }));

  const canAdvance = !run.openNodeId && busyMs <= 0;
  const baseStatus: TrekUiState['status'] = !run.openNodeId ? 'READY' : 'AWAIT_CHOICE';

  return {
    stopIndex: run.stepIndex ?? 0,
    status: busyMs > 0 ? 'BUSY' : baseStatus,
    canAdvance,
    feed,
    choices,
    busyMs,
    stats: { warmth: 0, supplies: 0, morale: 0 },
  };
}

// -------------------------------
// Service
// -------------------------------
export class Service {
  /**
   * UI reads this.
   * - Returns (runId, state)
   * - If no run exists yet, creates one (but does NOT open a node).
   */
  async getState(input: TrekGetStateInput, ctx: RouterContext): Promise<TrekGetStateResult> {
    if (!ctx.client?.profile) throw new Error('Unauthorized');

    const defKey = input?.defKey || input?.trekId || 'trek.default';
    const def = TREK_DEFS[defKey as keyof typeof TREK_DEFS];
    if (!def) throw new Error(`Unknown trek defKey: ${defKey}`);

    const profile = await ctx.app.model.Profile.findById(ctx.client.profile.id).populate('characters').exec();
    if (!profile) throw new Error('Profile not found');

    const character = profile.characters?.[0];
    if (!character) throw new Error('No character');

    if (!character.data) character.data = {};
    if (!character.inventory) character.inventory = [{ items: [] }];

    const activeRunId = get(character.data, activeRunIdKey()) as string | undefined;
    let run: TrekRun | null = null;

    if (activeRunId) run = get(character.data, runKey(activeRunId)) as TrekRun;

    if (!run?.id) {
      const runId = newId('run');
      const seed = `${profile.id}:${character.id}:${Date.now()}`;
      run = {
        id: runId,
        defKey: def.key,
        seed,
        rngState: hashToUint32(seed), // ✅ required
        stepIndex: 0,
        openNodeId: null,
        busyUntil: null, // ✅ optional but you use it
        nodes: {},
        history: [],
      };

      set(character.data, activeRunIdKey(), runId);
      set(character.data, runKey(runId), run);
      character.markModified('data');
      await character.save();
    }

    return { runId: run.id, state: runToUiState(run) };
  }

  /**
   * Generates the next node IF there is no open node.
   * Stores everything in character.data.
   */
  async nextStop(input: TrekNextStopInput, ctx: RouterContext): Promise<TrekNextStopResult> {
    if (!ctx.client?.profile) throw new Error('Unauthorized');

    const defKey = input?.defKey || 'trek.default';
    const def = TREK_DEFS[defKey as keyof typeof TREK_DEFS];
    if (!def) throw new Error(`Unknown trek defKey: ${defKey}`);

    const profile = await ctx.app.model.Profile.findById(ctx.client.profile.id).populate('characters').exec();
    if (!profile) throw new Error('Profile not found');

    const character = profile.characters?.[0];
    if (!character) throw new Error('No character');

    if (!character.data) character.data = {};
    if (!character.inventory) character.inventory = [{ items: [] }];

    const activeRunId = get(character.data, activeRunIdKey()) as string | undefined;
    let run: TrekRun | null = null;
    if (activeRunId) run = get(character.data, runKey(activeRunId)) as TrekRun;

    // create run if missing
    if (!run?.id) {
      const runId = newId('run');
      const seed = `${profile.id}:${character.id}:${Date.now()}`;

      run = {
        id: runId,
        defKey: def.key,
        seed,
        rngState: hashToUint32(seed),
        stepIndex: 0,
        openNodeId: null,
        busyUntil: null,
        nodes: {},
        history: [],
      };

      set(character.data, activeRunIdKey(), runId);
      set(character.data, runKey(runId), run);
    }

    assertNotBusy(run);

    // if open node exists, do not generate a new one — just return current state
    if (run.openNodeId) {
      set(character.data, runKey(run.id), run);
      character.markModified('data');
      await character.save();
      return { runId: run.id, state: runToUiState(run), openNodeId: run.openNodeId, run };
    }

    // deterministic nodeType via persisted rngState
    const rng = makeRngFromState(run.rngState);
    const nodeType = pickWeighted(rng.next, def.nodeTypeWeights) as string;
    run.rngState = rng.getState();

    const nodeId = newId('node');
    const node = compileNode({
      nodeId,
      nodeType,
      stepIndex: run.stepIndex,
      def,
      characterId: character.id,
      profileId: profile.id,
    });

    run.nodes ||= {};
    run.nodes[nodeId] = node;

    // keep it OPEN
    run.openNodeId = nodeId;
    run.stepIndex += 1;
    run.history ||= [];
    // run.history.push({ nodeId, at: nowIso() });

    pruneRun(run, 100);
    setBusy(run, 3000);

    set(character.data, runKey(run.id), run);
    character.markModified('data');
    await character.save();

    return { runId: run.id, state: runToUiState(run), openNodeId: nodeId, run };
  }

  /**
   * Applies effects for a chosen choice on the currently open node.
   * - Applies entity patches
   * - Closes the open node (openNodeId -> null)
   * - Emits inventory sync hint to the client when inventory changes occur
   */
  async choose(input: TrekChooseInput, ctx: RouterContext): Promise<TrekChooseResult> {
    if (!ctx.client?.profile) throw new Error('Unauthorized');
    if (!input?.runId || !input?.nodeId || !input?.choiceId) throw new Error('Invalid input');

    const profile = await ctx.app.model.Profile.findById(ctx.client.profile.id).populate('characters').exec();
    if (!profile) throw new Error('Profile not found');

    const character = profile.characters?.[0];
    if (!character) throw new Error('No character');

    if (!profile.meta) profile.meta = {};
    if (!character.data) character.data = {};
    if (!character.inventory) character.inventory = [{ items: [] }];

    const run = get(character.data, runKey(input.runId)) as TrekRun;
    if (!run?.id) throw new Error('Run not found');

    assertNotBusy(run);

    if (run.openNodeId !== input.nodeId) throw new Error('Node is not open');

    const node = run.nodes?.[input.nodeId];
    if (!node) throw new Error('Node not found');

    const choice = node.choices?.find((c) => c.id === input.choiceId);
    if (!choice) throw new Error('Choice not found');

    // detect inventory intent from effects (before normalization mutates them)
    const inventoryOps = inventoryOpsFromEntityPatches(choice.effects);

    for (const patch of choice.effects || []) {
      if (!patch?.entityType || !patch?.entityId || !Array.isArray(patch.ops)) continue;

      if (patch.entityType === 'profile.meta') {
        applyPatchToObject(profile.meta, patch.ops);
        profile.markModified('meta');
      } else if (patch.entityType === 'character.data') {
        applyPatchToObject(character.data, patch.ops);
        character.markModified('data');
      } else if (patch.entityType === 'character.inventory') {
        const normalizedOps = await normalizeInventoryPatch(ctx, patch.ops);
        applyPatchToObject(character, normalizedOps);
        character.markModified('inventory');
      }
    }

    // close node + record chosen choice
    run.openNodeId = null;
    const last = run.history?.[run.history.length - 1];
    if (last?.nodeId === input.nodeId) last.chosenChoiceId = input.choiceId;

    pruneRun(run, 100);
    setBusy(run, 3000);

    set(character.data, runKey(run.id), run);
    character.markModified('data');

    await profile.save();
    await character.save();

    // If inventory was affected, emit a client sync hint.
    // Use patch when we can infer specifics; otherwise ask for refresh.
    if (inventoryOps.length > 0) {
      await emitSyncCharacterInventory(ctx, {
        characterId: character.id.toString(),
        mode: 'patch',
        ops: inventoryOps,
        reason: 'trek.choice',
        source: 'trek.service.choose',
      });
    } else {
      // no-op
    }

    return { runId: run.id, state: runToUiState(run) };
  }

  /**
   * (Optional) Explicit server route to request client inventory convergence.
   * You said "give me the service routes for that too (put it in trek.service.ts for now)" earlier.
   *
   * This does NOT mutate inventory; it only pushes a convergence hint to the client.
   */
  //   async syncCharacterInventory(input: SyncCharacterInventoryPayload, ctx: RouterContext) {
  //     if (!ctx.client?.profile) throw new Error('Unauthorized');
  //     if (!input?.characterId) throw new Error('Invalid input');

  //     await emitSyncCharacterInventory(ctx, { ...input, source: input.source || 'trek.service.syncCharacterInventory' });
  //   }
}
