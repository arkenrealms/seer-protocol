import { z } from 'zod';
import type {
  AnalysisRunRecord,
  CanonCatalogItem,
  ExportJobRecord,
  GraphEntityKind,
  NovelistActivityRecord,
  NovelistCreateSnapshotInput,
  NovelistCreateSnapshotResult,
  NovelistDerivedProjectView,
  NovelistExportEditionInput,
  NovelistExportEditionResult,
  NovelistGenerateRevisionInput,
  NovelistGenerateRevisionResult,
  NovelistProjectLoadResult,
  NovelistProjectOperation,
  NovelistProjectSaveResult,
  NovelistProjectSession,
  NovelistResolveRevisionInput,
  NovelistResolveRevisionResult,
  NovelistRestoreSnapshotInput,
  NovelistRestoreSnapshotResult,
  NovelistUpdatePresenceInput,
  NovelistUpdatePresenceResult,
  NovelistRunAnalysisInput,
  NovelistRunAnalysisResult,
  SnapshotRecord,
} from './novelist.types';

export const NovelistProjectSessionSchema = z.object({
  currentPageNumber: z.number(),
  document: z.custom<NovelistProjectSession['document']>(),
}) as z.ZodType<NovelistProjectSession>;

export const NovelistDerivedProjectViewSchema = z.object({
  analysis: z.custom<NovelistDerivedProjectView['analysis']>().nullable(),
  historyEntries: z.array(z.custom<NovelistDerivedProjectView['historyEntries'][number]>()),
  publishState: z.custom<NovelistDerivedProjectView['publishState']>(),
  reviewItems: z.array(z.custom<NovelistDerivedProjectView['reviewItems'][number]>()),
  studioOperations: z.array(z.custom<NovelistDerivedProjectView['studioOperations'][number]>()),
  visibleConflicts: z.array(z.custom<NovelistDerivedProjectView['visibleConflicts'][number]>()),
}) as z.ZodType<NovelistDerivedProjectView>;

export const NovelistProjectIdInput = z.object({
  projectId: z.string().trim().min(1),
});

export const NovelistProjectLoadResultSchema = z.object({
  derived: NovelistDerivedProjectViewSchema,
  loadedAt: z.string(),
  projectId: z.string(),
  session: NovelistProjectSessionSchema,
  source: z.string(),
}) as z.ZodType<NovelistProjectLoadResult>;

export const NovelistUpdatePresenceInputSchema = z.object({
  active: z.boolean().optional(),
  focusMode: z.boolean().optional(),
  pageNumber: z.number().int().positive().nullable().optional(),
  passageId: z.string().trim().min(1).nullable().optional(),
  projectId: z.string().trim().min(1),
  reviewTargetId: z.string().trim().min(1).nullable().optional(),
  reviewTargetKind: z.enum(['conflict', 'proposal']).nullable().optional(),
  selectionEnd: z.number().int().min(0).nullable().optional(),
  selectionPreview: z.string().trim().min(1).nullable().optional(),
  selectionStart: z.number().int().min(0).nullable().optional(),
  selectionState: z.enum(['cursor', 'selection']).nullable().optional(),
  sceneId: z.string().trim().min(1).nullable().optional(),
  surface: z.enum(['analysis', 'canvas', 'contributors', 'history', 'manuscript']).optional(),
}) as z.ZodType<NovelistUpdatePresenceInput>;

export const NovelistUpdatePresenceResultSchema = z.object({
  members: z.array(z.custom<NovelistUpdatePresenceResult['members'][number]>()),
  ok: z.boolean(),
  projectId: z.string(),
  updatedAt: z.string(),
}) as z.ZodType<NovelistUpdatePresenceResult>;

export const NovelistProjectOperationSchema = z.custom<NovelistProjectOperation>();

export const NovelistProjectSaveInput = z.object({
  baseVersion: z.number().int().positive(),
  operations: z.array(NovelistProjectOperationSchema),
  projectId: z.string().trim().min(1),
});

export const NovelistProjectSaveResultSchema = z.object({
  appliedOperations: z.number().int().nonnegative(),
  conflict: z
    .object({
      currentBaseVersion: z.number().int().positive(),
      reason: z.literal('base_version_conflict'),
    })
    .nullable(),
  derived: NovelistDerivedProjectViewSchema,
  loadedAt: z.string(),
  nextVersion: z.number().int().positive(),
  ok: z.boolean(),
  projectId: z.string(),
  session: NovelistProjectSessionSchema,
  source: z.string(),
}) as z.ZodType<NovelistProjectSaveResult>;

export const NovelistGenerateRevisionInputSchema = z.object({
  contextWindow: z.array(z.string()).default([]),
  instruction: z.string(),
  mode: z.enum(['replace', 'expand', 'tighten', 'bridge', 'continuity']),
  passageId: z.string().nullable().optional(),
  projectId: z.string().trim().min(1),
  sceneId: z.string().trim().min(1),
  targetText: z.string(),
}) as z.ZodType<NovelistGenerateRevisionInput>;

export const NovelistGenerateRevisionResultSchema = z.object({
  derived: NovelistDerivedProjectViewSchema,
  loadedAt: z.string(),
  projectId: z.string(),
  proposal: z.custom<NovelistGenerateRevisionResult['proposal']>(),
  session: NovelistProjectSessionSchema,
  source: z.string(),
}) as z.ZodType<NovelistGenerateRevisionResult>;

export const NovelistResolveRevisionInputSchema = z.object({
  action: z.enum(['accept', 'reject']),
  projectId: z.string().trim().min(1),
  reviewerNote: z.string().optional(),
  revisionId: z.string().trim().min(1),
}) as z.ZodType<NovelistResolveRevisionInput>;

export const NovelistResolveRevisionResultSchema = z.object({
  action: z.enum(['accept', 'reject']),
  decision: z.custom<NovelistResolveRevisionResult['decision']>(),
  derived: NovelistDerivedProjectViewSchema,
  loadedAt: z.string(),
  projectId: z.string(),
  proposal: z.custom<NovelistResolveRevisionResult['proposal']>(),
  session: NovelistProjectSessionSchema,
  source: z.string(),
}) as z.ZodType<NovelistResolveRevisionResult>;

export const NovelistCreateSnapshotInputSchema = z.object({
  label: z.string(),
  projectId: z.string().trim().min(1),
  scope: z.enum(['chapter', 'project', 'scene']),
}) as z.ZodType<NovelistCreateSnapshotInput>;

export const NovelistCreateSnapshotResultSchema = z.object({
  derived: NovelistDerivedProjectViewSchema,
  loadedAt: z.string(),
  projectId: z.string(),
  session: NovelistProjectSessionSchema,
  snapshot: z.custom<SnapshotRecord>(),
  source: z.string(),
}) as z.ZodType<NovelistCreateSnapshotResult>;

export const NovelistRestoreSnapshotInputSchema = z.object({
  projectId: z.string().trim().min(1),
  snapshotId: z.string().trim().min(1),
}) as z.ZodType<NovelistRestoreSnapshotInput>;

export const NovelistRestoreSnapshotResultSchema = z.object({
  activity: z.custom<NovelistActivityRecord>(),
  derived: NovelistDerivedProjectViewSchema,
  loadedAt: z.string(),
  projectId: z.string(),
  session: NovelistProjectSessionSchema,
  snapshot: z.custom<SnapshotRecord>(),
  source: z.string(),
}) as z.ZodType<NovelistRestoreSnapshotResult>;

export const NovelistRunAnalysisInputSchema = z.object({
  depth: z.enum(['pro', 'standard']),
  projectId: z.string().trim().min(1),
}) as z.ZodType<NovelistRunAnalysisInput>;

export const NovelistRunAnalysisResultSchema = z.object({
  derived: NovelistDerivedProjectViewSchema,
  loadedAt: z.string(),
  projectId: z.string(),
  run: z.custom<AnalysisRunRecord>(),
  session: NovelistProjectSessionSchema,
  source: z.string(),
}) as z.ZodType<NovelistRunAnalysisResult>;

export const NovelistExportEditionInputSchema = z.object({
  editionId: z.string().trim().min(1),
  format: z.enum(['epub', 'omniverse', 'pdf']),
  projectId: z.string().trim().min(1),
  snapshotId: z.string().trim().min(1),
}) as z.ZodType<NovelistExportEditionInput>;

export const NovelistExportEditionResultSchema = z.object({
  derived: NovelistDerivedProjectViewSchema,
  job: z.custom<ExportJobRecord>(),
  loadedAt: z.string(),
  projectId: z.string(),
  session: NovelistProjectSessionSchema,
  source: z.string(),
}) as z.ZodType<NovelistExportEditionResult>;

export const NovelistSearchCanonInput = z.object({
  kinds: z.array(z.custom<GraphEntityKind>()).optional(),
  projectId: z.string().trim().min(1),
  query: z.string().trim().min(1),
});

export const CanonCatalogItemSchema = z.object({
  canonId: z.string().optional(),
  catalogSource: z.custom<CanonCatalogItem['catalogSource']>(),
  detail: z.string().optional(),
  id: z.string(),
  kind: z.custom<GraphEntityKind>(),
  label: z.string(),
}) as z.ZodType<CanonCatalogItem>;
