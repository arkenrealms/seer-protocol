import { createHash } from 'crypto';
import { z } from 'zod';

const nonEmptyString = z.string().min(1);

export const signedRequestSchema = z.object({
  address: nonEmptyString,
  hash: nonEmptyString,
  data: nonEmptyString,
});

export const roundCommitProofTransitionKindSchema = z.enum(['insert', 'update', 'delete']);
export const roundCommitProofTransitionSourceSchema = z.enum(['emptyLeaf', 'branchWitness']);

export const roundCommitProofSchema = z.object({
  kind: z.enum(['zk.updateLeaf', 'merkle.row']),
  entityType: nonEmptyString,
  entityId: nonEmptyString,
  transitionKind: roundCommitProofTransitionKindSchema.optional(),
  transitionSource: roundCommitProofTransitionSourceSchema.optional(),
  oldRoot: nonEmptyString.optional(),
  newRoot: nonEmptyString.optional(),
  publicSignals: z.array(z.any()).optional(),
  proof: z.any().optional(),
});

export const roundCommitBranchWitnessSchema = z.object({
  entityType: nonEmptyString,
  entityId: nonEmptyString,
  baseVersion: z.number().nullable().optional(),
  oldLeaf: nonEmptyString,
  siblings: z.array(nonEmptyString).length(16),
});

export const roundCommitEnvelopeSchema = z.object({
  version: z.literal(1).default(1),
  gameKey: nonEmptyString,
  branchId: nonEmptyString,
  roundId: nonEmptyString,
  baseStateRoot: nonEmptyString,
  roundHash: nonEmptyString,
  patchSetHash: nonEmptyString,
  eventsHash: nonEmptyString,
  postStateRoot: nonEmptyString.optional(),
  touchedEntityIds: z.array(nonEmptyString).optional(),
  insertedEntityIds: z.array(nonEmptyString).optional(),
  importedEntityIds: z.array(nonEmptyString).optional(),
  updatedEntityIds: z.array(nonEmptyString).optional(),
  deletedEntityIds: z.array(nonEmptyString).optional(),
  snapshotEntityIds: z.array(nonEmptyString).optional(),
  leafHashes: z.record(nonEmptyString).optional(),
  branchWitnesses: z.array(roundCommitBranchWitnessSchema).optional(),
  proofs: z.array(roundCommitProofSchema).optional(),
  signature: signedRequestSchema,
});

export const roundStateCommitmentHintSchema = z
  .object({
    type: z.string().optional(),
    baseStateRoot: nonEmptyString.optional(),
    postStateRoot: nonEmptyString.optional(),
    touchedEntityIds: z.array(nonEmptyString).optional(),
    insertedEntityIds: z.array(nonEmptyString).optional(),
    importedEntityIds: z.array(nonEmptyString).optional(),
    updatedEntityIds: z.array(nonEmptyString).optional(),
    deletedEntityIds: z.array(nonEmptyString).optional(),
    snapshotEntityIds: z.array(nonEmptyString).optional(),
    leafHashes: z.record(nonEmptyString).optional(),
    branchWitnesses: z.array(roundCommitBranchWitnessSchema).optional(),
    proofs: z.array(roundCommitProofSchema).optional(),
  })
  .passthrough();

export const saveRoundInputSchema = z.object({
  shardId: nonEmptyString,
  gameKey: nonEmptyString,
  round: z.any(),
  clients: z.any(),
  commit: roundCommitEnvelopeSchema.optional(),
});

export const acceptedStateCommitmentSchema = z.object({
  baseStateRoot: nonEmptyString,
  postStateRoot: nonEmptyString,
  touchedEntityIds: z.array(nonEmptyString).optional(),
  insertedEntityIds: z.array(nonEmptyString).optional(),
  importedEntityIds: z.array(nonEmptyString).optional(),
  updatedEntityIds: z.array(nonEmptyString).optional(),
  deletedEntityIds: z.array(nonEmptyString).optional(),
  snapshotEntityIds: z.array(nonEmptyString).optional(),
  leafHashes: z.record(nonEmptyString).optional(),
  branchWitnesses: z.array(roundCommitBranchWitnessSchema).optional(),
});

export const saveRoundResultSchema = z.object({
  roundId: nonEmptyString,
  acceptedStateCommitment: acceptedStateCommitmentSchema.optional(),
});

export type RoundCommitEnvelopeDraft = Omit<RoundCommitEnvelope, 'signature'>;
export type RoundStateCommitmentHint = z.infer<typeof roundStateCommitmentHintSchema>;
export type RoundCommitBuildInput = {
  gameKey: string;
  shardId: string;
  round: any;
  baseStateRoot?: string | null;
  postStateRoot?: string | null;
  touchedEntityIds?: string[] | null;
  insertedEntityIds?: string[] | null;
  importedEntityIds?: string[] | null;
  updatedEntityIds?: string[] | null;
  deletedEntityIds?: string[] | null;
  snapshotEntityIds?: string[] | null;
  leafHashes?: Record<string, string> | null;
  branchWitnesses?: RoundCommitBranchWitness[] | null;
  proofs?: RoundCommitProof[] | null;
};
export type RoundStateCommitmentBuildInput = Pick<
  RoundCommitBuildInput,
  | 'round'
  | 'baseStateRoot'
  | 'postStateRoot'
  | 'touchedEntityIds'
  | 'insertedEntityIds'
  | 'importedEntityIds'
  | 'updatedEntityIds'
  | 'deletedEntityIds'
  | 'snapshotEntityIds'
  | 'leafHashes'
  | 'branchWitnesses'
  | 'proofs'
>;

export type RoundCommitSigner = (message: string) => Promise<{
  address: string;
  hash: string;
  data?: string;
} | null>;
export type RoundCommitTransitionSummary = {
  insertedCount: number;
  importedCount: number;
  updatedCount: number;
  deletedCount: number;
  insertedEntityIds?: string[];
  importedEntityIds?: string[];
  updatedEntityIds?: string[];
  deletedEntityIds?: string[];
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value);

export const stableSerialize = (value: unknown): string => {
  if (value === null) return 'null';

  switch (typeof value) {
    case 'undefined':
      return '{"$undefined":true}';
    case 'boolean':
      return value ? 'true' : 'false';
    case 'number':
      if (!Number.isFinite(value)) {
        throw new Error('Cannot deterministically serialize non-finite numbers');
      }
      return JSON.stringify(value);
    case 'bigint':
      return `{"$bigint":${JSON.stringify(value.toString())}}`;
    case 'string':
      return JSON.stringify(value);
    case 'object':
      if (Array.isArray(value)) {
        return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`;
      }

      if (value instanceof Date) {
        return `{"$date":${JSON.stringify(value.toISOString())}}`;
      }

      if (!isPlainObject(value)) {
        return JSON.stringify(value);
      }

      return `{${Object.keys(value)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
        .join(',')}}`;
    default:
      throw new Error(`Unsupported deterministic serialization type: ${typeof value}`);
  }
};

export const normalizeRoundEvents = (events: unknown): unknown[] => (Array.isArray(events) ? events : []);

const sha256Hex = (value: string): string => createHash('sha256').update(value).digest('hex');

export const hashDeterministic = (value: unknown): string => sha256Hex(stableSerialize(value));

export const hashRoundCommitRound = (round: unknown): string => hashDeterministic(round);

export const buildRoundPatchSetDescriptor = (round: any) =>
  (Array.isArray(round?.clients) ? round.clients : [])
    .map((client: any) => ({
      address: client?.address ?? null,
      id: client?.id ?? null,
      characterId: client?.characterId ?? client?.character?.id ?? null,
      characterVersion: client?.characterVersion ?? client?.character?.version ?? null,
      ops: Array.isArray(client?.ops) ? client.ops : [],
    }))
    .sort((left, right) =>
      stableSerialize({
        address: left.address,
        id: left.id,
      }).localeCompare(
        stableSerialize({
          address: right.address,
          id: right.id,
        })
      )
    );

export const hashRoundCommitPatchSet = (round: any): string => hashDeterministic(buildRoundPatchSetDescriptor(round));

export const hashRoundCommitEvents = (round: any): string =>
  sha256Hex(JSON.stringify(normalizeRoundEvents(round?.events)));

const asRecord = (value: unknown): Record<string, unknown> | null => (isPlainObject(value) ? value : null);

const readString = (record: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const readStringArray = (record: Record<string, unknown>, keys: string[]): string[] | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (!Array.isArray(value)) {
      continue;
    }

    const normalized = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry): entry is string => entry.length > 0);

    if (normalized.length > 0) {
      return normalized;
    }
  }

  return undefined;
};

const normalizeProofCandidate = (value: unknown): RoundCommitProof | null => {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const entityType = readString(record, ['entityType']);
  const entityId = readString(record, ['entityId']);

  if (!entityType || !entityId) {
    return null;
  }

  const explicitKind = readString(record, ['kind']);
  const kind =
    explicitKind === 'zk.updateLeaf' || explicitKind === 'merkle.row'
      ? explicitKind
      : record.proof || Array.isArray(record.publicSignals)
        ? 'zk.updateLeaf'
        : 'merkle.row';
  const explicitTransitionKind = readString(record, ['transitionKind']);
  const transitionKind =
    explicitTransitionKind === 'insert' || explicitTransitionKind === 'update' || explicitTransitionKind === 'delete'
      ? explicitTransitionKind
      : undefined;
  const explicitTransitionSource = readString(record, ['transitionSource']);
  const transitionSource =
    explicitTransitionSource === 'emptyLeaf' || explicitTransitionSource === 'branchWitness'
      ? explicitTransitionSource
      : undefined;
  const oldRoot = readString(record, ['oldRoot', 'baseStateRoot', 'rootBefore']);
  const newRoot = readString(record, ['newRoot', 'postStateRoot', 'merkleRoot', 'rootAfter']);

  return {
    kind,
    entityType,
    entityId,
    ...(transitionKind ? { transitionKind } : {}),
    ...(transitionSource ? { transitionSource } : {}),
    ...(oldRoot ? { oldRoot } : {}),
    ...(newRoot ? { newRoot } : {}),
    ...(Array.isArray(record.publicSignals) ? { publicSignals: record.publicSignals } : {}),
    ...(record.proof ? { proof: record.proof } : {}),
  };
};

const collectRoundStateCommitmentHints = (round: any): Record<string, unknown>[] => {
  const candidates: Record<string, unknown>[] = [];

  const topLevel = asRecord(round?.stateCommitment);
  if (topLevel) {
    candidates.push(topLevel);
  }

  for (const entry of Array.isArray(round?.states) ? round.states : []) {
    const record = asRecord(entry);
    if (record) {
      candidates.push(record);
    }
  }

  return candidates;
};

export const extractRoundCommitStateHints = (
  round: any
): {
  baseStateRoot?: string;
  postStateRoot?: string;
  touchedEntityIds?: string[];
  insertedEntityIds?: string[];
  importedEntityIds?: string[];
  updatedEntityIds?: string[];
  deletedEntityIds?: string[];
  snapshotEntityIds?: string[];
  leafHashes?: Record<string, string>;
  branchWitnesses?: RoundCommitBranchWitness[];
  proofs?: RoundCommitProof[];
} => {
  const candidates = collectRoundStateCommitmentHints(round);
  const touchedEntityIds: string[] = [];
  const insertedEntityIds: string[] = [];
  const importedEntityIds: string[] = [];
  const updatedEntityIds: string[] = [];
  const deletedEntityIds: string[] = [];
  const snapshotEntityIds: string[] = [];
  const leafHashes: Record<string, string> = {};
  const branchWitnesses: RoundCommitBranchWitness[] = [];
  const proofs: RoundCommitProof[] = [];
  let baseStateRoot: string | undefined;
  let postStateRoot: string | undefined;

  for (const candidate of candidates) {
    if (!baseStateRoot) {
      baseStateRoot = readString(candidate, ['baseStateRoot', 'oldRoot', 'rootBefore']);
    }

    const nextPostStateRoot = readString(candidate, ['postStateRoot', 'newRoot', 'merkleRoot', 'rootAfter']);
    if (nextPostStateRoot) {
      postStateRoot = nextPostStateRoot;
    }

    const candidateTouchedEntityIds = readStringArray(candidate, ['touchedEntityIds']);
    if (candidateTouchedEntityIds) {
      touchedEntityIds.push(...candidateTouchedEntityIds);
    }

    const candidateInsertedEntityIds = readStringArray(candidate, ['insertedEntityIds']);
    if (candidateInsertedEntityIds) {
      insertedEntityIds.push(...candidateInsertedEntityIds);
    }

    const candidateImportedEntityIds = readStringArray(candidate, ['importedEntityIds']);
    if (candidateImportedEntityIds) {
      importedEntityIds.push(...candidateImportedEntityIds);
    }

    const candidateUpdatedEntityIds = readStringArray(candidate, ['updatedEntityIds']);
    if (candidateUpdatedEntityIds) {
      updatedEntityIds.push(...candidateUpdatedEntityIds);
    }

    const candidateDeletedEntityIds = readStringArray(candidate, ['deletedEntityIds']);
    if (candidateDeletedEntityIds) {
      deletedEntityIds.push(...candidateDeletedEntityIds);
    }

    const candidateSnapshotEntityIds = readStringArray(candidate, ['snapshotEntityIds']);
    if (candidateSnapshotEntityIds) {
      snapshotEntityIds.push(...candidateSnapshotEntityIds);
    }

    if (isPlainObject(candidate.leafHashes)) {
      for (const [key, value] of Object.entries(candidate.leafHashes)) {
        if (typeof value !== 'string') {
          continue;
        }

        const normalizedKey = key.trim();
        const normalizedValue = value.trim();
        if (!normalizedKey || !normalizedValue) {
          continue;
        }

        leafHashes[normalizedKey] = normalizedValue;
      }
    }

    const candidateBranchWitnesses = normalizeBranchWitnesses(
      Array.isArray(candidate.branchWitnesses) ? (candidate.branchWitnesses as RoundCommitBranchWitness[]) : null
    );
    if (candidateBranchWitnesses) {
      branchWitnesses.push(...candidateBranchWitnesses);
    }

    const candidateProofs = normalizeProofs(Array.isArray(candidate.proofs) ? (candidate.proofs as RoundCommitProof[]) : null);
    if (candidateProofs) {
      proofs.push(...candidateProofs);
    }

    const singleProof = normalizeProofCandidate(candidate);
    if (singleProof) {
      proofs.push(singleProof);
    }
  }

  for (const proof of proofs) {
    const entityKey = `${proof.entityType}:${proof.entityId}`;
    touchedEntityIds.push(entityKey);
    if (proof.transitionKind === 'insert') {
      insertedEntityIds.push(entityKey);
    } else if (proof.transitionKind === 'update') {
      updatedEntityIds.push(entityKey);
    } else if (proof.transitionKind === 'delete') {
      deletedEntityIds.push(entityKey);
    }
    if (proof.transitionSource === 'branchWitness') {
      importedEntityIds.push(entityKey);
    }
  }

  const normalizedTouchedEntityIds = [...new Set(touchedEntityIds.map((value) => value.trim()).filter(Boolean))].sort();
  const normalizedInsertedEntityIds = [...new Set(insertedEntityIds.map((value) => value.trim()).filter(Boolean))].sort();
  const normalizedImportedEntityIds = [...new Set(importedEntityIds.map((value) => value.trim()).filter(Boolean))].sort();
  const normalizedUpdatedEntityIds = [...new Set(updatedEntityIds.map((value) => value.trim()).filter(Boolean))].sort();
  const normalizedDeletedEntityIds = [...new Set(deletedEntityIds.map((value) => value.trim()).filter(Boolean))].sort();

  return {
    ...(baseStateRoot ? { baseStateRoot } : {}),
    ...(postStateRoot ? { postStateRoot } : {}),
    ...(normalizedTouchedEntityIds.length > 0 ? { touchedEntityIds: normalizedTouchedEntityIds } : {}),
    ...(normalizedInsertedEntityIds.length > 0 ? { insertedEntityIds: normalizedInsertedEntityIds } : {}),
    ...(normalizedImportedEntityIds.length > 0 ? { importedEntityIds: normalizedImportedEntityIds } : {}),
    ...(normalizedUpdatedEntityIds.length > 0 ? { updatedEntityIds: normalizedUpdatedEntityIds } : {}),
    ...(normalizedDeletedEntityIds.length > 0 ? { deletedEntityIds: normalizedDeletedEntityIds } : {}),
    ...(snapshotEntityIds.length > 0
      ? { snapshotEntityIds: [...new Set(snapshotEntityIds.map((value) => value.trim()).filter(Boolean))].sort() }
      : {}),
    ...(Object.keys(leafHashes).length > 0 ? { leafHashes } : {}),
    ...(branchWitnesses.length > 0 ? { branchWitnesses: normalizeBranchWitnesses(branchWitnesses) } : {}),
    ...(proofs.length > 0 ? { proofs } : {}),
  };
};

const collectClientTouchedEntityIds = (round: any): string[] =>
  (Array.isArray(round?.clients) ? round.clients : []).flatMap((client: any) =>
    (Array.isArray(client?.ops) ? client.ops : [])
      .map((op: any) => {
        const entityType = typeof op?.entityType === 'string' ? op.entityType.trim() : '';
        const entityId = typeof op?.entityId === 'string' ? op.entityId.trim() : '';
        if (!entityType || !entityId) return null;
        return `${entityType}:${entityId}`;
      })
      .filter((entry: string | null): entry is string => !!entry)
  );

const normalizeTouchedEntityIds = (round: any, touchedEntityIds?: string[] | null): string[] | undefined => {
  const direct = Array.isArray(touchedEntityIds) ? touchedEntityIds : [];
  const fromOps = collectClientTouchedEntityIds(round);

  const normalized = [...new Set([...direct, ...fromOps].map((value) => value.trim()).filter(Boolean))].sort();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeEntitySummaryIds = (entityIds?: string[] | null): string[] | undefined => {
  if (!Array.isArray(entityIds)) {
    return undefined;
  }

  const normalized = [...new Set(entityIds.map((value) => value.trim()).filter(Boolean))].sort();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeInsertedEntityIds = (insertedEntityIds?: string[] | null): string[] | undefined => {
  return normalizeEntitySummaryIds(insertedEntityIds);
};

const normalizeUpdatedEntityIds = (updatedEntityIds?: string[] | null): string[] | undefined =>
  normalizeEntitySummaryIds(updatedEntityIds);

const normalizeDeletedEntityIds = (deletedEntityIds?: string[] | null): string[] | undefined =>
  normalizeEntitySummaryIds(deletedEntityIds);

export const summarizeRoundCommitTransitionEntityIds = (input: {
  insertedEntityIds?: string[] | null;
  importedEntityIds?: string[] | null;
  updatedEntityIds?: string[] | null;
  deletedEntityIds?: string[] | null;
  proofs?: RoundCommitProof[] | null;
}): RoundCommitTransitionSummary => {
  const proofs = normalizeProofs(input.proofs);
  const insertedEntityIds = normalizeInsertedEntityIds([
    ...(input.insertedEntityIds ?? []),
    ...((proofs ?? [])
      .filter((proof) => proof.transitionKind === 'insert')
      .map((proof) => `${proof.entityType}:${proof.entityId}`) ?? []),
  ]);
  const importedEntityIds = normalizeEntitySummaryIds([
    ...(input.importedEntityIds ?? []),
    ...((proofs ?? [])
      .filter((proof) => proof.transitionSource === 'branchWitness')
      .map((proof) => `${proof.entityType}:${proof.entityId}`) ?? []),
  ]);
  const updatedEntityIds = normalizeUpdatedEntityIds([
    ...(input.updatedEntityIds ?? []),
    ...((proofs ?? [])
      .filter((proof) => proof.transitionKind === 'update')
      .map((proof) => `${proof.entityType}:${proof.entityId}`) ?? []),
  ]);
  const deletedEntityIds = normalizeDeletedEntityIds([
    ...(input.deletedEntityIds ?? []),
    ...((proofs ?? [])
      .filter((proof) => proof.transitionKind === 'delete')
      .map((proof) => `${proof.entityType}:${proof.entityId}`) ?? []),
  ]);

  return {
    insertedCount: insertedEntityIds?.length ?? 0,
    importedCount: importedEntityIds?.length ?? 0,
    updatedCount: updatedEntityIds?.length ?? 0,
    deletedCount: deletedEntityIds?.length ?? 0,
    ...(insertedEntityIds ? { insertedEntityIds } : {}),
    ...(importedEntityIds ? { importedEntityIds } : {}),
    ...(updatedEntityIds ? { updatedEntityIds } : {}),
    ...(deletedEntityIds ? { deletedEntityIds } : {}),
  };
};

const normalizeSnapshotEntityIds = (snapshotEntityIds?: string[] | null): string[] | undefined => {
  if (!Array.isArray(snapshotEntityIds)) {
    return undefined;
  }

  const normalized = [...new Set(snapshotEntityIds.map((value) => value.trim()).filter(Boolean))].sort();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeLeafHashes = (leafHashes?: Record<string, string> | null): Record<string, string> | undefined => {
  if (!leafHashes || typeof leafHashes !== 'object' || Array.isArray(leafHashes)) {
    return undefined;
  }

  const normalizedEntries = Object.entries(leafHashes)
    .map(([key, value]) => {
      if (typeof value !== 'string') {
        return null;
      }

      const normalizedKey = key.trim();
      const normalizedValue = value.trim();
      if (!normalizedKey || !normalizedValue) {
        return null;
      }

      return [normalizedKey, normalizedValue] as const;
    })
    .filter((entry): entry is readonly [string, string] => !!entry)
    .sort(([left], [right]) => left.localeCompare(right));

  if (normalizedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(normalizedEntries);
};

const normalizeBranchWitnesses = (
  branchWitnesses?: RoundCommitBranchWitness[] | null
): RoundCommitBranchWitness[] | undefined => {
  if (!Array.isArray(branchWitnesses) || branchWitnesses.length === 0) {
    return undefined;
  }

  const normalized = branchWitnesses
    .map((witness) => {
      if (!witness || typeof witness !== 'object') {
        return null;
      }

      const entityType = typeof witness.entityType === 'string' ? witness.entityType.trim() : '';
      const entityId = typeof witness.entityId === 'string' ? witness.entityId.trim() : '';
      const oldLeaf = typeof witness.oldLeaf === 'string' ? witness.oldLeaf.trim() : '';
      const siblings = Array.isArray(witness.siblings)
        ? witness.siblings.map((value) => (typeof value === 'string' ? value.trim() : ''))
        : [];

      if (!entityType || !entityId || !oldLeaf || siblings.length !== 16 || siblings.some((value) => !value)) {
        return null;
      }

      return {
        entityType,
        entityId,
        ...(typeof witness.baseVersion === 'number' ? { baseVersion: witness.baseVersion } : {}),
        oldLeaf,
        siblings,
      } satisfies RoundCommitBranchWitness;
    })
    .filter((entry) => !!entry) as RoundCommitBranchWitness[];

  if (normalized.length === 0) {
    return undefined;
  }

  const unique = new Map<string, RoundCommitBranchWitness>();
  for (const witness of normalized) {
    unique.set(
      stableSerialize({
        entityType: witness.entityType,
        entityId: witness.entityId,
        baseVersion: witness.baseVersion ?? null,
        oldLeaf: witness.oldLeaf,
        siblings: witness.siblings,
      }),
      witness
    );
  }

  return [...unique.values()].sort((left, right) =>
    stableSerialize({
      entityType: left.entityType,
      entityId: left.entityId,
    }).localeCompare(
      stableSerialize({
        entityType: right.entityType,
        entityId: right.entityId,
      })
    )
  );
};

const normalizeProofs = (proofs?: RoundCommitProof[] | null): RoundCommitProof[] | undefined => {
  if (!Array.isArray(proofs) || proofs.length === 0) {
    return undefined;
  }

  const normalized = proofs.map((proof) => ({
    kind: proof.kind,
    entityType: proof.entityType,
    entityId: proof.entityId,
    ...(proof.transitionKind ? { transitionKind: proof.transitionKind } : {}),
    ...(proof.transitionSource ? { transitionSource: proof.transitionSource } : {}),
    ...(proof.oldRoot ? { oldRoot: proof.oldRoot } : {}),
    ...(proof.newRoot ? { newRoot: proof.newRoot } : {}),
    ...(Array.isArray(proof.publicSignals) ? { publicSignals: proof.publicSignals } : {}),
    ...(proof.proof ? { proof: proof.proof } : {}),
  }));

  const unique = new Map<string, RoundCommitProof>();
  for (const proof of normalized) {
    unique.set(
      stableSerialize({
        kind: proof.kind,
        entityType: proof.entityType,
        entityId: proof.entityId,
        transitionKind: proof.transitionKind ?? null,
        transitionSource: proof.transitionSource ?? null,
        oldRoot: proof.oldRoot ?? null,
        newRoot: proof.newRoot ?? null,
        publicSignals: proof.publicSignals ?? null,
      }),
      proof
    );
  }

  return [...unique.values()];
};

const findFirstProofRoot = (proofs: RoundCommitProof[] | undefined, key: 'oldRoot' | 'newRoot'): string | undefined =>
  proofs?.find((proof) => typeof proof[key] === 'string' && proof[key]!.trim().length > 0)?.[key]?.trim();

const findLastProofRoot = (proofs: RoundCommitProof[] | undefined, key: 'oldRoot' | 'newRoot'): string | undefined => {
  if (!proofs || proofs.length === 0) {
    return undefined;
  }

  for (let index = proofs.length - 1; index >= 0; index -= 1) {
    const value = proofs[index]?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

const resolveBaseStateRoot = (input: RoundCommitBuildInput, proofs?: RoundCommitProof[]): string => {
  const explicitBase =
    typeof input.baseStateRoot === 'string' && input.baseStateRoot.trim().length > 0
      ? input.baseStateRoot.trim()
      : undefined;
  if (explicitBase) {
    return explicitBase;
  }

  const proofBase = findFirstProofRoot(proofs, 'oldRoot');
  if (proofBase) {
    return proofBase;
  }

  return `synthetic:round:${hashRoundCommitRound(input.round)}`;
};

const resolvePostStateRoot = (input: RoundCommitBuildInput, proofs?: RoundCommitProof[]): string | undefined => {
  const explicitPost =
    typeof input.postStateRoot === 'string' && input.postStateRoot.trim().length > 0
      ? input.postStateRoot.trim()
      : undefined;
  if (explicitPost) {
    return explicitPost;
  }

  return findLastProofRoot(proofs, 'newRoot');
};

export const buildRoundStateCommitment = (
  input: RoundStateCommitmentBuildInput
): RoundStateCommitmentHint | undefined => {
  const extractedStateHints = extractRoundCommitStateHints(input.round);
  const proofs = normalizeProofs([...(extractedStateHints.proofs ?? []), ...(input.proofs ?? [])]);
  const touchedEntityIds = normalizeTouchedEntityIds(input.round, [
    ...(extractedStateHints.touchedEntityIds ?? []),
    ...(input.touchedEntityIds ?? []),
  ]);
  const insertedEntityIds = normalizeInsertedEntityIds([
    ...(extractedStateHints.insertedEntityIds ?? []),
    ...(input.insertedEntityIds ?? []),
    ...((proofs ?? [])
      .filter((proof) => proof.transitionKind === 'insert')
      .map((proof) => `${proof.entityType}:${proof.entityId}`) ?? []),
  ]);
  const transitionSummary = summarizeRoundCommitTransitionEntityIds({
    insertedEntityIds,
    importedEntityIds: [...(extractedStateHints.importedEntityIds ?? []), ...(input.importedEntityIds ?? [])],
    updatedEntityIds: [...(extractedStateHints.updatedEntityIds ?? []), ...(input.updatedEntityIds ?? [])],
    deletedEntityIds: [...(extractedStateHints.deletedEntityIds ?? []), ...(input.deletedEntityIds ?? [])],
    proofs,
  });
  const importedEntityIds = transitionSummary.importedEntityIds;
  const updatedEntityIds = transitionSummary.updatedEntityIds;
  const deletedEntityIds = transitionSummary.deletedEntityIds;
  const clientTouchedEntityIds = collectClientTouchedEntityIds(input.round);
  const proofEntityIds = proofs?.map((proof) => `${proof.entityType}:${proof.entityId}`);
  const explicitSnapshotEntityIds = normalizeSnapshotEntityIds([
    ...(extractedStateHints.snapshotEntityIds ?? []),
    ...(input.snapshotEntityIds ?? []),
  ]);
  const leafHashes = normalizeLeafHashes({
    ...(extractedStateHints.leafHashes ?? {}),
    ...(input.leafHashes ?? {}),
  });
  const branchWitnesses = normalizeBranchWitnesses([
    ...(extractedStateHints.branchWitnesses ?? []),
    ...(input.branchWitnesses ?? []),
  ]);
  const snapshotEntityIds =
    explicitSnapshotEntityIds ??
    (clientTouchedEntityIds.length === 0 ? normalizeSnapshotEntityIds(proofEntityIds) : undefined);
  const baseStateRoot =
    (typeof input.baseStateRoot === 'string' && input.baseStateRoot.trim().length > 0
      ? input.baseStateRoot.trim()
      : extractedStateHints.baseStateRoot?.trim()) ??
    findFirstProofRoot(proofs, 'oldRoot');
  const postStateRoot = resolvePostStateRoot(
    {
      gameKey: '',
      shardId: '',
      round: input.round,
      baseStateRoot: input.baseStateRoot,
      postStateRoot: input.postStateRoot ?? extractedStateHints.postStateRoot,
      touchedEntityIds: input.touchedEntityIds,
      proofs,
    },
    proofs
  );

  if (
    !baseStateRoot &&
    !postStateRoot &&
    !touchedEntityIds &&
    !insertedEntityIds &&
    !importedEntityIds &&
    !updatedEntityIds &&
    !deletedEntityIds &&
    !snapshotEntityIds &&
    !leafHashes &&
    !branchWitnesses &&
    !proofs
  ) {
    return undefined;
  }

  return roundStateCommitmentHintSchema.parse({
    ...(baseStateRoot ? { baseStateRoot } : {}),
    ...(postStateRoot ? { postStateRoot } : {}),
    ...(touchedEntityIds ? { touchedEntityIds } : {}),
    ...(insertedEntityIds ? { insertedEntityIds } : {}),
    ...(importedEntityIds ? { importedEntityIds } : {}),
    ...(updatedEntityIds ? { updatedEntityIds } : {}),
    ...(deletedEntityIds ? { deletedEntityIds } : {}),
    ...(snapshotEntityIds ? { snapshotEntityIds } : {}),
    ...(leafHashes ? { leafHashes } : {}),
    ...(branchWitnesses ? { branchWitnesses } : {}),
    ...(proofs ? { proofs } : {}),
  });
};

export const buildRoundCommitSignaturePayload = (
  envelope: Omit<z.infer<typeof roundCommitEnvelopeSchema>, 'signature'>
) => ({
  version: envelope.version,
  gameKey: envelope.gameKey,
  branchId: envelope.branchId,
  roundId: envelope.roundId,
  baseStateRoot: envelope.baseStateRoot,
  roundHash: envelope.roundHash,
  patchSetHash: envelope.patchSetHash,
  eventsHash: envelope.eventsHash,
  ...(envelope.postStateRoot ? { postStateRoot: envelope.postStateRoot } : {}),
  ...(Array.isArray(envelope.touchedEntityIds) ? { touchedEntityIds: [...envelope.touchedEntityIds] } : {}),
  ...(Array.isArray(envelope.insertedEntityIds) ? { insertedEntityIds: [...envelope.insertedEntityIds] } : {}),
  ...(Array.isArray(envelope.importedEntityIds) ? { importedEntityIds: [...envelope.importedEntityIds] } : {}),
  ...(Array.isArray(envelope.updatedEntityIds) ? { updatedEntityIds: [...envelope.updatedEntityIds] } : {}),
  ...(Array.isArray(envelope.deletedEntityIds) ? { deletedEntityIds: [...envelope.deletedEntityIds] } : {}),
  ...(Array.isArray(envelope.snapshotEntityIds) ? { snapshotEntityIds: [...envelope.snapshotEntityIds] } : {}),
  ...(envelope.leafHashes ? { leafHashes: normalizeLeafHashes(envelope.leafHashes) } : {}),
  ...(Array.isArray(envelope.branchWitnesses) ? { branchWitnesses: normalizeBranchWitnesses(envelope.branchWitnesses) } : {}),
  ...(Array.isArray(envelope.proofs)
    ? {
        proofs: envelope.proofs.map((proof) => ({
          kind: proof.kind,
          entityType: proof.entityType,
          entityId: proof.entityId,
          ...(proof.transitionKind ? { transitionKind: proof.transitionKind } : {}),
          ...(proof.transitionSource ? { transitionSource: proof.transitionSource } : {}),
          ...(proof.oldRoot ? { oldRoot: proof.oldRoot } : {}),
          ...(proof.newRoot ? { newRoot: proof.newRoot } : {}),
          ...(proof.publicSignals ? { publicSignals: proof.publicSignals } : {}),
          ...(proof.proof ? { proof: proof.proof } : {}),
        })),
      }
    : {}),
});

export const buildRoundCommitExpectedMessage = (commit: RoundCommitEnvelope | RoundCommitEnvelopeDraft): string =>
  hashDeterministic(buildRoundCommitSignaturePayload(commit));

export const buildRoundCommitEnvelope = (input: RoundCommitBuildInput): RoundCommitEnvelopeDraft => {
  const stateCommitment = buildRoundStateCommitment(input);
  const proofs = normalizeProofs(stateCommitment?.proofs);
  const roundHash = hashRoundCommitRound(input.round);
  const postStateRoot = stateCommitment?.postStateRoot;
  const touchedEntityIds = stateCommitment?.touchedEntityIds;
  const insertedEntityIds = stateCommitment?.insertedEntityIds;
  const importedEntityIds = stateCommitment?.importedEntityIds;
  const updatedEntityIds = stateCommitment?.updatedEntityIds;
  const deletedEntityIds = stateCommitment?.deletedEntityIds;
  const snapshotEntityIds = stateCommitment?.snapshotEntityIds;
  const leafHashes = stateCommitment?.leafHashes;
  const branchWitnesses = stateCommitment?.branchWitnesses;

  return {
    version: 1,
    gameKey: input.gameKey,
    branchId: input.shardId,
    roundId: String(input.round?.id ?? ''),
    baseStateRoot: resolveBaseStateRoot(
      {
        ...input,
        baseStateRoot: input.baseStateRoot ?? stateCommitment?.baseStateRoot,
      },
      proofs
    ),
    roundHash,
    patchSetHash: hashRoundCommitPatchSet(input.round),
    eventsHash: hashRoundCommitEvents(input.round),
    ...(postStateRoot ? { postStateRoot } : {}),
    ...(touchedEntityIds ? { touchedEntityIds } : {}),
    ...(insertedEntityIds ? { insertedEntityIds } : {}),
    ...(importedEntityIds ? { importedEntityIds } : {}),
    ...(updatedEntityIds ? { updatedEntityIds } : {}),
    ...(deletedEntityIds ? { deletedEntityIds } : {}),
    ...(snapshotEntityIds ? { snapshotEntityIds } : {}),
    ...(leafHashes ? { leafHashes } : {}),
    ...(branchWitnesses ? { branchWitnesses } : {}),
    ...(proofs ? { proofs } : {}),
  };
};

export const buildSignedRoundCommitEnvelope = async (
  input: RoundCommitBuildInput,
  signer: RoundCommitSigner
): Promise<RoundCommitEnvelope> => {
  const envelope = buildRoundCommitEnvelope(input);
  const message = buildRoundCommitExpectedMessage(envelope);
  const signature = await signer(message);

  if (!signature || !signature.address || !signature.hash) {
    throw new Error('Failed to sign round commit envelope');
  }

  return roundCommitEnvelopeSchema.parse({
    ...envelope,
    signature: {
      address: signature.address,
      hash: signature.hash,
      data: signature.data ?? message,
    },
  });
};

export type RoundCommitEnvelope = z.infer<typeof roundCommitEnvelopeSchema>;
export type RoundCommitProof = z.infer<typeof roundCommitProofSchema>;
export type RoundCommitBranchWitness = z.infer<typeof roundCommitBranchWitnessSchema>;
export type SaveRoundInput = z.infer<typeof saveRoundInputSchema>;
export type SaveRoundResult = z.infer<typeof saveRoundResultSchema>;
