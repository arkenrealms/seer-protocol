import type {
  AnalysisDepth,
  AnalysisRunRecord,
  CanonConflictComparison,
  CanonConflictVoteChoice,
  CommentRecord,
  ConflictResolutionSource,
  ConflictDismissalRecord,
  EditionRecord,
  EditionRoyaltyShare,
  ExportFormat,
  GraphEntityKind,
  GraphEntityNode,
  GraphMentionEdge,
  LegacyNovelistEvent,
  LegacyNovelistProjectSession,
  NovelProjectDocument,
  NovelistActivityRecord,
  NovelistActor,
  NovelistAiJob,
  NovelistConflict,
  NovelistContributorStats,
  NovelistDerivedProjectView,
  NovelistHistoryItem,
  NovelistPermissionFlags,
  NovelistProjectMode,
  NovelistProjectOperation,
  NovelistProjectSession,
  NovelistReviewItem,
  NovelistRole,
  PassageRecord,
  ProposalStatus,
  RevisionDecision,
  RevisionMode,
  RevisionProposal,
  SceneRecord,
  SnapshotRecord,
  SnapshotScope,
  StudioOperation,
} from './novelist.types';
import type {
  NovelCanvasEdge,
  NovelCanvasNode,
  NovelConflict,
  NovelContributor,
  NovelHistoryEntry,
  NovelPage,
  NovelPassage,
  NovelProject,
  PlotNodeData,
} from './novelist.project';

const ACTOR_ACCENTS = ['#7cc7ff', '#f0c36f', '#9fd3a8', '#ff8f9b', '#c7b3ff', '#ffb86b'];
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'arena',
  'arken',
  'as',
  'at',
  'before',
  'by',
  'every',
  'for',
  'from',
  'heart',
  'if',
  'in',
  'into',
  'is',
  'isles',
  'it',
  'its',
  'lys',
  'mira',
  'of',
  'oasis',
  'on',
  'or',
  'page',
  'signalfall',
  'so',
  'that',
  'the',
  'their',
  'then',
  'this',
  'to',
  'vault',
  'when',
  'with',
]);
const TITLE_CASE_PHRASE_PATTERN = /\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})?\b/g;

export type NovelistPage = NovelPage & {
  chapterBeat: string;
  chapterId: string;
  chapterTitle: string;
  sceneId: string;
};

type DecisionReplaySnapshot = {
  byDecisionId: Record<string, NovelPassage[]>;
};

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createEventId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeText(text: string) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

export function countWords(text: string) {
  return normalizeText(text).match(/[A-Za-z0-9'-]+/g)?.length ?? 0;
}

function splitAnalysisWords(text: string): string[] {
  return normalizeText(text).toLowerCase().match(/[a-z0-9'-]+/g) ?? ([] as string[]);
}

function clampAnalysisMetric(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getAnalysisGenre(mode: NovelistProjectMode, text: string) {
  const lower = text.toLowerCase();

  if (mode === 'lore' || /dynasty|lineage|quest|oasis|arena|isles/.test(lower)) {
    return {
      confidence: 88,
      genre: 'Mythic reference work with narrative commentary',
    };
  }

  if (/relay|lattice|archive|salvage|signal|crystal/.test(lower)) {
    return {
      confidence: 83,
      genre: 'Science fantasy drifting toward mystery',
    };
  }

  return {
    confidence: 72,
    genre: 'Collaborative speculative fiction',
  };
}

type AnalysisPassage = {
  chapter: string;
  text: string;
};

function toOpenNovelistConflict(
  conflict: NovelConflict,
  source: NovelistConflict['source']
): NovelistConflict {
  return {
    ...conflict,
    source,
    status: 'open',
    voteSummary: createEmptyConflictVoteSummary(),
    votes: [],
  };
}

function createAnalysisPassages(document: NovelProjectDocument): AnalysisPassage[] {
  return Object.values(document.scenes)
    .sort((left, right) => left.pageNumber - right.pageNumber || left.id.localeCompare(right.id))
    .flatMap((scene) =>
      getScenePassages(document, scene.id).map((passage) => ({
        chapter: document.chapters[scene.chapterId]?.title ?? scene.title,
        text: passage.text,
      }))
    );
}

function buildPlaceholderAnalysisConflicts(
  mode: NovelistProjectMode,
  passages: AnalysisPassage[],
  seedConflicts: NovelConflict[]
): NovelistConflict[] {
  const manuscript = passages.map((passage) => passage.text).join(' ');
  const lower = manuscript.toLowerCase();
  const conflicts: NovelistConflict[] = seedConflicts.map((conflict) => toOpenNovelistConflict(conflict, 'seed'));

  if (/\bheir\b/.test(lower) && /\bchild\b/.test(lower)) {
    conflicts.push(
      toOpenNovelistConflict(
        {
          chapter: passages.find((passage) => /\bheir\b/i.test(passage.text))?.chapter ?? 'Current draft',
          detail:
            'The manuscript shifts between inherited duty and biological descent. Clarify which sense is intended in this section.',
          id: 'heuristic-heir-sense',
          severity: 'warning',
          title: 'Heir terminology is carrying multiple inheritance models',
        },
        'heuristic'
      )
    );
  }

  if (/\balways\b/.test(lower) && /\bnever\b/.test(lower)) {
    conflicts.push(toOpenNovelistConflict({
      chapter: 'Current draft',
      detail: 'Absolute language is appearing alongside contradicting absolutes. This often points to continuity drift between scenes.',
      id: 'heuristic-absolute-language',
      severity: 'info',
      title: 'Absolute language may indicate continuity drift',
    }, 'heuristic'));
  }

  if (mode === 'novel' && /\blys\b/.test(lower) && /\bbefore\b/.test(lower) && /\broute\b/.test(lower)) {
    conflicts.push(toOpenNovelistConflict({
      chapter: 'Current draft',
      detail: 'Lys still appears to anticipate navigation cues before the relay supplies them. Decide whether this stays as foreshadowing.',
      id: 'heuristic-lys-route',
      severity: 'warning',
      title: 'Navigator foresight may still be leaking canon too early',
    }, 'heuristic'));
  }

  return conflicts;
}

export function createPlaceholderAnalysisRun(
  project: NovelProject,
  session: NovelistProjectSession,
  actor: NovelistActor,
  depth: AnalysisDepth
): AnalysisRunRecord {
  const passages = createAnalysisPassages(session.document);
  const manuscript = passages.map((passage) => passage.text).join(' ');
  const words = splitAnalysisWords(manuscript);
  const uniqueWords = new Set(words);
  const sentences = manuscript.split(/(?<=[.!?])\s+/).filter(Boolean);
  const averageSentenceLength = words.length / Math.max(sentences.length, 1);
  const longWordCount = words.reduce((count, word) => count + (word.length >= 8 ? 1 : 0), 0);
  const longWordRate = longWordCount / Math.max(words.length, 1);
  const repeatedWordRate = 1 - uniqueWords.size / Math.max(words.length, 1);
  const genre = getAnalysisGenre(session.document.mode, manuscript);

  return {
    conflicts: buildPlaceholderAnalysisConflicts(session.document.mode, passages, project.conflicts),
    createdAt: new Date().toISOString(),
    createdBy: actor,
    depth,
    id: createEventId('analysis-run'),
    isPlaceholder: true,
    metrics: {
      characterPresence: clampAnalysisMetric(
        12,
        Math.round(new Set(manuscript.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b/g) ?? []).size * 8),
        96
      ),
      genre: genre.genre,
      genreConfidence: genre.confidence,
      pacing: clampAnalysisMetric(20, Math.round(100 - Math.abs(averageSentenceLength - 22) * 3), 92),
      plagiarismScore: clampAnalysisMetric(0, Math.round(repeatedWordRate * (depth === 'pro' ? 34 : 18)), 34),
      readingGrade: Number(clampAnalysisMetric(5, 4 + averageSentenceLength / 2 + longWordRate * 18, 16).toFixed(1)),
      repetition: clampAnalysisMetric(4, Math.round(repeatedWordRate * 100), 65),
      vocabularyDepth: clampAnalysisMetric(22, Math.round((uniqueWords.size / Math.max(words.length, 1)) * 165), 94),
    },
    notes: [
      depth === 'pro'
        ? 'Pro scan is running in placeholder mode. Treat plagiarism and continuity scores as preflight estimates.'
        : 'Standard scan is running in placeholder mode. Use it to shape revisions before the backend worker lands.',
      `Average sentence length is ${averageSentenceLength.toFixed(1)} words.`,
      `Unique vocabulary ratio is ${((uniqueWords.size / Math.max(words.length, 1)) * 100).toFixed(0)}%.`,
    ],
    status: 'completed',
  };
}

export function createInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NS'
  );
}

export function createAccent(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }

  return ACTOR_ACCENTS[Math.abs(hash) % ACTOR_ACCENTS.length];
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitSentences(text: string) {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => normalizeText(sentence))
    .filter(Boolean);
}

function sentence(text: string, fallback: string) {
  const cleaned = normalizeText(text).replace(/[.!?]+$/g, '');
  if (!cleaned) {
    return fallback;
  }

  return `${cleaned}.`;
}

function extractCuePhrase(prompt: string) {
  const words = normalizeText(prompt)
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

  return words.slice(0, 4).join(' ');
}

export function createPlaceholderRevisionProposal(mode: RevisionMode, target: string, prompt: string) {
  const base = normalizeText(target);
  const sentences = splitSentences(base);
  const first = sentence(sentences[0] ?? base, 'The beat holds its shape.');
  const last = sentence(sentences[sentences.length - 1] ?? sentences[0] ?? base, 'The consequence hangs in the room.');
  const cue = extractCuePhrase(prompt);
  const pressureCue = cue ? `the pressure of ${cue}` : 'the pressure of the moment';

  if (mode === 'replace') {
    return {
      confidence: 0.42,
      isPlaceholder: true,
      rationale: 'Placeholder draft for the typed revision bridge. Replace with model output once the novelist revision worker is live.',
      text: `${first} ${sentence(`Now ${pressureCue} sits closer to the surface, and nobody in the scene can pretend otherwise`, 'Now the pressure sits closer to the surface, and nobody can pretend otherwise.')}`,
      warnings: ['Generated in placeholder mode.'],
    };
  }

  if (mode === 'tighten') {
    return {
      confidence: 0.39,
      isPlaceholder: true,
      rationale: 'Placeholder draft that compresses the beat while preserving the original intent target.',
      text: `${first} ${sentence(`The line lands faster, with ${pressureCue} doing the work the extra phrasing used to carry`, 'The line lands faster, with the pressure doing the work the extra phrasing used to carry.')}`,
      warnings: ['Generated in placeholder mode.'],
    };
  }

  if (mode === 'expand') {
    return {
      confidence: 0.44,
      isPlaceholder: true,
      rationale: 'Placeholder draft that opens the beat into a fuller narrative turn.',
      text: `${first} ${sentence(`Between one breath and the next, ${pressureCue} widens around the scene before anyone can answer it`, 'Between one breath and the next, the pressure widens around the scene before anyone can answer it.')} ${last}`,
      warnings: ['Generated in placeholder mode.'],
    };
  }

  if (mode === 'bridge') {
    return {
      confidence: 0.41,
      isPlaceholder: true,
      rationale: 'Placeholder draft that creates connective tissue between adjacent beats.',
      text: `${first} ${sentence(`That shift carries the scene cleanly toward what follows, under ${pressureCue}`, 'That shift carries the scene cleanly toward what follows, under the pressure of the moment.')} ${last}`,
      warnings: ['Generated in placeholder mode.'],
    };
  }

  return {
    confidence: 0.45,
    isPlaceholder: true,
    rationale: 'Placeholder draft that surfaces continuity information directly in the prose.',
    text: `${first} ${sentence(`The detail now aligns with what the draft already established about ${cue || 'the scene'}, so the continuity signal reads as intentional instead of accidental`, 'The detail now aligns with what the draft already established, so the continuity signal reads as intentional instead of accidental.')} ${last}`,
    warnings: ['Generated in placeholder mode.'],
  };
}

function getProjectMode(project: NovelProject): NovelistProjectMode {
  return project.id === 'fantasy-lineage' ? 'lore' : 'novel';
}

export function getFirstPageNumber(project: NovelProject) {
  return project.chapters[0]?.pages[0]?.absolutePage ?? 1;
}

export function clampPageNumber(project: NovelProject, pageNumber: number) {
  const pages = project.chapters.flatMap((chapter) => chapter.pages);
  const minPage = pages[0]?.absolutePage ?? 1;
  const maxPage = pages[pages.length - 1]?.absolutePage ?? minPage;

  return Math.min(maxPage, Math.max(minPage, Math.round(pageNumber)));
}

function mapKind(value: string): GraphEntityKind {
  const normalized = normalizeText(value).toLowerCase();

  if (normalized.includes('character')) return 'character';
  if (normalized.includes('zone')) return 'zone';
  if (normalized.includes('dynasty')) return 'dynasty';
  if (normalized.includes('quest')) return 'quest';
  if (normalized.includes('npc')) return 'npc';
  if (normalized.includes('faction')) return 'faction';
  if (normalized.includes('artifact')) return 'artifact';
  if (normalized.includes('plot')) return 'plotline';
  return 'motif';
}

function getProfileId(profile: any) {
  const candidate = profile?.id ?? profile?.data?.id ?? profile?.data?._id ?? profile?.address ?? profile?.data?.address;
  return candidate ? String(candidate) : null;
}

function getProfileName(profile: any) {
  const candidate = profile?.name ?? profile?.data?.name ?? profile?.username ?? profile?.data?.username;
  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}

function getContributorRoleLabel(permissionRole: NovelistActor['permissionRole']) {
  if (permissionRole === 'owner') return 'Owner';
  if (permissionRole === 'reviewer') return 'Reviewer';
  if (permissionRole === 'editor') return 'Editor';
  return 'Viewer';
}

function inferPermissionRole(project: NovelProject, document: NovelProjectDocument, actorId: string | null, profile: any): NovelistActor['permissionRole'] {
  if (actorId && document.collaboratorRoles[actorId]) {
    return document.collaboratorRoles[actorId];
  }

  if (Array.isArray(profile?.roles) && profile.roles.includes('admin')) {
    return 'owner';
  }

  if (Array.isArray(profile?.roles) && profile.roles.includes('qa')) {
    return 'reviewer';
  }

  if (actorId && project.contributors.some((contributor) => contributor.id === actorId)) {
    return actorId === project.currentReviewerId ? 'reviewer' : 'editor';
  }

  if (actorId) {
    return 'editor';
  }

  return 'viewer';
}

export function buildActingContributor(project: NovelProject, document: NovelProjectDocument, profile: any): NovelistActor {
  const profileId = getProfileId(profile);
  const profileName = getProfileName(profile);
  const matchedContributor =
    project.contributors.find((contributor) => contributor.id === profileId) ??
    project.contributors.find(
      (contributor) => profileName && contributor.name.toLowerCase() === profileName.toLowerCase()
    ) ??
    null;

  if (matchedContributor) {
    const permissionRole = inferPermissionRole(project, document, matchedContributor.id, profile);

    return {
      accent: matchedContributor.accent,
      id: matchedContributor.id,
      initials: matchedContributor.initials,
      isPrivileged: permissionRole === 'owner' || permissionRole === 'reviewer',
      name: matchedContributor.name,
      permissionRole,
      role: matchedContributor.role,
      source: 'contributor',
    };
  }

  if (profileId || profileName) {
    const name = profileName ?? 'Unknown Writer';
    const permissionRole = inferPermissionRole(project, document, profileId ?? null, profile);

    return {
      accent: createAccent(profileId ?? name),
      id: profileId ?? `profile-${slugify(name)}`,
      initials: createInitials(name),
      isPrivileged: permissionRole === 'owner' || permissionRole === 'reviewer',
      name,
      permissionRole,
      role: getContributorRoleLabel(permissionRole),
      source: 'profile',
    };
  }

  const reviewLead = project.contributors.find((contributor) => contributor.id === project.currentReviewerId) ?? project.contributors[0];
  if (reviewLead) {
    const permissionRole = inferPermissionRole(project, document, reviewLead.id, profile);

    return {
      accent: reviewLead.accent,
      id: reviewLead.id,
      initials: reviewLead.initials,
      isPrivileged: permissionRole === 'owner' || permissionRole === 'reviewer',
      name: reviewLead.name,
      permissionRole,
      role: reviewLead.role,
      source: 'contributor',
    };
  }

  return {
    accent: '#7cc7ff',
    id: 'guest-writer',
    initials: 'GW',
    isPrivileged: false,
    name: 'Guest Writer',
    permissionRole: 'viewer',
    role: 'Guest',
    source: 'guest',
  };
}

export function getPermissionFlags(actor: NovelistActor): NovelistPermissionFlags {
  const canEdit = actor.permissionRole === 'owner' || actor.permissionRole === 'editor' || actor.permissionRole === 'reviewer';

  return {
    canApproveRoyalties: actor.permissionRole === 'owner' || actor.permissionRole === 'reviewer',
    canComment: canEdit,
    canDismissConflicts: actor.permissionRole === 'owner' || actor.permissionRole === 'reviewer',
    canLockRoyalties: actor.permissionRole === 'owner',
    canManagePricing: actor.permissionRole === 'owner',
    canPublish: actor.permissionRole === 'owner',
    canQueueRevisions: canEdit,
    canResolveRevisions: canEdit,
    canRunProAnalysis: actor.permissionRole === 'owner' || actor.isPrivileged,
    canVoteConflicts: canEdit,
  };
}

function createCollaboratorRoles(project: NovelProject) {
  const roles: Record<string, NovelistActor['permissionRole']> = {};

  project.contributors.forEach((contributor, index) => {
    if (index === 0) {
      roles[contributor.id] = 'owner';
      return;
    }

    if (contributor.id === project.currentReviewerId) {
      roles[contributor.id] = 'reviewer';
      return;
    }

    roles[contributor.id] = 'editor';
  });

  return roles;
}

function createSeedAnalysisRun(project: NovelProject): AnalysisRunRecord {
  const actor: NovelistActor = {
    accent: '#7cc7ff',
    id: 'analysis-seed',
    initials: 'AS',
    isPrivileged: true,
    name: 'Seed Import',
    permissionRole: 'owner',
    role: 'System',
    source: 'guest',
  };

  return {
    conflicts: project.conflicts.map((conflict) => toOpenNovelistConflict(conflict, 'seed')),
    createdAt: new Date().toISOString(),
    createdBy: actor,
    depth: 'standard',
    id: `analysis-seed-${project.id}`,
    isPlaceholder: true,
    metrics: {
      characterPresence: Math.min(96, Math.max(34, Math.round(project.contributors.length * 17))),
      genre: project.metrics.genre,
      genreConfidence: project.metrics.genreConfidence,
      pacing: project.metrics.pacing,
      plagiarismScore: project.metrics.plagiarismScore,
      readingGrade: project.metrics.readingGrade,
      repetition: Math.max(6, 100 - project.metrics.vocabularyDepth),
      vocabularyDepth: project.metrics.vocabularyDepth,
    },
    notes: [...project.metrics.notes],
    status: 'completed',
  };
}

function createInitialRoyaltyShares(project: NovelProject): EditionRoyaltyShare[] {
  return project.contributors.map((contributor) => ({
    contributorId: contributor.id,
    overrideReason: null,
    share: contributor.share,
  }));
}

function createDefaultEdition(project: NovelProject): EditionRecord {
  return {
    blockers: ['Create a snapshot to export or publish.', 'Lock royalty shares before publishing.'],
    exportJobs: [],
    id: `edition-${project.id}-1`,
    priceUsd: project.monetization.priceUsd,
    royaltyApprovalRequired: false,
    royaltyApprovedAt: null,
    royaltyApprovedBy: null,
    royaltyLocked: false,
    royaltyShares: createInitialRoyaltyShares(project),
    snapshotId: null,
    status: 'blocked',
    subtitle: project.subtitle,
    title: project.title,
    updatedAt: new Date().toISOString(),
  };
}

function getPassageRecord(document: NovelProjectDocument, passageId: string) {
  return document.passages[passageId] ?? null;
}

export function getScenePassages(document: NovelProjectDocument, sceneId: string): NovelPassage[] {
  const scene = document.scenes[sceneId];
  if (!scene) return [];

  return scene.passageIds
    .map((passageId) => getPassageRecord(document, passageId))
    .filter((passage): passage is PassageRecord => Boolean(passage))
    .map((passage) => ({
      id: passage.id,
      text: passage.text,
    }));
}

function getSceneFromPageId(project: NovelProject, pageId: string) {
  for (const chapter of project.chapters) {
    const page = chapter.pages.find((item) => item.id === pageId);
    if (page) {
      return {
        chapter,
        page,
      };
    }
  }

  return null;
}

export function serializePassages(passages: NovelPassage[]) {
  return JSON.stringify(passages.map((passage) => [passage.id, normalizeText(passage.text)]));
}

function createSnapshotFingerprint(passages: NovelPassage[]) {
  return serializePassages(passages);
}

function withDocumentTouch(document: NovelProjectDocument) {
  document.baseVersion += 1;
  document.updatedAt = new Date().toISOString();
  return document;
}

function appendActivityRecord(document: NovelProjectDocument, activity: NovelistActivityRecord) {
  document.activity.unshift(activity);
  return document;
}

function markRoyaltyApprovalPending(edition: EditionRecord) {
  return {
    ...edition,
    royaltyApprovalRequired: true,
    royaltyApprovedAt: null,
    royaltyApprovedBy: null,
  };
}

function applyProposalToPassages(passages: NovelPassage[], proposal: Pick<RevisionProposal, 'generatedText' | 'passageId' | 'targetText'>) {
  const resultPassages = passages.map((passage) => ({ ...passage }));
  let targetIndex = proposal.passageId ? resultPassages.findIndex((passage) => passage.id === proposal.passageId) : -1;

  if (targetIndex < 0) {
    targetIndex = resultPassages.findIndex((passage) => normalizeText(passage.text).includes(normalizeText(proposal.targetText)));
  }

  if (targetIndex < 0) {
    targetIndex = 0;
  }

  const previousText = resultPassages[targetIndex]?.text ?? '';
  if (resultPassages[targetIndex]) {
    resultPassages[targetIndex] = {
      ...resultPassages[targetIndex],
      text: proposal.generatedText,
    };
  }

  return {
    previousText,
    resultPassages,
    targetPassageId: resultPassages[targetIndex]?.id ?? proposal.passageId ?? null,
  };
}

function calculateWordDelta(previousText: string, nextText: string) {
  const previousCount = countWords(previousText);
  const nextCount = countWords(nextText);

  return {
    additions: Math.max(nextCount - previousCount, 0),
    removals: Math.max(previousCount - nextCount, 0),
    replacements: Math.min(previousCount, nextCount),
  };
}

function replaceScenePassages(document: NovelProjectDocument, sceneId: string, passages: NovelPassage[]) {
  const scene = document.scenes[sceneId];
  if (!scene) return document;

  passages.forEach((passage) => {
    if (document.passages[passage.id]) {
      document.passages[passage.id] = {
        ...document.passages[passage.id],
        text: passage.text,
      };
      return;
    }

    document.passages[passage.id] = {
      id: passage.id,
      sceneId,
      text: passage.text,
    };
    scene.passageIds.push(passage.id);
  });

  return document;
}

function getChapterBySceneId(document: NovelProjectDocument, sceneId: string) {
  const scene = document.scenes[sceneId];
  if (!scene) return null;
  return document.chapters[scene.chapterId] ?? null;
}

function createSceneReference(document: NovelProjectDocument, sceneId: string) {
  const scene = document.scenes[sceneId];
  const chapter = getChapterBySceneId(document, sceneId);
  if (!scene || !chapter) return sceneId;
  return `${chapter.title} p${scene.pageNumber}`;
}

function updateGraphNodeMetadata(document: NovelProjectDocument, nodes: GraphEntityNode[], mentionEdges: GraphMentionEdge[]) {
  return nodes.map((node) => {
    const nodeEdges = mentionEdges.filter((edge) => edge.sourceNodeId === node.id);
    const sceneIds = Array.from(new Set(nodeEdges.map((edge) => edge.sceneId)));
    const references = sceneIds.map((sceneId) => createSceneReference(document, sceneId)).slice(0, 5);

    return {
      ...node,
      references,
      sceneIds,
    };
  });
}

function inferGraphNodes(document: NovelProjectDocument, explicitNodes: GraphEntityNode[]) {
  const explicitLabels = new Set(explicitNodes.map((node) => normalizeText(node.label).toLowerCase()));
  const counts = new Map<string, { count: number; references: string[] }>();

  Object.values(document.passages).forEach((passage) => {
    const matches = passage.text.match(TITLE_CASE_PHRASE_PATTERN) ?? [];
    matches.forEach((match) => {
      const normalized = normalizeText(match);
      const key = normalized.toLowerCase();
      if (normalized.length < 4 || STOP_WORDS.has(key) || explicitLabels.has(key)) {
        return;
      }

      const current = counts.get(key) ?? { count: 0, references: [] };
      current.count += 1;
      current.references.push(passage.sceneId);
      counts.set(key, current);
    });
  });

  return Array.from(counts.entries())
    .filter(([, value]) => value.count >= 2)
    .slice(0, 6)
    .map(([key, value], index) => {
      const label = key
        .split(' ')
        .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
        .join(' ');

      return {
        accent: '#85a7ff',
        detail: 'Inferred from recurring accepted-draft references.',
        id: `inferred-${slugify(label)}`,
        kind: label.startsWith('House ') ? 'dynasty' : label.split(' ').length > 1 ? 'character' : 'motif',
        label,
        references: value.references.slice(0, 4),
        sceneIds: value.references.slice(0, 4),
        source: 'inferred',
        x: 1040,
        y: 60 + index * 140,
      } satisfies GraphEntityNode;
    });
}

function createMentionEdges(document: NovelProjectDocument, nodes: GraphEntityNode[]) {
  const explicitLabels = new Set(
    nodes.filter((node) => node.source === 'explicit' || node.source === 'canon').map((node) => normalizeText(node.label).toLowerCase())
  );
  const edges: GraphMentionEdge[] = [];

  Object.values(document.scenes).forEach((scene) => {
    scene.passageIds.forEach((passageId, paragraphIndex) => {
      const passage = document.passages[passageId];
      if (!passage) return;
      const passageText = passage.text.toLowerCase();

      nodes.forEach((node) => {
        const label = normalizeText(node.label).toLowerCase();
        if (!label || !passageText.includes(label)) {
          return;
        }

        if (node.source === 'inferred' && explicitLabels.has(label)) {
          return;
        }

        edges.push({
          confidence: node.source === 'explicit' || node.source === 'canon' ? 0.96 : 0.67,
          id: `edge-${node.id}-${scene.id}-${passageId}-${paragraphIndex}`,
          paragraphIndex,
          passageId,
          provenance: `${createSceneReference(document, scene.id)} paragraph ${paragraphIndex + 1}`,
          sceneId: scene.id,
          source: node.source === 'explicit' || node.source === 'canon' ? 'explicit' : 'inferred',
          sourceNodeId: node.id,
          targetSceneId: scene.id,
        });
      });
    });
  });

  return edges;
}

export function recalculateDocumentGraph(document: NovelProjectDocument) {
  const explicitNodes = document.graph.nodes.filter((node) => node.source === 'explicit' || node.source === 'canon');
  const inferredNodes = inferGraphNodes(document, explicitNodes);
  const nodes = [...explicitNodes, ...inferredNodes];
  const mentionEdges = createMentionEdges(document, nodes);

  document.graph = {
    ...document.graph,
    mentionEdges,
    nodes: updateGraphNodeMetadata(document, nodes, mentionEdges),
  };

  return document;
}

function createInitialGraph(project: NovelProject): NovelProjectDocument['graph'] {
  return {
    explicitEdges: project.canvas.edges.map((edge) => ({
      id: edge.id,
      label: typeof edge.label === 'string' ? edge.label : undefined,
      source: String(edge.source),
      target: String(edge.target),
    })),
    mentionEdges: [] as GraphMentionEdge[],
    nodes: project.canvas.nodes.map((node) => ({
      accent: node.data.accent,
      detail: node.data.detail,
      id: node.id,
      kind: mapKind(node.data.kind),
      label: node.data.title,
      references: [...node.data.references],
      sceneIds: [],
      source: 'explicit',
      x: node.position?.x,
      y: node.position?.y,
    })),
  };
}

export function createDocumentFromProject(project: NovelProject): NovelProjectDocument {
  const createdAt = new Date().toISOString();
  const chapters = project.chapters.reduce<Record<string, NovelProjectDocument['chapters'][string]>>((acc, chapter) => {
    acc[chapter.id] = {
      beat: chapter.beat,
      id: chapter.id,
      sceneIds: chapter.pages.map((page) => page.id),
      title: chapter.title,
    };
    return acc;
  }, {});

  const scenes = project.chapters.reduce<Record<string, SceneRecord>>((acc, chapter) => {
    chapter.pages.forEach((page) => {
      acc[page.id] = {
        chapterId: chapter.id,
        id: page.id,
        pageNumber: page.absolutePage,
        passageIds: page.passages.map((passage) => passage.id),
        status: 'review',
        summary: page.summary,
        title: `${chapter.title} / ${page.label}`,
      };
    });
    return acc;
  }, {});

  const passages = project.chapters.reduce<Record<string, PassageRecord>>((acc, chapter) => {
    chapter.pages.forEach((page) => {
      page.passages.forEach((passage) => {
        acc[passage.id] = {
          id: passage.id,
          sceneId: page.id,
          text: passage.text,
        };
      });
    });
    return acc;
  }, {});

  const document: NovelProjectDocument = {
    activity: [],
    analysisRuns: [createSeedAnalysisRun(project)],
    baseVersion: 1,
    canonSources: [...project.canonSources],
    chapterIds: project.chapters.map((chapter) => chapter.id),
    chapters,
    collaboratorRoles: createCollaboratorRoles(project),
    comments: [],
    conflictDismissals: [],
    conflictVotes: [],
    decisions: [],
    derivedConflicts: [],
    dismissedConflictIds: [],
    editions: [createDefaultEdition(project)],
    graph: createInitialGraph(project),
    mode: getProjectMode(project),
    passages,
    projectDescription: project.description,
    projectId: project.id,
    proposals: [],
    scenes,
    snapshots: [],
    subtitle: project.subtitle,
    tags: [...project.tags],
    title: project.title,
    updatedAt: createdAt,
  };

  return recalculateDocumentGraph(document);
}

export function createDefaultSession(project: NovelProject): NovelistProjectSession {
  return {
    currentPageNumber: getFirstPageNumber(project),
    document: createDocumentFromProject(project),
  };
}

function buildSeedPassageMap(project: NovelProject) {
  const map: Record<string, NovelPassage[]> = {};

  project.chapters.forEach((chapter) => {
    chapter.pages.forEach((page) => {
      map[page.id] = page.passages.map((passage) => ({
        id: passage.id,
        text: passage.text,
      }));
    });
  });

  return map;
}

function replayAcceptedDecisions(project: NovelProject, document: NovelProjectDocument): DecisionReplaySnapshot {
  const initialScenePassages = buildSeedPassageMap(project);
  const proposalsById = new Map(document.proposals.map((proposal) => [proposal.id, proposal]));
  const acceptedDecisionSnapshots: Record<string, NovelPassage[]> = {};
  const actualDecisions = getSortedDecisions(document);

  actualDecisions.forEach((decision) => {
    if (decision.decision !== 'accepted') {
      return;
    }

    const proposal = proposalsById.get(decision.proposalId);
    if (!proposal) {
      return;
    }

    const currentPassages = initialScenePassages[proposal.sceneId] ?? [];
    const { resultPassages } = applyProposalToPassages(currentPassages, proposal);
    initialScenePassages[proposal.sceneId] = resultPassages;
    acceptedDecisionSnapshots[decision.id] = resultPassages.map((passage) => ({ ...passage }));
  });

  return {
    byDecisionId: acceptedDecisionSnapshots,
  };
}

function getSortedProposals(document: NovelProjectDocument) {
  return [...document.proposals].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

function getSortedDecisions(document: NovelProjectDocument) {
  return [...document.decisions].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

function getProposalDecision(document: NovelProjectDocument, proposalId: string) {
  return document.decisions.find((decision) => decision.proposalId === proposalId) ?? null;
}

function attachDecision(document: NovelProjectDocument, proposalId: string, decision: RevisionDecision) {
  document.decisions.unshift({
    ...decision,
    proposalId,
  });
  return document;
}

function toChangeType(mode: RevisionMode): NovelHistoryEntry['changeType'] {
  if (mode === 'expand' || mode === 'bridge') {
    return 'Addition';
  }

  if (mode === 'continuity') {
    return 'Consistency';
  }

  return 'Replacement';
}

export function formatTimestamp(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(date);
}

function appendReviewerNote(baseText: string, reviewerNote?: string) {
  const note = normalizeText(reviewerNote ?? '');
  return note ? `${baseText} Reviewer note: ${note}` : baseText;
}

function getScope(document: NovelProjectDocument, sceneId: string, pageNumber: number) {
  const scene = document.scenes[sceneId];
  const chapter = scene ? document.chapters[scene.chapterId] : null;
  if (!scene || !chapter) {
    return `Page ${pageNumber}`;
  }

  return `${chapter.title} p${pageNumber}`;
}

function getScopeFromPageNumber(document: NovelProjectDocument, pageNumber: number) {
  const scene = Object.values(document.scenes).find((item) => item.pageNumber === pageNumber);
  if (!scene) {
    return `Page ${pageNumber}`;
  }

  return getScope(document, scene.id, pageNumber);
}

function getCommentScopeInfo(document: NovelProjectDocument, comment: CommentRecord) {
  if (comment.scope === 'scene') {
    const scene = document.scenes[comment.scopeId];
    if (scene) {
      return {
        pageNumber: scene.pageNumber,
        scope: getScope(document, scene.id, scene.pageNumber),
      };
    }
  }

  if (comment.scope === 'passage') {
    const passage = document.passages[comment.scopeId];
    const scene = passage ? document.scenes[passage.sceneId] : null;
    if (passage && scene) {
      return {
        pageNumber: scene.pageNumber,
        scope: getScope(document, scene.id, scene.pageNumber),
      };
    }
  }

  if (comment.scope === 'proposal') {
    const proposal = document.proposals.find((item) => item.id === comment.scopeId);
    if (proposal) {
      return {
        pageNumber: proposal.pageNumber,
        scope: getScope(document, proposal.sceneId, proposal.pageNumber),
      };
    }
  }

  if (comment.scope === 'conflict') {
    const conflict = document.analysisRuns
      .flatMap((run) => run.conflicts)
      .find((item) => item.id === comment.scopeId);

    if (conflict) {
      return getConflictScopeInfo(document, conflict);
    }
  }

  return {
    pageNumber: null,
    scope: comment.scope,
  };
}

function getSnapshotPassagesForHistory(document: NovelProjectDocument, snapshot: SnapshotRecord) {
  const scene = document.scenes[snapshot.scopeId];
  if (snapshot.scope === 'scene' && scene) {
    return scene.passageIds
      .map((passageId) => snapshot.passages.find((item) => item.passageId === passageId))
      .filter((passage): passage is SnapshotRecord['passages'][number] => Boolean(passage))
      .map((passage) => ({
        id: passage.passageId,
        text: passage.text,
      }));
  }

  return snapshot.passages.map((passage) => ({
    id: passage.passageId,
    text: passage.text,
  }));
}

export function deriveHistoryEntries(project: NovelProject, document: NovelProjectDocument): NovelistHistoryItem[] {
  const decisionSnapshots = replayAcceptedDecisions(project, document);
  const items: NovelistHistoryItem[] = [];

  getSortedProposals(document).forEach((proposal, index) => {
    items.push({
      authorId: proposal.actor.id,
      changedAt: formatTimestamp(proposal.createdAt),
      changeType: toChangeType(proposal.mode),
      id: proposal.id,
      kind: 'proposal',
      pageNumber: proposal.pageNumber,
      scope: getScope(document, proposal.sceneId, proposal.pageNumber),
      status: proposal.status,
      summary: `${proposal.actor.name} queued a ${proposal.mode} revision: ${proposal.instruction}`,
      version: `Proposal ${String(index + 1).padStart(2, '0')}`,
    });

    const decision = getProposalDecision(document, proposal.id);
    if (!decision) {
      return;
    }

    items.push({
      authorId: decision.reviewer.id === proposal.actor.id ? proposal.actor.id : decision.reviewer.id,
      candidateText: proposal.generatedText,
      changedAt: formatTimestamp(decision.createdAt),
      changeType: toChangeType(proposal.mode),
      id: decision.id,
      kind: 'decision',
      pageNumber: proposal.pageNumber,
      previousText: decision.previousText,
      reviewerNote: decision.reviewerNote,
      scope: getScope(document, proposal.sceneId, proposal.pageNumber),
      snapshotPassages: decision.decision === 'accepted' ? decisionSnapshots.byDecisionId[decision.id] : undefined,
      status: decision.decision,
      summary: appendReviewerNote(
        decision.decision === 'accepted'
          ? `${decision.reviewer.name} accepted ${proposal.actor.name}'s ${proposal.mode} draft: ${proposal.instruction}`
          : `${decision.reviewer.name} rejected ${proposal.actor.name}'s ${proposal.mode} draft: ${proposal.instruction}`,
        decision.reviewerNote
      ),
      version: `Review ${String(index + 1).padStart(2, '0')}`,
      wordDelta: decision.wordDelta,
    });
  });

  document.snapshots.forEach((snapshot, index) => {
    items.push({
      authorId: snapshot.createdBy.id,
      changedAt: formatTimestamp(snapshot.createdAt),
      changeType: 'Consistency',
      id: snapshot.id,
      kind: 'snapshot',
      pageNumber: snapshot.pageNumber,
      scope: snapshot.label,
      snapshotId: snapshot.id,
      snapshotPassages: getSnapshotPassagesForHistory(document, snapshot),
      summary: `${snapshot.createdBy.name} captured snapshot "${snapshot.label}".`,
      version: `Snapshot ${String(index + 1).padStart(2, '0')}`,
    });
  });

  project.history.forEach((entry) => {
    items.push({
      ...entry,
      kind: 'seed',
    });
  });

  return items.sort((left, right) => {
    const rightTime = new Date(right.changedAt).getTime();
    const leftTime = new Date(left.changedAt).getTime();
    if (!Number.isNaN(rightTime) && !Number.isNaN(leftTime) && rightTime !== leftTime) {
      return rightTime - leftTime;
    }

    return right.id.localeCompare(left.id);
  });
}

export function derivePages(project: NovelProject, document: NovelProjectDocument): NovelistPage[] {
  return project.chapters.flatMap((chapter) =>
    chapter.pages.map((page) => ({
      ...page,
      chapterBeat: chapter.beat,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      passages: getScenePassages(document, page.id),
      sceneId: page.id,
    }))
  );
}

export function createRevisionResolutionOperation(
  document: NovelProjectDocument,
  input: {
    action: 'accept' | 'reject';
    proposalId: string;
    reviewer: NovelistActor;
    reviewerNote?: string;
  }
) {
  const proposal = document.proposals.find((entry) => entry.id === input.proposalId) ?? null;
  if (!proposal) {
    return null;
  }

  return {
    operation: {
      proposalId: proposal.id,
      reviewer: input.reviewer,
      reviewerNote: input.reviewerNote,
      type: input.action === 'accept' ? 'accept_proposal' : 'reject_proposal',
    } satisfies NovelistProjectOperation,
    proposal,
  };
}

export function createQueuedProposalOperation(
  document: NovelProjectDocument,
  input: {
    actor: NovelistActor;
    affectedEntityIds?: string[];
    confidence: number;
    contextWindow: string[];
    generatedText: string;
    instruction: string;
    isPlaceholder: boolean;
    mode: RevisionMode;
    passageId?: string | null;
    rationale: string;
    sceneId: string;
    targetText: string;
    warnings: string[];
  }
) {
  const scene = document.scenes[input.sceneId] ?? null;
  if (!scene) {
    return null;
  }

  const livePassages = getScenePassages(document, input.sceneId);
  const proposal = {
    actor: input.actor,
    affectedEntityIds: [...(input.affectedEntityIds ?? [])],
    confidence: input.confidence,
    contextWindow: [...input.contextWindow],
    createdAt: new Date().toISOString(),
    generatedText: input.generatedText,
    id: createEventId('proposal'),
    instruction: input.instruction,
    isPlaceholder: input.isPlaceholder,
    mode: input.mode,
    pageNumber: scene.pageNumber,
    passageId: input.passageId ?? null,
    rationale: input.rationale,
    sceneId: input.sceneId,
    snapshotFingerprint: serializePassages(livePassages),
    status: 'queued' as const,
    targetText: input.targetText,
    warnings: [...input.warnings],
  } satisfies RevisionProposal;

  return {
    operation: {
      proposal,
      type: 'queue_proposal',
    } satisfies NovelistProjectOperation,
    proposal,
  };
}

export function createSnapshotOperationPlan(
  project: NovelProject,
  session: NovelistProjectSession,
  input: {
    actor: NovelistActor;
    label: string;
    scope: SnapshotScope;
  }
) {
  const pages = derivePages(project, session.document);
  const page =
    pages.find((entry) => entry.absolutePage === session.currentPageNumber) ??
    pages[Math.max(0, session.currentPageNumber - 1)] ??
    pages[0] ??
    null;

  const scopeId =
    input.scope === 'project'
      ? project.id
      : input.scope === 'chapter'
        ? page?.chapterId ?? project.id
        : page?.sceneId ?? project.id;

  return {
    operation: {
      actor: input.actor,
      label: input.label,
      pageNumber: page?.absolutePage ?? session.currentPageNumber,
      scope: input.scope,
      scopeId,
      type: 'create_snapshot',
    } satisfies NovelistProjectOperation,
    page,
  };
}

export function createRestoreSnapshotOperation(
  document: NovelProjectDocument,
  input: {
    actor: NovelistActor;
    snapshotId: string;
  }
) {
  const snapshot = document.snapshots.find((entry) => entry.id === input.snapshotId) ?? null;
  if (!snapshot) {
    return null;
  }

  return {
    operation: {
      actor: input.actor,
      snapshotId: snapshot.id,
      type: 'restore_snapshot',
    } satisfies NovelistProjectOperation,
    snapshot,
  };
}

export function createExportJobOperation(
  document: NovelProjectDocument,
  input: {
    actor: NovelistActor;
    editionId: string;
    format: ExportFormat;
    snapshotId: string;
  }
) {
  const edition = document.editions.find((entry) => entry.id === input.editionId) ?? null;
  const snapshot = document.snapshots.find((entry) => entry.id === input.snapshotId) ?? null;
  if (!edition || !snapshot) {
    return null;
  }

  return {
    edition,
    operation: {
      actor: input.actor,
      format: input.format,
      label: `Queued ${input.format.toUpperCase()} export from snapshot ${snapshot.id}`,
      snapshotId: snapshot.id,
      type: 'add_export_job',
    } satisfies NovelistProjectOperation,
    snapshot,
  };
}

export function findDecisionForProposal(
  previousDocument: NovelProjectDocument,
  nextDocument: NovelProjectDocument,
  proposalId: string
) {
  const previousDecisionIds = new Set(previousDocument.decisions.map((decision) => decision.id));
  return (
    nextDocument.decisions.find((entry) => entry.proposalId === proposalId && !previousDecisionIds.has(entry.id)) ??
    nextDocument.decisions.find((entry) => entry.proposalId === proposalId) ??
    null
  );
}

export function findCreatedSnapshot(previousDocument: NovelProjectDocument, nextDocument: NovelProjectDocument) {
  const previousSnapshotIds = new Set(previousDocument.snapshots.map((snapshot) => snapshot.id));
  return nextDocument.snapshots.find((entry) => !previousSnapshotIds.has(entry.id)) ?? nextDocument.snapshots[0] ?? null;
}

export function findSnapshotRestoreActivity(
  previousDocument: NovelProjectDocument,
  nextDocument: NovelProjectDocument,
  snapshotId: string
) {
  const previousActivityIds = new Set(previousDocument.activity.map((entry) => entry.id));
  return (
    nextDocument.activity.find(
      (entry) => entry.kind === 'snapshot_restored' && entry.conflictId === snapshotId && !previousActivityIds.has(entry.id)
    ) ??
    nextDocument.activity.find((entry) => entry.kind === 'snapshot_restored' && entry.conflictId === snapshotId) ??
    nextDocument.activity.find((entry) => entry.kind === 'snapshot_restored' && !previousActivityIds.has(entry.id)) ??
    nextDocument.activity.find((entry) => entry.kind === 'snapshot_restored') ??
    null
  );
}

export function findCreatedExportJob(
  previousDocument: NovelProjectDocument,
  nextDocument: NovelProjectDocument,
  editionId: string
) {
  const previousJobIds = new Set(
    previousDocument.editions.find((edition) => edition.id === editionId)?.exportJobs.map((job) => job.id) ?? []
  );
  const nextEdition = nextDocument.editions.find((edition) => edition.id === editionId) ?? null;

  return (
    nextEdition?.exportJobs.find((entry) => !previousJobIds.has(entry.id)) ??
    nextEdition?.exportJobs[nextEdition.exportJobs.length - 1] ??
    null
  );
}

export function deriveAiJobs(document: NovelProjectDocument): NovelistAiJob[] {
  return document.proposals
    .filter((proposal) => proposal.status === 'queued' || proposal.status === 'stale')
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((proposal) => ({
      actorId: proposal.actor.id,
      actorName: proposal.actor.name,
      confidence: proposal.confidence,
      createdAt: formatTimestamp(proposal.createdAt),
      id: proposal.id,
      instruction: proposal.instruction,
      isPlaceholder: proposal.isPlaceholder,
      isStale: proposal.status === 'stale',
      mode: proposal.mode,
      pageNumber: proposal.pageNumber,
      passageId: proposal.passageId,
      rationale: proposal.rationale,
      sceneId: proposal.sceneId,
      status: proposal.status,
      targetText: proposal.targetText,
      text: proposal.generatedText,
      warnings: proposal.warnings,
    }));
}

function createDynamicContributor(actor: NovelistActor): NovelistContributorStats {
  return {
    acceptedRevisions: 0,
    acceptedWordFootprint: 0,
    accent: actor.accent,
    additions: 0,
    analysisRuns: 0,
    conflictResolutions: 0,
    exportsRequested: 0,
    id: actor.id,
    initials: actor.initials,
    isDynamic: true,
    name: actor.name,
    permissionRole: actor.permissionRole,
    queuedRevisions: 0,
    rejectedRevisions: 0,
    removals: 0,
    replacements: 0,
    reviewApprovals: 0,
    role: actor.role,
    share: 0,
    suggestedShare: 0,
  };
}

function ensureContributor(contributors: Map<string, NovelistContributorStats>, actor: NovelistActor) {
  if (!contributors.has(actor.id)) {
    contributors.set(actor.id, createDynamicContributor(actor));
  }

  return contributors.get(actor.id)!;
}

function getContributorPermissionRole(document: NovelProjectDocument, contributorId: string) {
  return document.collaboratorRoles[contributorId] ?? 'viewer';
}

export function deriveContributorStats(project: NovelProject, document: NovelProjectDocument) {
  const contributors = new Map<string, NovelistContributorStats>();

  project.contributors.forEach((contributor) => {
    contributors.set(contributor.id, {
      ...contributor,
      acceptedRevisions: 0,
      acceptedWordFootprint: 0,
      analysisRuns: 0,
      conflictResolutions: 0,
      exportsRequested: 0,
      permissionRole: getContributorPermissionRole(document, contributor.id),
      queuedRevisions: 0,
      rejectedRevisions: 0,
      reviewApprovals: 0,
      suggestedShare: contributor.share,
    });
  });

  document.proposals.forEach((proposal) => {
    ensureContributor(contributors, proposal.actor).queuedRevisions += 1;

    const decision = getProposalDecision(document, proposal.id);
    if (!decision) {
      return;
    }

    const proposalContributor = ensureContributor(contributors, proposal.actor);
    if (decision.decision === 'accepted') {
      proposalContributor.acceptedRevisions += 1;
      proposalContributor.additions += decision.wordDelta.additions;
      proposalContributor.removals += decision.wordDelta.removals;
      proposalContributor.replacements += decision.wordDelta.replacements;
      proposalContributor.acceptedWordFootprint +=
        decision.wordDelta.additions + decision.wordDelta.removals + decision.wordDelta.replacements;
    } else {
      proposalContributor.rejectedRevisions += 1;
    }

    if (decision.reviewer.id !== proposal.actor.id) {
      ensureContributor(contributors, decision.reviewer).reviewApprovals += 1;
    }
  });

  document.analysisRuns.forEach((run) => {
    ensureContributor(contributors, run.createdBy).analysisRuns += 1;
  });

  document.conflictDismissals.forEach((dismissal) => {
    ensureContributor(contributors, dismissal.actor).conflictResolutions += 1;
  });

  document.editions.forEach((edition) => {
    edition.exportJobs.forEach((job) => {
      ensureContributor(contributors, job.requestedBy).exportsRequested += 1;
    });
  });

  const contributorList = [...contributors.values()];
  const acceptedTotal = contributorList.reduce((sum, contributor) => sum + contributor.acceptedWordFootprint, 0);

  contributorList.forEach((contributor) => {
    contributor.suggestedShare =
      acceptedTotal > 0 ? Math.round((contributor.acceptedWordFootprint / acceptedTotal) * 100) : contributor.share;
  });

  return contributorList.sort((left, right) => {
    const shareDelta = right.suggestedShare - left.suggestedShare;
    if (shareDelta !== 0) return shareDelta;

    const activityDelta =
      right.acceptedWordFootprint +
      right.reviewApprovals +
      right.conflictResolutions +
      right.analysisRuns -
      (left.acceptedWordFootprint + left.reviewApprovals + left.conflictResolutions + left.analysisRuns);
    if (activityDelta !== 0) return activityDelta;

    return left.name.localeCompare(right.name);
  });
}

function createEmptyConflictVoteSummary() {
  return {
    counts: {
      dismiss: 0,
      merge: 0,
      relink: 0,
    },
    eligibleVoterCount: 0,
    eligibleWeight: 0,
    leadingVote: null,
    leadingWeight: 0,
    requiredVoteCount: 0,
    requiredWeight: 0,
    resolutionVote: null,
    total: 0,
    updatedAt: null,
    weightedCounts: {
      dismiss: 0,
      merge: 0,
      relink: 0,
    },
  };
}

function getConflictVoteRoleWeight(permissionRole: NovelistRole) {
  if (permissionRole === 'owner') return 3;
  if (permissionRole === 'reviewer') return 2;
  if (permissionRole === 'editor') return 1;
  return 0;
}

function getConflictVoteRequiredWeight(eligibleWeight: number) {
  if (eligibleWeight <= 0) return 0;
  return Math.floor(eligibleWeight / 2) + 1;
}

function getConflictVoteRequiredCount(eligibleVoterCount: number) {
  return eligibleVoterCount > 1 ? 2 : eligibleVoterCount;
}

function deriveConflictVoteSummary(document: NovelProjectDocument, votes: NovelProjectDocument['conflictVotes']) {
  const summary = votes.reduce(
    (current, vote) => {
      current.counts[vote.vote] += 1;
      current.total += 1;
      current.weightedCounts[vote.vote] += getConflictVoteRoleWeight(vote.actor.permissionRole);
      if (!current.updatedAt || vote.createdAt > current.updatedAt) {
        current.updatedAt = vote.createdAt;
      }
      return current;
    },
    createEmptyConflictVoteSummary()
  );

  const eligibleRoles = Object.values(document.collaboratorRoles).filter((permissionRole) => permissionRole !== 'viewer');
  summary.eligibleVoterCount = eligibleRoles.length;
  summary.eligibleWeight = eligibleRoles.reduce((total, permissionRole) => total + getConflictVoteRoleWeight(permissionRole), 0);
  summary.requiredVoteCount = getConflictVoteRequiredCount(summary.eligibleVoterCount);
  summary.requiredWeight = getConflictVoteRequiredWeight(summary.eligibleWeight);

  const rankedVotes = (Object.keys(summary.weightedCounts) as CanonConflictVoteChoice[])
    .map((voteChoice) => ({
      rawCount: summary.counts[voteChoice],
      voteChoice,
      weight: summary.weightedCounts[voteChoice],
    }))
    .sort((left, right) => right.weight - left.weight || right.rawCount - left.rawCount || left.voteChoice.localeCompare(right.voteChoice));

  const leadingVote = rankedVotes[0] ?? null;
  const runnerUpVote = rankedVotes[1] ?? null;

  summary.leadingVote = leadingVote?.voteChoice ?? null;
  summary.leadingWeight = leadingVote?.weight ?? 0;
  if (
    leadingVote &&
    leadingVote.weight >= summary.requiredWeight &&
    leadingVote.rawCount >= summary.requiredVoteCount &&
    leadingVote.weight > (runnerUpVote?.weight ?? 0)
  ) {
    summary.resolutionVote = leadingVote.voteChoice;
  }

  return summary;
}

function getConflictVotes(document: NovelProjectDocument, conflictId: string) {
  return document.conflictVotes
    .filter((vote) => vote.conflictId === conflictId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function attachConflictVoteContext(document: NovelProjectDocument, conflict: NovelistConflict): NovelistConflict {
  const votes = getConflictVotes(document, conflict.id);

  return {
    ...conflict,
    voteSummary: deriveConflictVoteSummary(document, votes),
    votes,
  };
}

export function deriveVisibleConflicts(project: NovelProject, document: NovelProjectDocument) {
  const latestRun = [...document.analysisRuns]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];
  const baseConflicts =
    latestRun?.conflicts ?? project.conflicts.map((conflict) => toOpenNovelistConflict(conflict, 'seed'));
  const mergedConflicts = [...baseConflicts, ...(document.derivedConflicts ?? [])].reduce<Map<string, NovelistConflict>>((acc, conflict) => {
    acc.set(conflict.id, conflict);
    return acc;
  }, new Map());

  return Array.from(mergedConflicts.values())
    .filter((conflict) => conflict.status === 'open' && !document.dismissedConflictIds.includes(conflict.id))
    .map((conflict) => attachConflictVoteContext(document, conflict))
    .sort((left, right) => {
      const severityRank = { critical: 3, warning: 2, info: 1 } as const;
      return severityRank[right.severity] - severityRank[left.severity] || left.title.localeCompare(right.title);
    });
}

export function deriveLatestAnalysis(document: NovelProjectDocument) {
  return [...document.analysisRuns].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null;
}

function getConflictScopeInfo(document: NovelProjectDocument, conflict: NovelistConflict) {
  const chapter = Object.values(document.chapters).find((item) => item.title === conflict.chapter);
  const sceneId = chapter?.sceneIds[0] ?? null;
  const scene = sceneId ? document.scenes[sceneId] : null;

  return {
    pageNumber: scene?.pageNumber,
    scope: conflict.chapter,
  };
}

function getCanonConflictStatusLabel(resolution?: 'merge' | 'relink') {
  if (resolution === 'merge') {
    return 'merged';
  }

  if (resolution === 'relink') {
    return 'relinked';
  }

  return 'resolved';
}

function getConflictById(document: NovelProjectDocument, conflictId: string) {
  return (
    document.derivedConflicts.find((conflict) => conflict.id === conflictId) ??
    document.analysisRuns.flatMap((run) => run.conflicts).find((conflict) => conflict.id === conflictId) ??
    null
  );
}

function countExplicitCanvasEdges(document: NovelProjectDocument, nodeId: string) {
  return document.graph.explicitEdges.filter((edge) => edge.source === nodeId || edge.target === nodeId).length;
}

function formatEdgeCount(count: number) {
  return `${count} explicit canvas edge${count === 1 ? '' : 's'}`;
}

function describeChangeLine(label: string, before: string, after: string) {
  return before === after ? `${label}: ${after}.` : `${label}: ${before} -> ${after}.`;
}

export function deriveCanonConflictComparison(
  document: NovelProjectDocument,
  conflictId: string
): CanonConflictComparison | null {
  const conflict = getConflictById(document, conflictId);
  if (!conflict?.resolutionContext || conflict.resolutionContext.kind !== 'canon_link') {
    return null;
  }

  const existingNode = document.graph.nodes.find((node) => node.id === conflict.resolutionContext.existingNodeId);
  const incomingNode = conflict.resolutionContext.incomingNode;
  if (!existingNode) {
    return null;
  }

  const existingEdgeCount = countExplicitCanvasEdges(document, existingNode.id);
  const mergedNode = mergeGraphNode(existingNode, incomingNode);
  const kindChanged = existingNode.kind !== incomingNode.kind;
  const canonChanged = existingNode.canonId !== incomingNode.canonId;
  const sourceChanged = existingNode.source !== incomingNode.source;
  const currentLines = [
    `Label: ${existingNode.label}`,
    `Kind: ${existingNode.kind}`,
    `Source: ${existingNode.source}`,
    `Canon id: ${existingNode.canonId ?? 'none'}`,
    `Canvas edges: ${existingEdgeCount}`,
  ];
  const incomingLines = [
    `Label: ${incomingNode.label}`,
    `Kind: ${incomingNode.kind}`,
    `Source: ${incomingNode.source}`,
    `Canon id: ${incomingNode.canonId ?? 'none'}`,
    `Registry note: ${normalizeText(incomingNode.detail) || 'No registry note.'}`,
  ];
  const deltas = [
    kindChanged ? `Kind mismatch: ${existingNode.kind} -> ${incomingNode.kind}` : null,
    canonChanged
      ? `Canon link mismatch: ${existingNode.canonId ?? 'none'} -> ${incomingNode.canonId ?? 'none'}`
      : null,
    sourceChanged ? `Source shift: ${existingNode.source} -> ${incomingNode.source}` : null,
    existingNode.id !== incomingNode.id ? `Node identity change: ${existingNode.id} -> ${incomingNode.id}` : null,
  ].filter(Boolean) as string[];
  const sharedImpactBadges = [
    kindChanged ? 'kind changes' : 'kind stable',
    canonChanged ? 'canon id updates' : 'canon id stable',
    sourceChanged ? 'source promoted' : 'source stable',
  ];

  return {
    currentLines,
    deltas,
    incomingLines,
    mergeImpact: {
      badgeLabels: [`node id kept`, `${existingEdgeCount} edge${existingEdgeCount === 1 ? '' : 's'} preserved`, ...sharedImpactBadges],
      edgeCount: existingEdgeCount,
      edgeMode: 'preserved',
      nodeIdentity: 'kept',
    },
    mergePreview: [
      `Keep node id ${existingNode.id}.`,
      describeChangeLine('Source', existingNode.source, mergedNode.source),
      describeChangeLine('Kind', existingNode.kind, mergedNode.kind),
      describeChangeLine('Canon id', existingNode.canonId ?? 'none', mergedNode.canonId ?? 'none'),
      `Preserve ${formatEdgeCount(existingEdgeCount)} on the current node.`,
    ],
    relinkImpact: {
      badgeLabels: [`node id replaced`, `${existingEdgeCount} edge${existingEdgeCount === 1 ? '' : 's'} rewired`, ...sharedImpactBadges],
      edgeCount: existingEdgeCount,
      edgeMode: 'rewired',
      nodeIdentity: 'replaced',
    },
    relinkPreview: [
      `Replace node id ${existingNode.id} with ${incomingNode.id}.`,
      describeChangeLine('Source', existingNode.source, mergedNode.source),
      describeChangeLine('Kind', existingNode.kind, mergedNode.kind),
      describeChangeLine('Canon id', existingNode.canonId ?? 'none', mergedNode.canonId ?? 'none'),
      `Rewrite ${formatEdgeCount(existingEdgeCount)} to the canon node id.`,
    ],
  };
}

function deriveEditionReviewItems(document: NovelProjectDocument) {
  const publishState = derivePublishState(document);
  const activeEdition = publishState.activeEdition;
  const blockerItems: NovelistReviewItem[] = publishState.blockers.map((blocker, index) => ({
    actionable:
      blocker.includes('Approve royalty') ||
      blocker.includes('Lock royalty') ||
      blocker.includes('Create a snapshot') ||
      blocker.includes('Resolve critical') ||
      blocker.includes('Resolve all open review'),
    detail: blocker,
    id: `edition-blocker-${index}-${slugify(blocker)}`,
    kind: 'edition',
    resolutionKey: blocker.includes('Approve royalty')
      ? 'approve_royalties'
      : blocker.includes('Lock royalty')
      ? 'lock_royalties'
      : blocker.includes('Create a snapshot')
        ? 'create_snapshot'
        : blocker.includes('Resolve critical')
          ? 'show_conflicts'
          : blocker.includes('Resolve all open review')
            ? 'show_proposals'
            : undefined,
    scope: activeEdition?.title ?? 'Edition',
    sortAt: document.updatedAt,
    status: 'blocked',
    title: 'Publish blocker',
  }));

  const activityItems: NovelistReviewItem[] = document.activity
    .filter((activity) => activity.kind.startsWith('edition_'))
    .map((activity) => ({
      actionable: false,
      actorName: activity.actor.name,
      createdAt: formatTimestamp(activity.createdAt),
      detail: activity.detail ?? activity.label,
      id: activity.id,
      kind: 'edition',
      pageNumber: activity.pageNumber,
      referenceId: activity.id,
      scope: activeEdition?.title ?? 'Edition',
      sortAt: activity.createdAt,
      status:
        activity.kind === 'edition_royalty_approved'
          ? 'approved'
          : activity.kind === 'edition_royalty_locked'
          ? activity.label.toLowerCase().includes('unlock')
            ? 'unlocked'
            : 'locked'
          : 'updated',
      title: activity.label,
    }));

  return [...blockerItems, ...activityItems];
}

export function deriveReviewItems(project: NovelProject, document: NovelProjectDocument): NovelistReviewItem[] {
  const proposalItems: NovelistReviewItem[] = getSortedProposals(document)
    .filter((proposal) => proposal.status === 'queued' || proposal.status === 'stale')
    .map((proposal) => ({
      afterText: proposal.generatedText,
      actionable: proposal.status === 'queued',
      actorName: proposal.actor.name,
      beforeText: proposal.targetText,
      confidence: proposal.confidence,
      createdAt: formatTimestamp(proposal.createdAt),
      detail: proposal.instruction,
      id: `review-${proposal.id}`,
      isPlaceholder: proposal.isPlaceholder,
      kind: 'proposal',
      pageNumber: proposal.pageNumber,
      rationale: proposal.rationale,
      referenceId: proposal.id,
      scope: getScope(document, proposal.sceneId, proposal.pageNumber),
      sortAt: proposal.createdAt,
      status: proposal.status,
      title: `${proposal.mode[0]?.toUpperCase() ?? ''}${proposal.mode.slice(1)} draft review`,
      warnings: proposal.warnings,
    }));

  const commentItems: NovelistReviewItem[] = document.comments.map((comment) => {
    const scopeInfo = getCommentScopeInfo(document, comment);

    return {
      actionable: false,
      actorName: comment.createdBy.name,
      createdAt: formatTimestamp(comment.createdAt),
      detail: comment.text,
      id: `review-${comment.id}`,
      kind: 'comment',
      pageNumber: scopeInfo.pageNumber ?? undefined,
      referenceId: comment.id,
      scope: scopeInfo.scope,
      sortAt: comment.createdAt,
      status: 'open',
      title: `Comment on ${comment.scope}`,
    };
  });

  const conflictItems: NovelistReviewItem[] = deriveVisibleConflicts(project, document).map((conflict) => {
    const scopeInfo = getConflictScopeInfo(document, conflict);

    return {
      actionable: true,
      canonComparison:
        conflict.resolutionContext?.kind === 'canon_link' ? deriveCanonConflictComparison(document, conflict.id) ?? undefined : undefined,
      conflictVoteSummary: conflict.voteSummary,
      conflictVotes: conflict.votes,
      detail: conflict.detail,
      id: `review-${conflict.id}`,
      kind: 'conflict',
      pageNumber: scopeInfo.pageNumber,
      referenceId: conflict.id,
      scope: scopeInfo.scope,
      sortAt: conflict.voteSummary.updatedAt ?? document.updatedAt,
      status: conflict.severity,
      title: conflict.title,
    };
  });

  const resolvedConflictItems: NovelistReviewItem[] = document.activity
    .filter((activity) => activity.kind === 'canon_conflict_resolved')
    .map((activity) => ({
      actionable: false,
      actorName: activity.actor.name,
      canonComparison: activity.canonComparison,
      createdAt: formatTimestamp(activity.createdAt),
      detail: activity.detail ?? activity.label,
      id: `review-${activity.id}`,
      kind: 'conflict',
      pageNumber: activity.pageNumber,
      scope: typeof activity.pageNumber === 'number' ? getScopeFromPageNumber(document, activity.pageNumber) : 'Project',
      sortAt: activity.createdAt,
      status: getCanonConflictStatusLabel(activity.resolution),
      title: activity.label,
    }));

  return [...proposalItems, ...conflictItems, ...resolvedConflictItems, ...commentItems, ...deriveEditionReviewItems(document)].sort((left, right) => {
    const leftActionable = left.actionable ? 1 : 0;
    const rightActionable = right.actionable ? 1 : 0;
    if (rightActionable !== leftActionable) {
      return rightActionable - leftActionable;
    }

    return new Date(right.sortAt).getTime() - new Date(left.sortAt).getTime();
  });
}

export function deriveOperations(document: NovelProjectDocument): StudioOperation[] {
  const proposalsById = new Map(document.proposals.map((proposal) => [proposal.id, proposal]));

  const proposalOps = getSortedProposals(document).map((proposal) => ({
    actorId: proposal.actor.id,
    actorName: proposal.actor.name,
    createdAt: formatTimestamp(proposal.createdAt),
    detail: proposal.instruction,
    id: proposal.id,
    kind: 'proposal' as const,
    label: `Queued ${proposal.mode} draft`,
    pageNumber: proposal.pageNumber,
    scope: getScope(document, proposal.sceneId, proposal.pageNumber),
    sortAt: proposal.createdAt,
    status: proposal.status,
  }));

  const decisionOps = getSortedDecisions(document).flatMap((decision) => {
    const proposal = proposalsById.get(decision.proposalId);
    if (!proposal) {
      return [];
    }

    return [
      {
        actorId: decision.reviewer.id,
        actorName: decision.reviewer.name,
        createdAt: formatTimestamp(decision.createdAt),
        detail: appendReviewerNote(proposal.instruction, decision.reviewerNote),
        id: decision.id,
        kind: 'review' as const,
        label: `${decision.decision === 'accepted' ? 'Accepted' : 'Rejected'} ${proposal.actor.name}'s ${proposal.mode} draft`,
        pageNumber: proposal.pageNumber,
        scope: getScope(document, proposal.sceneId, proposal.pageNumber),
        sortAt: decision.createdAt,
        status: decision.decision,
      },
    ];
  });

  const snapshotOps = document.snapshots.map((snapshot) => ({
    actorId: snapshot.createdBy.id,
    actorName: snapshot.createdBy.name,
    createdAt: formatTimestamp(snapshot.createdAt),
    id: snapshot.id,
    kind: 'snapshot' as const,
    label: `Captured snapshot "${snapshot.label}"`,
    pageNumber: snapshot.pageNumber,
    scope: snapshot.scope,
    sortAt: snapshot.createdAt,
  }));

  const analysisOps = document.analysisRuns.map((run) => ({
    actorId: run.createdBy.id,
    actorName: run.createdBy.name,
    createdAt: formatTimestamp(run.createdAt),
    detail: run.notes[0],
    id: run.id,
    kind: 'analysis' as const,
    label: `${run.depth === 'pro' ? 'Pro' : 'Standard'} analysis run`,
    scope: 'Accepted draft',
    sortAt: run.createdAt,
    status: run.status,
  }));

  const exportOps = document.editions.flatMap((edition) =>
    edition.exportJobs.map((job) => ({
      actorId: job.requestedBy.id,
      actorName: job.requestedBy.name,
      createdAt: formatTimestamp(job.createdAt),
      detail: `${job.format.toUpperCase()} from snapshot ${job.snapshotId}`,
      id: job.id,
      kind: 'export' as const,
      label: job.label,
      scope: edition.title,
      sortAt: job.createdAt,
      status: job.status,
    }))
  );

  const commentOps = document.comments.map((comment) => {
    const scopeInfo = getCommentScopeInfo(document, comment);

    return {
      actorId: comment.createdBy.id,
      actorName: comment.createdBy.name,
      createdAt: formatTimestamp(comment.createdAt),
      detail: comment.text,
      id: comment.id,
      kind: 'comment' as const,
      label: `Comment on ${comment.scope}`,
      pageNumber: scopeInfo.pageNumber ?? undefined,
      scope: scopeInfo.scope,
      sortAt: comment.createdAt,
      status: comment.scope,
    };
  });

  const conflictOps = document.conflictDismissals.map((dismissal) => ({
    actorId: dismissal.actor.id,
    actorName: dismissal.actor.name,
    createdAt: formatTimestamp(dismissal.createdAt),
    detail:
      dismissal.resolutionSource === 'vote_threshold'
        ? `Dismissed automatically after the ${dismissal.vote ?? 'dismiss'} vote crossed the weighted threshold.`
        : `Dismissed from the current continuity queue.`,
    id: dismissal.id,
    kind: 'conflict' as const,
    label:
      dismissal.resolutionSource === 'vote_threshold'
        ? `Auto-dismissed conflict "${dismissal.title}"`
        : `Dismissed conflict "${dismissal.title}"`,
    pageNumber: dismissal.pageNumber,
    scope: getScopeFromPageNumber(document, dismissal.pageNumber),
    sortAt: dismissal.createdAt,
    status: 'dismissed',
  }));

  const activityOps = document.activity.map((activity) => ({
    actorId: activity.actor.id,
    actorName: activity.actor.name,
    canonComparison: activity.canonComparison,
    createdAt: formatTimestamp(activity.createdAt),
    detail: activity.detail,
    id: activity.id,
    impactBadges:
      activity.kind === 'canon_conflict_resolved'
        ? activity.canonComparison?.[activity.resolution === 'merge' ? 'mergeImpact' : 'relinkImpact'].badgeLabels
        : undefined,
    kind:
      activity.kind === 'canon_conflict_resolved' || activity.kind === 'canon_conflict_voted'
        ? ('conflict' as const)
        : activity.kind.startsWith('graph_')
          ? ('graph' as const)
          : activity.kind.startsWith('snapshot_')
            ? ('snapshot' as const)
            : ('edition' as const),
    label: activity.label,
    pageNumber: activity.pageNumber,
    scope: typeof activity.pageNumber === 'number' ? getScopeFromPageNumber(document, activity.pageNumber) : 'Project',
    sortAt: activity.createdAt,
    status:
      activity.kind === 'canon_conflict_resolved'
        ? getCanonConflictStatusLabel(activity.resolution)
        : activity.kind === 'canon_conflict_voted'
        ? `${activity.vote ?? 'canon'} vote`
        : activity.kind === 'edition_royalty_approved'
        ? 'approved'
        : activity.kind === 'edition_royalty_locked'
        ? activity.label.toLowerCase().includes('unlock')
          ? 'unlocked'
          : 'locked'
        : undefined,
  }));

  return [...proposalOps, ...decisionOps, ...snapshotOps, ...analysisOps, ...exportOps, ...commentOps, ...conflictOps, ...activityOps].sort((left, right) => {
    const rightTime = new Date(right.sortAt).getTime();
    const leftTime = new Date(left.sortAt).getTime();
    return rightTime - leftTime;
  });
}

function deriveEditionBlockers(document: NovelProjectDocument) {
  const latestSnapshot = [...document.snapshots].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null;
  const activeEdition = document.editions[0] ?? null;
  const blockers: string[] = [];
  const openCriticalConflict = deriveVisibleConflicts({ conflicts: [] } as NovelProject, document).some(
    (conflict) => conflict.severity === 'critical'
  );
  const openQueued = document.proposals.some((proposal) => proposal.status === 'queued');

  if (openCriticalConflict) blockers.push('Resolve critical continuity or canon conflicts.');
  if (openQueued) blockers.push('Resolve all open review-required proposals.');
  if (!activeEdition?.royaltyLocked) blockers.push('Lock royalty shares before publishing.');
  if (activeEdition?.royaltyApprovalRequired) blockers.push('Approve royalty changes before publishing.');
  if (!latestSnapshot) blockers.push('Create a snapshot before export or publish.');

  return {
    blockers,
    latestSnapshot,
  };
}

function normalizePublishBlockers(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.length > 0) : [];
}

export function syncEditionState(document: NovelProjectDocument) {
  const { blockers, latestSnapshot } = deriveEditionBlockers(document);

  document.editions = document.editions.map((edition, index) => ({
    ...edition,
    blockers,
    royaltyApprovalRequired: edition.royaltyApprovalRequired ?? false,
    royaltyApprovedAt: edition.royaltyApprovedAt ?? null,
    royaltyApprovedBy: edition.royaltyApprovedBy ?? null,
    snapshotId: edition.snapshotId ?? (index === 0 ? latestSnapshot?.id ?? null : edition.snapshotId),
    status: blockers.length === 0 ? 'ready' : 'blocked',
    updatedAt: new Date().toISOString(),
  }));

  return document;
}

export function derivePublishState(document: NovelProjectDocument) {
  const syncedDocument = syncEditionState(cloneJson(document));
  const activeEdition = syncedDocument.editions[0] ?? null;
  const latestSnapshot =
    [...syncedDocument.snapshots].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null;
  const blockers = normalizePublishBlockers(activeEdition?.blockers);

  return {
    activeEdition,
    blockers,
    isReady: Boolean(activeEdition) && blockers.length === 0,
    latestSnapshot,
  };
}

export function deriveProjectView(project: NovelProject, session: NovelistProjectSession): NovelistDerivedProjectView {
  return {
    analysis: deriveLatestAnalysis(session.document),
    historyEntries: deriveHistoryEntries(project, session.document),
    publishState: derivePublishState(session.document),
    reviewItems: deriveReviewItems(project, session.document),
    studioOperations: deriveOperations(session.document),
    visibleConflicts: deriveVisibleConflicts(project, session.document),
  };
}

export function applyProjectOperation(
  session: NovelistProjectSession,
  operation: NovelistProjectOperation
): NovelistProjectSession {
  if (operation.type === 'queue_proposal') {
    return {
      ...session,
      document: queueProposal(session.document, operation.proposal),
    };
  }

  if (operation.type === 'accept_proposal') {
    return {
      ...session,
      document: acceptProposal(session.document, operation.proposalId, operation.reviewer, operation.reviewerNote),
    };
  }

  if (operation.type === 'reject_proposal') {
    return {
      ...session,
      document: rejectProposal(session.document, operation.proposalId, operation.reviewer, operation.reviewerNote),
    };
  }

  if (operation.type === 'dismiss_conflict') {
    return {
      ...session,
      document: dismissConflict(session.document, operation.conflict, operation.actor, operation.pageNumber),
    };
  }

  if (operation.type === 'resolve_canon_conflict') {
    return {
      ...session,
      document: resolveCanonConflict(
        session.document,
        operation.conflictId,
        operation.resolution,
        operation.actor,
        operation.pageNumber
      ),
    };
  }

  if (operation.type === 'vote_canon_conflict') {
    return {
      ...session,
      document: voteCanonConflict(session.document, operation.conflictId, operation.vote, operation.actor, operation.pageNumber),
    };
  }

  if (operation.type === 'append_analysis_run') {
    return {
      ...session,
      document: appendAnalysisRun(session.document, operation.run),
    };
  }

  if (operation.type === 'create_snapshot') {
    return {
      ...session,
      document: createSnapshot(session.document, operation.actor, {
        label: operation.label,
        pageNumber: operation.pageNumber,
        scope: operation.scope,
        scopeId: operation.scopeId,
      }),
    };
  }

  if (operation.type === 'restore_snapshot') {
    return {
      ...session,
      document: restoreSnapshot(session.document, operation.snapshotId, operation.actor),
    };
  }

  if (operation.type === 'add_export_job') {
    return {
      ...session,
      document: addExportJob(session.document, operation.actor, {
        format: operation.format,
        label: operation.label,
        snapshotId: operation.snapshotId,
      }),
    };
  }

  if (operation.type === 'add_comment') {
    return {
      ...session,
      document: addComment(session.document, operation.comment),
    };
  }

  if (operation.type === 'add_graph_node') {
    return {
      ...session,
      document: addGraphNode(session.document, operation.node, operation.actor, operation.pageNumber),
    };
  }

  if (operation.type === 'update_edition_price') {
    return {
      ...session,
      document: updateEditionPrice(session.document, operation.priceUsd, operation.actor),
    };
  }

  if (operation.type === 'update_edition_share') {
    return {
      ...session,
      document: updateEditionShare(
        session.document,
        operation.contributorId,
        operation.share,
        operation.overrideReason,
        operation.actor,
        operation.contributorName
      ),
    };
  }

  if (operation.type === 'approve_edition_royalties') {
    return {
      ...session,
      document: approveEditionRoyalties(session.document, operation.actor),
    };
  }

  if (operation.type === 'set_edition_royalty_locked') {
    return {
      ...session,
      document: setEditionRoyaltyLocked(session.document, operation.locked, operation.actor),
    };
  }

  return {
    ...session,
  };
}

export function deriveGraphCanvas(document: NovelProjectDocument) {
  const entityNodes: NovelCanvasNode<PlotNodeData>[] = document.graph.nodes.map((node, index) => ({
    data: {
      accent: node.accent,
      detail: node.detail,
      kind: `${node.kind}${node.source === 'inferred' ? ' / inferred' : ''}`,
      references: node.references,
      title: node.label,
    },
    id: node.id,
    position: {
      x: typeof node.x === 'number' ? node.x : 120 + (index % 4) * 280,
      y: typeof node.y === 'number' ? node.y : 40 + Math.floor(index / 4) * 180,
    },
    type: 'plot',
  }));

  const sceneNodes: NovelCanvasNode<PlotNodeData>[] = Object.values(document.scenes).map((scene, index) => {
    const chapter = document.chapters[scene.chapterId];
    return {
      data: {
        accent: '#1e7c62',
        detail: scene.summary,
        kind: document.mode === 'lore' ? 'Lore scene' : 'Scene',
        references: [chapter?.title ?? 'Unknown chapter', `Page ${scene.pageNumber}`],
        title: scene.title,
      },
      id: `scene-${scene.id}`,
      position: {
        x: 80 + (index % 3) * 360,
        y: 460 + Math.floor(index / 3) * 220,
      },
      type: 'plot',
    };
  });

  const mentionEdges: NovelCanvasEdge[] = document.graph.mentionEdges.map((edge) => ({
    animated: edge.source === 'inferred',
    id: edge.id,
    label: edge.source === 'explicit' ? 'mentioned in draft' : 'inferred mention',
    source: edge.sourceNodeId,
    target: `scene-${edge.targetSceneId}`,
  }));

  const explicitEdges: NovelCanvasEdge[] = document.graph.explicitEdges.map((edge) => ({
    id: edge.id,
    label: edge.label,
    source: edge.source,
    target: edge.target,
  }));

  return {
    edges: [...explicitEdges, ...mentionEdges],
    nodes: [...entityNodes, ...sceneNodes],
  };
}

export function queueProposal(document: NovelProjectDocument, proposal: RevisionProposal) {
  const nextDocument = cloneJson(document);
  nextDocument.proposals.unshift(proposal);
  return withDocumentTouch(nextDocument);
}

export function acceptProposal(document: NovelProjectDocument, proposalId: string, reviewer: NovelistActor, reviewerNote?: string) {
  const nextDocument = cloneJson(document);
  const proposal = nextDocument.proposals.find((item) => item.id === proposalId);
  if (!proposal || proposal.status === 'accepted' || proposal.status === 'rejected') {
    return nextDocument;
  }

  const livePassages = getScenePassages(nextDocument, proposal.sceneId);
  if (createSnapshotFingerprint(livePassages) !== proposal.snapshotFingerprint) {
    proposal.status = 'stale';
    return withDocumentTouch(nextDocument);
  }

  const { previousText, resultPassages, targetPassageId } = applyProposalToPassages(livePassages, proposal);
  replaceScenePassages(nextDocument, proposal.sceneId, resultPassages);

  proposal.status = 'accepted';

  nextDocument.proposals.forEach((item) => {
    if (item.id !== proposal.id && item.sceneId === proposal.sceneId && item.passageId === (targetPassageId ?? proposal.passageId) && item.status === 'queued') {
      item.status = 'stale';
    }
  });

  attachDecision(nextDocument, proposal.id, {
    createdAt: new Date().toISOString(),
    decision: 'accepted',
    id: createEventId('decision'),
    nextText: proposal.generatedText,
    previousText,
    proposalId: proposal.id,
    reviewer,
    reviewerNote,
    wordDelta: calculateWordDelta(previousText, proposal.generatedText),
  });

  recalculateDocumentGraph(nextDocument);
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function rejectProposal(document: NovelProjectDocument, proposalId: string, reviewer: NovelistActor, reviewerNote?: string) {
  const nextDocument = cloneJson(document);
  const proposal = nextDocument.proposals.find((item) => item.id === proposalId);
  if (!proposal || proposal.status === 'accepted' || proposal.status === 'rejected') {
    return nextDocument;
  }

  proposal.status = 'rejected';

  attachDecision(nextDocument, proposal.id, {
    createdAt: new Date().toISOString(),
    decision: 'rejected',
    id: createEventId('decision'),
    nextText: null,
    previousText: proposal.targetText,
    proposalId: proposal.id,
    reviewer,
    reviewerNote,
    wordDelta: {
      additions: 0,
      removals: 0,
      replacements: 0,
    },
  });

  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function dismissConflict(
  document: NovelProjectDocument,
  conflict: NovelistConflict | NovelConflict,
  actor: NovelistActor,
  pageNumber: number,
  options?: {
    resolutionSource?: ConflictResolutionSource;
    vote?: CanonConflictVoteChoice;
  }
) {
  const nextDocument = cloneJson(document);
  if (nextDocument.dismissedConflictIds.includes(conflict.id)) {
    return nextDocument;
  }

  const createdAt = new Date().toISOString();
  nextDocument.dismissedConflictIds.push(conflict.id);
  nextDocument.conflictDismissals.unshift({
    actor,
    conflictId: conflict.id,
    createdAt,
    id: createEventId('conflict-dismissal'),
    pageNumber,
    resolutionSource: options?.resolutionSource,
    title: conflict.title,
    vote: options?.vote,
  });
  nextDocument.analysisRuns = nextDocument.analysisRuns.map((run) => ({
    ...run,
    conflicts: run.conflicts.map((item) => (item.id === conflict.id ? { ...item, status: 'dismissed' } : item)),
  }));
  clearConflictVotes(nextDocument, conflict.id);

  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function appendAnalysisRun(document: NovelProjectDocument, run: AnalysisRunRecord) {
  const nextDocument = cloneJson(document);
  nextDocument.analysisRuns.unshift(run);
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function createSnapshot(document: NovelProjectDocument, actor: NovelistActor, options: { label: string; pageNumber: number; scope: SnapshotScope; scopeId: string }) {
  const nextDocument = cloneJson(document);
  const passages =
    options.scope === 'scene'
      ? getScenePassages(nextDocument, options.scopeId)
      : Object.values(nextDocument.passages)
          .sort((left, right) => left.id.localeCompare(right.id))
          .map((passage) => ({ id: passage.id, text: passage.text }));

  nextDocument.snapshots.unshift({
    createdAt: new Date().toISOString(),
    createdBy: actor,
    id: createEventId('snapshot'),
    label: options.label,
    pageNumber: options.pageNumber,
    passages: passages.map((passage) => ({
      passageId: passage.id,
      text: passage.text,
    })),
    scope: options.scope,
    scopeId: options.scopeId,
  });

  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function restoreSnapshot(document: NovelProjectDocument, snapshotId: string, actor?: NovelistActor) {
  const nextDocument = cloneJson(document);
  const snapshot = nextDocument.snapshots.find((item) => item.id === snapshotId);
  if (!snapshot) {
    return nextDocument;
  }

  snapshot.passages.forEach((passage) => {
    if (!nextDocument.passages[passage.passageId]) return;
    nextDocument.passages[passage.passageId] = {
      ...nextDocument.passages[passage.passageId],
      text: passage.text,
    };
  });

  nextDocument.proposals.forEach((proposal) => {
    if (proposal.status === 'queued') {
      proposal.status = 'stale';
    }
  });

  if (actor) {
    appendActivityRecord(nextDocument, {
      actor,
      createdAt: new Date().toISOString(),
      detail: `Accepted draft restored from ${snapshot.scope} snapshot.`,
      id: createEventId('activity'),
      kind: 'snapshot_restored',
      label: `Restored snapshot "${snapshot.label}"`,
      pageNumber: snapshot.pageNumber,
    });
  }

  recalculateDocumentGraph(nextDocument);
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function addComment(document: NovelProjectDocument, comment: CommentRecord) {
  const nextDocument = cloneJson(document);
  nextDocument.comments.unshift(comment);
  return withDocumentTouch(nextDocument);
}

function getCanonConflictId(node: Pick<GraphEntityNode, 'label'>) {
  return `canon-conflict-${slugify(node.label)}`;
}

function clearConflictVotes(document: NovelProjectDocument, conflictId: string) {
  document.conflictVotes = document.conflictVotes.filter((entry) => entry.conflictId !== conflictId);
  return document;
}

function upsertDerivedConflict(document: NovelProjectDocument, conflict: NovelistConflict) {
  document.derivedConflicts = [conflict, ...document.derivedConflicts.filter((item) => item.id !== conflict.id)];
  return document;
}

function clearDerivedConflict(document: NovelProjectDocument, conflictId: string) {
  document.derivedConflicts = document.derivedConflicts.filter((item) => item.id !== conflictId);
  clearConflictVotes(document, conflictId);
  return document;
}

function isCanonNodeCompatible(existingNode: GraphEntityNode, incomingNode: GraphEntityNode) {
  return (
    existingNode.kind === incomingNode.kind &&
    (!existingNode.canonId || !incomingNode.canonId || existingNode.canonId === incomingNode.canonId)
  );
}

function mergeGraphNode(existingNode: GraphEntityNode, incomingNode: GraphEntityNode) {
  return {
    ...existingNode,
    accent: incomingNode.accent || existingNode.accent,
    canonId: incomingNode.canonId ?? existingNode.canonId,
    detail: normalizeText(incomingNode.detail) || existingNode.detail,
    kind: incomingNode.kind,
    label: normalizeText(incomingNode.label) || existingNode.label,
    references: Array.from(new Set([...(existingNode.references ?? []), ...(incomingNode.references ?? [])])),
    sceneIds: Array.from(new Set([...(existingNode.sceneIds ?? []), ...(incomingNode.sceneIds ?? [])])),
    source: incomingNode.source === 'canon' ? 'canon' : existingNode.source,
    x: existingNode.x ?? incomingNode.x,
    y: existingNode.y ?? incomingNode.y,
  } satisfies GraphEntityNode;
}

function createCanonLinkConflict(document: NovelProjectDocument, existingNode: GraphEntityNode, incomingNode: GraphEntityNode): NovelistConflict {
  const sceneId = existingNode.sceneIds[0] ?? Object.values(document.scenes)[0]?.id;
  const chapterTitle =
    sceneId && document.scenes[sceneId] ? document.chapters[document.scenes[sceneId].chapterId]?.title ?? document.title : document.title;
  const kindMismatch = existingNode.kind !== incomingNode.kind;
  const canonMismatch = Boolean(existingNode.canonId && incomingNode.canonId && existingNode.canonId !== incomingNode.canonId);

  return {
    chapter: chapterTitle,
    detail: kindMismatch
      ? `Canon registry identifies "${incomingNode.label}" as ${incomingNode.kind}, but the current graph node is ${existingNode.kind}. Review before replacing the project link.`
      : `Canon registry wants to link "${incomingNode.label}" to ${incomingNode.canonId ?? 'a canon record'}, but the current node already points to ${existingNode.canonId ?? 'a local-only project node'}. Review before relinking.`,
    id: getCanonConflictId(incomingNode),
    resolutionContext: {
      existingNodeId: existingNode.id,
      incomingNode,
      kind: 'canon_link',
    },
    severity: kindMismatch || canonMismatch ? 'critical' : 'warning',
    source: 'canon',
    status: 'open',
    title: `Canon disagreement for "${incomingNode.label}"`,
    voteSummary: createEmptyConflictVoteSummary(),
    votes: [],
  };
}

function replaceExplicitEdgeNodeId(document: NovelProjectDocument, sourceNodeId: string, targetNodeId: string) {
  document.graph.explicitEdges = document.graph.explicitEdges.map((edge) => ({
    ...edge,
    source: edge.source === sourceNodeId ? targetNodeId : edge.source,
    target: edge.target === sourceNodeId ? targetNodeId : edge.target,
  }));
  return document;
}

export function addGraphNode(document: NovelProjectDocument, node: GraphEntityNode, actor?: NovelistActor, pageNumber?: number) {
  const nextDocument = cloneJson(document);
  const normalizedLabel = normalizeText(node.label).toLowerCase();

  if (node.source === 'canon') {
    const currentNode = nextDocument.graph.nodes.find(
      (item) =>
        item.source !== 'inferred' &&
        (item.canonId === node.canonId || normalizeText(item.label).toLowerCase() === normalizedLabel)
    );

    if (currentNode && !isCanonNodeCompatible(currentNode, node)) {
      upsertDerivedConflict(nextDocument, createCanonLinkConflict(nextDocument, currentNode, node));
      return withDocumentTouch(nextDocument);
    }

    const mergedNode = currentNode ? mergeGraphNode(currentNode, node) : node;
    nextDocument.graph.nodes = [
      ...nextDocument.graph.nodes.filter((item) => {
        if (currentNode && item.id === currentNode.id) return false;
        if (item.id === node.id) return false;
        if (item.source === 'inferred' && normalizeText(item.label).toLowerCase() === normalizedLabel) return false;
        return true;
      }),
      {
        ...mergedNode,
        id: currentNode?.id ?? node.id,
      },
    ];
    clearDerivedConflict(nextDocument, getCanonConflictId(node));
  } else {
    nextDocument.graph.nodes = [...nextDocument.graph.nodes.filter((item) => item.id !== node.id), node];
  }

  recalculateDocumentGraph(nextDocument);
  if (actor) {
    appendActivityRecord(nextDocument, {
      actor,
      createdAt: new Date().toISOString(),
      detail: node.detail,
      id: createEventId('activity'),
      kind: 'graph_node_added',
      label: `${node.source === 'canon' ? 'Linked canon' : 'Added'} ${node.kind} node "${node.label}"`,
      pageNumber,
    });
  }
  return withDocumentTouch(nextDocument);
}

export function resolveCanonConflict(
  document: NovelProjectDocument,
  conflictId: string,
  resolution: 'merge' | 'relink',
  actor?: NovelistActor,
  pageNumber?: number,
  resolutionSource: ConflictResolutionSource = 'manual'
) {
  const nextDocument = cloneJson(document);
  const conflict = nextDocument.derivedConflicts.find((item) => item.id === conflictId);
  const comparison = deriveCanonConflictComparison(nextDocument, conflictId);

  if (!conflict?.resolutionContext || conflict.resolutionContext.kind !== 'canon_link') {
    return document;
  }

  const { existingNodeId, incomingNode } = conflict.resolutionContext;
  const existingNode = nextDocument.graph.nodes.find((item) => item.id === existingNodeId);

  if (!existingNode) {
    clearDerivedConflict(nextDocument, conflictId);
    return withDocumentTouch(nextDocument);
  }

  const normalizedLabel = normalizeText(incomingNode.label).toLowerCase();
  const mergedNode = mergeGraphNode(existingNode, incomingNode);

  if (resolution === 'merge') {
    nextDocument.graph.nodes = [
      ...nextDocument.graph.nodes.filter((item) => {
        if (item.id === existingNode.id) return false;
        if (item.id === incomingNode.id) return false;
        if (item.source === 'inferred' && normalizeText(item.label).toLowerCase() === normalizedLabel) return false;
        return true;
      }),
      {
        ...mergedNode,
        id: existingNode.id,
      },
    ];
  } else {
    const relinkedNode = {
      ...mergedNode,
      id: incomingNode.id,
      x: existingNode.x ?? incomingNode.x,
      y: existingNode.y ?? incomingNode.y,
    } satisfies GraphEntityNode;

    replaceExplicitEdgeNodeId(nextDocument, existingNode.id, relinkedNode.id);
    nextDocument.graph.nodes = [
      ...nextDocument.graph.nodes.filter((item) => {
        if (item.id === existingNode.id) return false;
        if (item.id === incomingNode.id) return false;
        if (item.source === 'inferred' && normalizeText(item.label).toLowerCase() === normalizedLabel) return false;
        return true;
      }),
      relinkedNode,
    ];
  }

  clearDerivedConflict(nextDocument, conflictId);
  recalculateDocumentGraph(nextDocument);

  if (actor) {
    const autoResolvedPrefix = resolutionSource === 'vote_threshold' ? 'Vote threshold reached. ' : '';
    appendActivityRecord(nextDocument, {
      actor,
      canonComparison: comparison ?? undefined,
      conflictId,
      createdAt: new Date().toISOString(),
      detail: `${autoResolvedPrefix}${comparison?.[resolution === 'merge' ? 'mergePreview' : 'relinkPreview'].join(' ') ?? conflict.detail}`,
      id: createEventId('activity'),
      kind: 'canon_conflict_resolved',
      label:
        resolution === 'merge'
          ? `${resolutionSource === 'vote_threshold' ? 'Auto-merged' : 'Merged'} canon data into "${incomingNode.label}"`
          : `${resolutionSource === 'vote_threshold' ? 'Auto-relinked' : 'Relinked'} "${incomingNode.label}" to canon node`,
      pageNumber,
      resolution,
      resolutionSource,
    });
  }

  return withDocumentTouch(nextDocument);
}

export function voteCanonConflict(
  document: NovelProjectDocument,
  conflictId: string,
  vote: CanonConflictVoteChoice,
  actor: NovelistActor,
  pageNumber?: number
) {
  const nextDocument = cloneJson(document);
  const conflict = getConflictById(nextDocument, conflictId);
  if (!conflict?.resolutionContext || conflict.resolutionContext.kind !== 'canon_link') {
    return nextDocument;
  }

  nextDocument.conflictVotes = nextDocument.conflictVotes.filter(
    (entry) => !(entry.conflictId === conflictId && entry.actor.id === actor.id)
  );

  const createdAt = new Date().toISOString();
  nextDocument.conflictVotes.unshift({
    actor,
    conflictId,
    createdAt,
    id: createEventId('conflict-vote'),
    pageNumber,
    vote,
  });

  const summary = deriveConflictVoteSummary(nextDocument, getConflictVotes(nextDocument, conflictId));
  appendActivityRecord(nextDocument, {
    actor,
    conflictId,
    createdAt,
    detail: `Current tally: merge ${summary.counts.merge} (${summary.weightedCounts.merge} weight), relink ${summary.counts.relink} (${summary.weightedCounts.relink} weight), dismiss ${summary.counts.dismiss} (${summary.weightedCounts.dismiss} weight). Threshold ${summary.requiredVoteCount}/${summary.eligibleVoterCount} voters and ${summary.requiredWeight}/${summary.eligibleWeight} weight.`,
    id: createEventId('activity'),
    kind: 'canon_conflict_voted',
    label: `Voted to ${vote} "${conflict.title}"`,
    pageNumber,
    vote,
  });

  if (summary.resolutionVote === 'dismiss') {
    return dismissConflict(nextDocument, conflict, actor, pageNumber ?? conflict.votes[0]?.pageNumber ?? 0, {
      resolutionSource: 'vote_threshold',
      vote: summary.resolutionVote,
    });
  }

  if (summary.resolutionVote === 'merge' || summary.resolutionVote === 'relink') {
    return resolveCanonConflict(nextDocument, conflictId, summary.resolutionVote, actor, pageNumber, 'vote_threshold');
  }

  return withDocumentTouch(nextDocument);
}

export function updateEditionPrice(document: NovelProjectDocument, priceUsd: number, actor?: NovelistActor) {
  const nextDocument = cloneJson(document);
  nextDocument.editions = nextDocument.editions.map((edition, index) =>
    index === 0
      ? {
          ...edition,
          priceUsd,
          updatedAt: new Date().toISOString(),
        }
      : edition
  );
  if (actor) {
    appendActivityRecord(nextDocument, {
      actor,
      createdAt: new Date().toISOString(),
      id: createEventId('activity'),
      kind: 'edition_price_updated',
      label: `Updated edition price to $${priceUsd.toFixed(2)}`,
    });
  }
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function updateEditionShare(
  document: NovelProjectDocument,
  contributorId: string,
  share: number,
  overrideReason: string | null,
  actor?: NovelistActor,
  contributorName?: string
) {
  const nextDocument = cloneJson(document);
  nextDocument.editions = nextDocument.editions.map((edition, index) =>
    index === 0
      ? markRoyaltyApprovalPending({
          ...edition,
          royaltyShares: edition.royaltyShares.map((item) =>
            item.contributorId === contributorId ? { ...item, overrideReason, share } : item
          ),
          updatedAt: new Date().toISOString(),
        })
      : edition
  );
  if (actor) {
    appendActivityRecord(nextDocument, {
      actor,
      createdAt: new Date().toISOString(),
      detail: overrideReason ?? undefined,
      id: createEventId('activity'),
      kind: 'edition_share_updated',
      label: `Set ${contributorName ?? contributorId} royalty share to ${share}%`,
    });
  }
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function setEditionRoyaltyLocked(document: NovelProjectDocument, locked: boolean, actor?: NovelistActor) {
  const nextDocument = cloneJson(document);
  nextDocument.editions = nextDocument.editions.map((edition, index) =>
    index === 0
      ? markRoyaltyApprovalPending({
          ...edition,
          royaltyLocked: locked,
          updatedAt: new Date().toISOString(),
        })
      : edition
  );
  if (actor) {
    appendActivityRecord(nextDocument, {
      actor,
      createdAt: new Date().toISOString(),
      id: createEventId('activity'),
      kind: 'edition_royalty_locked',
      label: `${locked ? 'Locked' : 'Unlocked'} royalty shares`,
    });
  }
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function approveEditionRoyalties(document: NovelProjectDocument, actor: NovelistActor) {
  const nextDocument = cloneJson(document);
  nextDocument.editions = nextDocument.editions.map((edition, index) =>
    index === 0
      ? {
          ...edition,
          royaltyApprovalRequired: false,
          royaltyApprovedAt: new Date().toISOString(),
          royaltyApprovedBy: actor,
          updatedAt: new Date().toISOString(),
        }
      : edition
  );
  appendActivityRecord(nextDocument, {
    actor,
    createdAt: new Date().toISOString(),
    detail: 'Final royalty split approved for publishing readiness.',
    id: createEventId('activity'),
    kind: 'edition_royalty_approved',
    label: 'Approved royalty changes',
  });
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function addExportJob(
  document: NovelProjectDocument,
  actor: NovelistActor,
  input: {
    format: ExportFormat;
    label: string;
    snapshotId: string;
  }
) {
  const nextDocument = cloneJson(document);
  nextDocument.editions = nextDocument.editions.map((edition, index) =>
    index === 0
      ? {
          ...edition,
          exportJobs: [
            {
              createdAt: new Date().toISOString(),
              editionId: edition.id,
              format: input.format,
              id: createEventId('export-job'),
              isPlaceholder: true,
              label: input.label,
              requestedBy: actor,
              snapshotId: input.snapshotId,
              status: 'queued',
            },
            ...edition.exportJobs,
          ],
          snapshotId: input.snapshotId,
          updatedAt: new Date().toISOString(),
        }
      : edition
  );
  syncEditionState(nextDocument);
  return withDocumentTouch(nextDocument);
}

export function hydrateSession(project: NovelProject, session: NovelistProjectSession | null | undefined) {
  const fallback = createDefaultSession(project);
  if (!session?.document) {
    return fallback;
  }

  const nextDocument = cloneJson(session.document);
  nextDocument.activity = Array.isArray(nextDocument.activity) ? nextDocument.activity : [];
  nextDocument.conflictVotes = Array.isArray(nextDocument.conflictVotes) ? nextDocument.conflictVotes : [];
  nextDocument.derivedConflicts = Array.isArray(nextDocument.derivedConflicts) ? nextDocument.derivedConflicts : [];
  nextDocument.editions = Array.isArray(nextDocument.editions)
    ? nextDocument.editions.map((edition) => ({
        ...edition,
        royaltyApprovalRequired: edition.royaltyApprovalRequired ?? false,
        royaltyApprovedAt: edition.royaltyApprovedAt ?? null,
        royaltyApprovedBy: edition.royaltyApprovedBy ?? null,
      }))
    : fallback.document.editions;

  return {
    currentPageNumber: clampPageNumber(project, session.currentPageNumber ?? fallback.currentPageNumber),
    document: syncEditionState(recalculateDocumentGraph(nextDocument)),
  };
}

function createFallbackProposalFromLegacy(project: NovelProject, document: NovelProjectDocument, event: Extract<LegacyNovelistEvent, { type: 'revision_applied' | 'revision_rejected' }>) {
  const sceneId = getSceneFromPageId(project, event.pageId)?.page.id ?? event.pageId;
  const fallback: RevisionProposal = {
    actor: event.proposalActor,
    affectedEntityIds: [],
    confidence: 0.4,
    contextWindow: [],
    createdAt: event.createdAt,
    generatedText: event.type === 'revision_applied' ? event.proposalText : event.prompt,
    id: event.revisionId,
    instruction: event.prompt,
    isPlaceholder: event.type === 'revision_applied' ? event.isPlaceholder : true,
    mode: event.mode,
    pageNumber: event.pageNumber,
    passageId: 'passageId' in event ? event.passageId ?? null : null,
    rationale: 'Migrated from the Novelist v1 local event store.',
    sceneId,
    snapshotFingerprint:
      event.type === 'revision_applied'
        ? createSnapshotFingerprint(event.snapshotPassages)
        : createSnapshotFingerprint(getScenePassages(document, sceneId)),
    status: event.type === 'revision_applied' ? ('accepted' satisfies ProposalStatus) : ('rejected' satisfies ProposalStatus),
    targetText: event.type === 'revision_applied' ? event.target : event.prompt,
    warnings: ['Migrated from v1 local storage.'],
  };

  document.proposals.unshift(fallback);
  return fallback;
}

export function migrateLegacySession(project: NovelProject, legacySession: LegacyNovelistProjectSession | null | undefined): NovelistProjectSession {
  const baseSession = createDefaultSession(project);
  if (!legacySession) {
    return baseSession;
  }

  let document = cloneJson(baseSession.document);
  const events = [...legacySession.events].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  events.forEach((event) => {
    if (event.type === 'revision_queued') {
      document.proposals.unshift({
        actor: event.actor,
        affectedEntityIds: [],
        confidence: 0.4,
        contextWindow: [],
        createdAt: event.createdAt,
        generatedText: event.proposal.text,
        id: event.id,
        instruction: event.prompt,
        isPlaceholder: event.proposal.isPlaceholder,
        mode: event.mode,
        pageNumber: event.pageNumber,
        passageId: event.passageId,
        rationale: event.proposal.rationale,
        sceneId: getSceneFromPageId(project, event.pageId)?.page.id ?? event.pageId,
        snapshotFingerprint: createSnapshotFingerprint(event.snapshotPassages),
        status: 'queued',
        targetText: event.target,
        warnings: ['Migrated from v1 local storage.'],
      });
      return;
    }

    if (event.type === 'revision_applied') {
      const proposal =
        document.proposals.find((item) => item.id === event.revisionId) ??
        createFallbackProposalFromLegacy(project, document, event);

      proposal.status = 'accepted';
      replaceScenePassages(document, proposal.sceneId, event.resultPassages);
      document = attachDecision(document, proposal.id, {
        createdAt: event.createdAt,
        decision: 'accepted',
        id: event.id,
        nextText: event.proposalText,
        previousText: event.snapshotPassages.find((passage) => passage.id === (proposal.passageId ?? event.resultPassages[0]?.id))?.text ?? proposal.targetText,
        proposalId: proposal.id,
        reviewer: event.actor,
        reviewerNote: 'Migrated from v1 local storage.',
        wordDelta: event.wordDelta,
      });
      return;
    }

    if (event.type === 'revision_rejected') {
      const proposal =
        document.proposals.find((item) => item.id === event.revisionId) ??
        createFallbackProposalFromLegacy(project, document, event);

      proposal.status = 'rejected';
      document = attachDecision(document, proposal.id, {
        createdAt: event.createdAt,
        decision: 'rejected',
        id: event.id,
        nextText: null,
        previousText: proposal.targetText,
        proposalId: proposal.id,
        reviewer: event.actor,
        reviewerNote: 'Migrated from v1 local storage.',
        wordDelta: {
          additions: 0,
          removals: 0,
          replacements: 0,
        },
      });
      return;
    }

    if (event.type === 'conflict_dismissed') {
      if (!document.dismissedConflictIds.includes(event.conflictId)) {
        document.dismissedConflictIds.push(event.conflictId);
      }
      document.conflictDismissals.unshift({
        actor: event.actor,
        conflictId: event.conflictId,
        createdAt: event.createdAt,
        id: event.id,
        pageNumber: event.pageNumber,
        title: event.conflictTitle,
      });
      return;
    }

    if (event.type === 'analysis_requested') {
      document.analysisRuns.unshift({
        ...createSeedAnalysisRun(project),
        createdAt: event.createdAt,
        createdBy: event.actor,
        depth: 'pro',
        id: event.id,
        notes: [...createSeedAnalysisRun(project).notes, event.label],
      });
      return;
    }

    if (event.type === 'export_requested') {
      if (document.snapshots.length === 0) {
        document = createSnapshot(document, event.actor, {
          label: 'Migrated live draft snapshot',
          pageNumber: event.format === 'pdf' ? 1 : getFirstPageNumber(project),
          scope: 'project',
          scopeId: project.id,
        });
      }

      const snapshotId = document.snapshots[0]?.id;
      if (snapshotId) {
        document = addExportJob(document, event.actor, {
          format: event.format,
          label: event.label,
          snapshotId,
        });
      }
    }
  });

  document = syncEditionState(recalculateDocumentGraph(document));

  return {
    currentPageNumber: clampPageNumber(project, legacySession.pageNumber),
    document,
  };
}
