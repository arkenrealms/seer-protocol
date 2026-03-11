import type { NovelContributor, NovelHistoryEntry, NovelPassage } from './novelist.project';
export type * from './novelist.router';
export type { RouterContext } from '../types';

export type {
  NovelCanvasEdge,
  NovelCanvasNode,
  NovelChapter,
  NovelConflict,
  NovelContributor,
  NovelHistoryEntry,
  NovelMetrics,
  NovelMonetization,
  NovelPage,
  NovelPassage,
  NovelProject,
  PlotNodeData,
} from './novelist.project';

export type RevisionMode = 'replace' | 'expand' | 'tighten' | 'bridge' | 'continuity';

export type NovelistRole = 'owner' | 'editor' | 'reviewer' | 'viewer';

export type NovelistProjectMode = 'lore' | 'novel';

export type ProposalStatus = 'accepted' | 'queued' | 'rejected' | 'stale';

export type RevisionDecisionState = 'accepted' | 'rejected';

export type SnapshotScope = 'chapter' | 'project' | 'scene';

export type GraphEntityKind =
  | 'artifact'
  | 'character'
  | 'dynasty'
  | 'faction'
  | 'motif'
  | 'npc'
  | 'plotline'
  | 'quest'
  | 'zone';

export type GraphNodeSource = 'canon' | 'explicit' | 'inferred';

export type CanonCatalogSource = 'canon' | 'graph' | 'source';

export type AnalysisDepth = 'pro' | 'standard';

export type ConflictSeverity = 'critical' | 'info' | 'warning';

export type ExportFormat = 'epub' | 'omniverse' | 'pdf';

export type ExportJobStatus = 'failed' | 'processing' | 'queued' | 'ready';

export type EditionStatus = 'blocked' | 'draft' | 'ready';

export type CommentScope = 'conflict' | 'passage' | 'proposal' | 'scene';

export type NovelistPresenceSurface = 'analysis' | 'canvas' | 'contributors' | 'history' | 'manuscript';

export type NovelistPresenceReviewTargetKind = 'conflict' | 'proposal';

export type NovelistPresenceSelectionState = 'cursor' | 'selection';

export type CanonConflictVoteChoice = 'dismiss' | 'merge' | 'relink';

export type ConflictResolutionSource = 'manual' | 'vote_threshold';

export type NovelistActivityRecordKind =
  | 'canon_conflict_resolved'
  | 'canon_conflict_voted'
  | 'edition_price_updated'
  | 'edition_royalty_approved'
  | 'edition_royalty_locked'
  | 'edition_share_updated'
  | 'graph_node_added'
  | 'snapshot_restored';

export type NovelistActor = {
  accent: string;
  id: string;
  initials: string;
  isPrivileged: boolean;
  name: string;
  permissionRole: NovelistRole;
  role: string;
  source: 'contributor' | 'guest' | 'profile';
};

export type ChapterRecord = {
  beat: string;
  id: string;
  sceneIds: string[];
  title: string;
};

export type SceneRecord = {
  chapterId: string;
  id: string;
  pageNumber: number;
  passageIds: string[];
  status: 'drafting' | 'locked' | 'outline' | 'review';
  summary: string;
  title: string;
};

export type PassageRecord = {
  canonTags?: string[];
  characterVoice?: string;
  id: string;
  sceneId: string;
  text: string;
};

export type RevisionProposal = {
  actor: NovelistActor;
  affectedEntityIds: string[];
  confidence: number;
  contextWindow: string[];
  createdAt: string;
  generatedText: string;
  id: string;
  instruction: string;
  isPlaceholder: boolean;
  mode: RevisionMode;
  pageNumber: number;
  passageId: string | null;
  rationale: string;
  sceneId: string;
  snapshotFingerprint: string;
  status: ProposalStatus;
  targetText: string;
  warnings: string[];
};

export type RevisionDecision = {
  createdAt: string;
  decision: RevisionDecisionState;
  id: string;
  nextText: string | null;
  previousText: string;
  proposalId: string;
  reviewer: NovelistActor;
  reviewerNote?: string;
  wordDelta: {
    additions: number;
    removals: number;
    replacements: number;
  };
};

export type SnapshotRecord = {
  createdAt: string;
  createdBy: NovelistActor;
  id: string;
  label: string;
  pageNumber: number;
  passages: Array<{
    passageId: string;
    text: string;
  }>;
  scope: SnapshotScope;
  scopeId: string;
};

export type GraphEntityNode = {
  accent: string;
  canonId?: string;
  detail: string;
  id: string;
  kind: GraphEntityKind;
  label: string;
  references: string[];
  sceneIds: string[];
  source: GraphNodeSource;
  x?: number;
  y?: number;
};

export type GraphMentionEdge = {
  confidence: number;
  id: string;
  paragraphIndex: number;
  passageId: string;
  provenance: string;
  sceneId: string;
  source: 'explicit' | 'inferred';
  sourceNodeId: string;
  targetSceneId: string;
};

export type CanonCatalogItem = {
  canonId?: string;
  catalogSource: CanonCatalogSource;
  detail?: string;
  id: string;
  kind: GraphEntityKind;
  label: string;
};

export type NovelAnalysisMetrics = {
  characterPresence: number;
  genre: string;
  genreConfidence: number;
  pacing: number;
  plagiarismScore: number;
  readingGrade: number;
  repetition: number;
  vocabularyDepth: number;
};

export type ConflictVoteRecord = {
  actor: NovelistActor;
  conflictId: string;
  createdAt: string;
  id: string;
  pageNumber?: number;
  vote: CanonConflictVoteChoice;
};

export type ConflictVoteSummary = {
  counts: {
    dismiss: number;
    merge: number;
    relink: number;
  };
  eligibleVoterCount: number;
  eligibleWeight: number;
  leadingVote: CanonConflictVoteChoice | null;
  leadingWeight: number;
  requiredVoteCount: number;
  requiredWeight: number;
  resolutionVote: CanonConflictVoteChoice | null;
  total: number;
  updatedAt: string | null;
  weightedCounts: {
    dismiss: number;
    merge: number;
    relink: number;
  };
};

export type NovelistConflict = {
  chapter: string;
  detail: string;
  id: string;
  resolutionContext?: {
    existingNodeId: string;
    incomingNode: GraphEntityNode;
    kind: 'canon_link';
  };
  severity: ConflictSeverity;
  source: 'canon' | 'heuristic' | 'seed';
  status: 'dismissed' | 'open';
  title: string;
  voteSummary: ConflictVoteSummary;
  votes: ConflictVoteRecord[];
};

export type CanonConflictComparison = {
  currentLines: string[];
  deltas: string[];
  incomingLines: string[];
  mergeImpact: {
    badgeLabels: string[];
    edgeCount: number;
    edgeMode: 'preserved' | 'rewired';
    nodeIdentity: 'kept' | 'replaced';
  };
  mergePreview: string[];
  relinkImpact: {
    badgeLabels: string[];
    edgeCount: number;
    edgeMode: 'preserved' | 'rewired';
    nodeIdentity: 'kept' | 'replaced';
  };
  relinkPreview: string[];
};

export type AnalysisRunRecord = {
  conflicts: NovelistConflict[];
  createdAt: string;
  createdBy: NovelistActor;
  depth: AnalysisDepth;
  id: string;
  isPlaceholder: boolean;
  metrics: NovelAnalysisMetrics;
  notes: string[];
  status: 'completed' | 'queued';
};

export type EditionRoyaltyShare = {
  contributorId: string;
  overrideReason: string | null;
  share: number;
};

export type ExportJobRecord = {
  createdAt: string;
  editionId: string;
  format: ExportFormat;
  id: string;
  isPlaceholder: boolean;
  label: string;
  requestedBy: NovelistActor;
  snapshotId: string;
  status: ExportJobStatus;
};

export type EditionRecord = {
  blockers: string[];
  exportJobs: ExportJobRecord[];
  id: string;
  priceUsd: number;
  royaltyApprovalRequired: boolean;
  royaltyApprovedAt: string | null;
  royaltyApprovedBy: NovelistActor | null;
  royaltyLocked: boolean;
  royaltyShares: EditionRoyaltyShare[];
  snapshotId: string | null;
  status: EditionStatus;
  subtitle: string;
  title: string;
  updatedAt: string;
};

export type CommentRecord = {
  createdAt: string;
  createdBy: NovelistActor;
  id: string;
  scope: CommentScope;
  scopeId: string;
  text: string;
};

export type ConflictDismissalRecord = {
  actor: NovelistActor;
  conflictId: string;
  createdAt: string;
  id: string;
  pageNumber: number;
  resolutionSource?: ConflictResolutionSource;
  title: string;
  vote?: CanonConflictVoteChoice;
};

export type NovelistActivityRecord = {
  actor: NovelistActor;
  canonComparison?: CanonConflictComparison;
  conflictId?: string;
  createdAt: string;
  detail?: string;
  id: string;
  kind: NovelistActivityRecordKind;
  label: string;
  pageNumber?: number;
  resolution?: 'merge' | 'relink';
  resolutionSource?: ConflictResolutionSource;
  vote?: CanonConflictVoteChoice;
};

export type NovelProjectDocument = {
  activity: NovelistActivityRecord[];
  analysisRuns: AnalysisRunRecord[];
  baseVersion: number;
  canonSources: string[];
  chapterIds: string[];
  chapters: Record<string, ChapterRecord>;
  collaboratorRoles: Record<string, NovelistRole>;
  comments: CommentRecord[];
  conflictDismissals: ConflictDismissalRecord[];
  conflictVotes: ConflictVoteRecord[];
  decisions: RevisionDecision[];
  derivedConflicts: NovelistConflict[];
  dismissedConflictIds: string[];
  editions: EditionRecord[];
  graph: {
    explicitEdges: Array<{
      id: string;
      label?: string;
      source: string;
      target: string;
    }>;
    mentionEdges: GraphMentionEdge[];
    nodes: GraphEntityNode[];
  };
  mode: NovelistProjectMode;
  passages: Record<string, PassageRecord>;
  projectDescription: string;
  projectId: string;
  proposals: RevisionProposal[];
  scenes: Record<string, SceneRecord>;
  snapshots: SnapshotRecord[];
  subtitle: string;
  tags: string[];
  title: string;
  updatedAt: string;
};

export type NovelistProjectSession = {
  currentPageNumber: number;
  document: NovelProjectDocument;
};

export type NovelistWorkspace = {
  selectedProjectId: string;
  sessions: Record<string, NovelistProjectSession>;
};

export type NovelistProjectOperation =
  | {
      proposal: RevisionProposal;
      type: 'queue_proposal';
    }
  | {
      proposalId: string;
      reviewer: NovelistActor;
      reviewerNote?: string;
      type: 'accept_proposal';
    }
  | {
      proposalId: string;
      reviewer: NovelistActor;
      reviewerNote?: string;
      type: 'reject_proposal';
    }
  | {
      actor: NovelistActor;
      conflict: {
        chapter: string;
        detail: string;
        id: string;
        severity: ConflictSeverity;
        title: string;
      };
      pageNumber: number;
      type: 'dismiss_conflict';
    }
  | {
      actor: NovelistActor;
      conflictId: string;
      pageNumber?: number;
      resolution: 'merge' | 'relink';
      type: 'resolve_canon_conflict';
    }
  | {
      actor: NovelistActor;
      conflictId: string;
      pageNumber?: number;
      vote: CanonConflictVoteChoice;
      type: 'vote_canon_conflict';
    }
  | {
      run: AnalysisRunRecord;
      type: 'append_analysis_run';
    }
  | {
      actor: NovelistActor;
      label: string;
      pageNumber: number;
      scope: SnapshotScope;
      scopeId: string;
      type: 'create_snapshot';
    }
  | {
      actor: NovelistActor;
      snapshotId: string;
      type: 'restore_snapshot';
    }
  | {
      actor: NovelistActor;
      format: ExportFormat;
      label: string;
      snapshotId: string;
      type: 'add_export_job';
    }
  | {
      comment: CommentRecord;
      type: 'add_comment';
    }
  | {
      actor: NovelistActor;
      node: GraphEntityNode;
      pageNumber?: number;
      type: 'add_graph_node';
    }
  | {
      actor: NovelistActor;
      priceUsd: number;
      type: 'update_edition_price';
    }
  | {
      actor: NovelistActor;
      contributorName: string;
      contributorId: string;
      overrideReason: string | null;
      share: number;
      type: 'update_edition_share';
    }
  | {
      actor: NovelistActor;
      type: 'approve_edition_royalties';
    }
  | {
      actor: NovelistActor;
      locked: boolean;
      type: 'set_edition_royalty_locked';
    };

export type NovelistProjectLoadResult = {
  derived: NovelistDerivedProjectView;
  loadedAt: string;
  projectId: string;
  session: NovelistProjectSession;
  source: string;
};

export type NovelistProjectSyncResult = NovelistProjectLoadResult;

export type NovelistPresenceMember = {
  actor: NovelistActor;
  connectedAt: string;
  focusMode: boolean;
  pageNumber: number | null;
  passageId: string | null;
  reviewTargetId: string | null;
  reviewTargetKind: NovelistPresenceReviewTargetKind | null;
  selectionEnd: number | null;
  selectionPreview: string | null;
  selectionStart: number | null;
  selectionState: NovelistPresenceSelectionState | null;
  sceneId: string | null;
  socketId: string;
  surface: NovelistPresenceSurface;
  updatedAt: string;
};

export type NovelistUpdatePresenceInput = {
  active?: boolean;
  focusMode?: boolean;
  pageNumber?: number | null;
  passageId?: string | null;
  projectId: string;
  reviewTargetId?: string | null;
  reviewTargetKind?: NovelistPresenceReviewTargetKind | null;
  selectionEnd?: number | null;
  selectionPreview?: string | null;
  selectionStart?: number | null;
  selectionState?: NovelistPresenceSelectionState | null;
  sceneId?: string | null;
  surface?: NovelistPresenceSurface;
};

export type NovelistUpdatePresenceResult = {
  members: NovelistPresenceMember[];
  ok: boolean;
  projectId: string;
  updatedAt: string;
};

export type NovelistProjectSyncReason =
  | 'analysis_run'
  | 'comment_added'
  | 'conflict_dismissed'
  | 'conflict_voted'
  | 'edition_updated'
  | 'export_queued'
  | 'graph_updated'
  | 'project_saved'
  | 'proposal_queued'
  | 'proposal_resolved'
  | 'snapshot_created'
  | 'snapshot_restored';

export type NovelistRealtimeEvent =
  | {
      emittedAt: string;
      members: NovelistPresenceMember[];
      projectId: string;
      type: 'presence';
    }
  | {
      actor: NovelistActor | null;
      emittedAt: string;
      projectId: string;
      reason: NovelistProjectSyncReason;
      sync: NovelistProjectSyncResult;
      type: 'project_sync';
    };

export type NovelistProjectSaveResult = {
  appliedOperations: number;
  conflict: null | {
    currentBaseVersion: number;
    reason: 'base_version_conflict';
  };
  derived: NovelistDerivedProjectView;
  loadedAt: string;
  nextVersion: number;
  ok: boolean;
  projectId: string;
  session: NovelistProjectSession;
  source: string;
};

export type NovelistGenerateRevisionInput = {
  contextWindow: string[];
  instruction: string;
  mode: RevisionMode;
  passageId?: string | null;
  projectId: string;
  sceneId: string;
  targetText: string;
};

export type NovelistGenerateRevisionResult = NovelistProjectSyncResult & {
  proposal: RevisionProposal;
};

export type NovelistResolveRevisionInput = {
  action: 'accept' | 'reject';
  projectId: string;
  reviewerNote?: string;
  revisionId: string;
};

export type NovelistResolveRevisionResult = NovelistProjectSyncResult & {
  action: 'accept' | 'reject';
  decision: RevisionDecision;
  proposal: RevisionProposal;
};

export type NovelistCreateSnapshotInput = {
  label: string;
  projectId: string;
  scope: SnapshotScope;
};

export type NovelistCreateSnapshotResult = {
  snapshot: SnapshotRecord;
} & NovelistProjectSyncResult;

export type NovelistRestoreSnapshotInput = {
  projectId: string;
  snapshotId: string;
};

export type NovelistRestoreSnapshotResult = {
  activity: NovelistActivityRecord;
  snapshot: SnapshotRecord;
} & NovelistProjectSyncResult;

export type NovelistRunAnalysisConflict = {
  chapter: string;
  detail: string;
  id: string;
  severity: ConflictSeverity;
  title: string;
};

export type NovelistRunAnalysisInput = {
  depth: AnalysisDepth;
  projectId: string;
};

export type NovelistRunAnalysisResult = NovelistProjectSyncResult & {
  run: AnalysisRunRecord;
};

export type NovelistExportEditionInput = {
  editionId: string;
  format: ExportFormat;
  projectId: string;
  snapshotId: string;
};

export type NovelistExportEditionResult = NovelistProjectSyncResult & {
  job: ExportJobRecord;
};

export type NovelistAiJob = {
  actorId: string;
  actorName: string;
  confidence: number;
  createdAt: string;
  id: string;
  instruction: string;
  isPlaceholder: boolean;
  isStale: boolean;
  mode: RevisionMode;
  pageNumber: number;
  passageId: string | null;
  rationale: string;
  sceneId: string;
  status: ProposalStatus;
  targetText: string;
  text: string;
  warnings: string[];
};

export type StudioOperation = {
  actorId: string;
  actorName: string;
  canonComparison?: CanonConflictComparison;
  createdAt: string;
  detail?: string;
  id: string;
  impactBadges?: string[];
  kind: 'analysis' | 'comment' | 'conflict' | 'edition' | 'export' | 'graph' | 'proposal' | 'review' | 'snapshot';
  label: string;
  pageNumber?: number;
  scope?: string;
  sortAt: string;
  status?: string;
};

export type NovelistReviewKind = 'comment' | 'conflict' | 'edition' | 'proposal';

export type NovelistReviewFilter = 'all' | NovelistReviewKind;

export type NovelistReviewItem = {
  actionable: boolean;
  afterText?: string;
  actorName?: string;
  beforeText?: string;
  canonComparison?: CanonConflictComparison;
  conflictVoteSummary?: ConflictVoteSummary;
  conflictVotes?: ConflictVoteRecord[];
  confidence?: number;
  createdAt?: string;
  detail: string;
  id: string;
  isPlaceholder?: boolean;
  kind: NovelistReviewKind;
  pageNumber?: number;
  rationale?: string;
  referenceId?: string;
  resolutionKey?: 'approve_royalties' | 'create_snapshot' | 'lock_royalties' | 'show_conflicts' | 'show_proposals';
  scope: string;
  sortAt: string;
  status: string;
  title: string;
  warnings?: string[];
};

export type NovelistPermissionFlags = {
  canApproveRoyalties: boolean;
  canComment: boolean;
  canDismissConflicts: boolean;
  canLockRoyalties: boolean;
  canManagePricing: boolean;
  canPublish: boolean;
  canQueueRevisions: boolean;
  canResolveRevisions: boolean;
  canRunProAnalysis: boolean;
  canVoteConflicts: boolean;
};

export type NovelistContributorStats = NovelContributor & {
  acceptedRevisions: number;
  acceptedWordFootprint: number;
  analysisRuns: number;
  conflictResolutions: number;
  exportsRequested: number;
  isDynamic?: boolean;
  permissionRole: NovelistRole;
  queuedRevisions: number;
  rejectedRevisions: number;
  reviewApprovals: number;
  suggestedShare: number;
};

export type NovelistHistoryItem = {
  authorId: string;
  candidateText?: string;
  changedAt: string;
  changeType: NovelHistoryEntry['changeType'];
  id: string;
  kind: 'decision' | 'proposal' | 'seed' | 'snapshot';
  pageNumber: number;
  previousText?: string;
  reviewerNote?: string;
  scope: string;
  snapshotId?: string;
  snapshotPassages?: NovelPassage[];
  status?: ProposalStatus | RevisionDecisionState;
  summary: string;
  version: string;
  wordDelta?: RevisionDecision['wordDelta'];
};

export type NovelistPublishState = {
  activeEdition: EditionRecord | null;
  blockers: string[];
  isReady: boolean;
  latestSnapshot: SnapshotRecord | null;
};

export type NovelistDerivedProjectView = {
  analysis: AnalysisRunRecord | null;
  historyEntries: NovelistHistoryItem[];
  publishState: NovelistPublishState;
  reviewItems: NovelistReviewItem[];
  studioOperations: StudioOperation[];
  visibleConflicts: NovelistConflict[];
};

export type LegacyRevisionProposalPayload = {
  isPlaceholder: boolean;
  rationale: string;
  text: string;
};

export type LegacyNovelistRevisionEvent = {
  actor: NovelistActor;
  createdAt: string;
  id: string;
  mode: RevisionMode;
  pageId: string;
  pageNumber: number;
  passageId: string | null;
  prompt: string;
  proposal: LegacyRevisionProposalPayload;
  snapshotPassages: NovelPassage[];
  target: string;
  type: 'revision_queued';
};

export type LegacyNovelistRevisionAppliedEvent = {
  actor: NovelistActor;
  createdAt: string;
  id: string;
  isPlaceholder: boolean;
  mode: RevisionMode;
  pageId: string;
  pageNumber: number;
  passageId: string | null;
  prompt: string;
  proposalActor: NovelistActor;
  proposalText: string;
  replacedWordCount: number;
  resultPassages: NovelPassage[];
  revisionId: string;
  snapshotPassages: NovelPassage[];
  target: string;
  type: 'revision_applied';
  wordDelta: {
    additions: number;
    removals: number;
    replacements: number;
  };
};

export type LegacyNovelistRevisionRejectedEvent = {
  actor: NovelistActor;
  createdAt: string;
  id: string;
  mode: RevisionMode;
  pageId: string;
  pageNumber: number;
  prompt: string;
  proposalActor: NovelistActor;
  revisionId: string;
  type: 'revision_rejected';
};

export type LegacyNovelistConflictDismissedEvent = {
  actor: NovelistActor;
  conflictId: string;
  conflictTitle: string;
  createdAt: string;
  id: string;
  pageNumber: number;
  snapshotPassages: NovelPassage[];
  type: 'conflict_dismissed';
};

export type LegacyNovelistAnalysisRequestedEvent = {
  actor: NovelistActor;
  createdAt: string;
  id: string;
  kind: 'plagiarism_scan';
  label: string;
  type: 'analysis_requested';
};

export type LegacyNovelistExportRequestedEvent = {
  actor: NovelistActor;
  createdAt: string;
  format: 'epub' | 'pdf';
  id: string;
  label: string;
  type: 'export_requested';
};

export type LegacyNovelistEvent =
  | LegacyNovelistRevisionEvent
  | LegacyNovelistRevisionAppliedEvent
  | LegacyNovelistRevisionRejectedEvent
  | LegacyNovelistConflictDismissedEvent
  | LegacyNovelistAnalysisRequestedEvent
  | LegacyNovelistExportRequestedEvent;

export type LegacyNovelistProjectSession = {
  events: LegacyNovelistEvent[];
  pageNumber: number;
};

export type LegacyNovelistWorkspace = {
  selectedProjectId: string;
  sessions: Record<string, LegacyNovelistProjectSession>;
};
