export type PlotNodeData = {
  accent: string;
  detail: string;
  kind: string;
  references: string[];
  title: string;
};

export type NovelCanvasNode<TData = PlotNodeData> = {
  data: TData;
  id: string;
  position: {
    x: number;
    y: number;
  };
  type?: string;
};

export type NovelCanvasEdge = {
  animated?: boolean;
  id: string;
  label?: string;
  source: string;
  target: string;
};

export type NovelPassage = {
  id: string;
  text: string;
};

export type NovelPage = {
  absolutePage: number;
  id: string;
  label: string;
  passages: NovelPassage[];
  summary: string;
};

export type NovelChapter = {
  beat: string;
  id: string;
  pages: NovelPage[];
  title: string;
};

export type NovelConflict = {
  chapter: string;
  detail: string;
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
};

export type NovelContributor = {
  accent: string;
  additions: number;
  id: string;
  initials: string;
  name: string;
  removals: number;
  replacements: number;
  role: string;
  share: number;
};

export type NovelHistoryEntry = {
  authorId: string;
  changeType: 'Addition' | 'Consistency' | 'Removal' | 'Replacement';
  changedAt: string;
  id: string;
  pageNumber: number;
  scope: string;
  snapshotPassages?: NovelPassage[];
  summary: string;
  version: string;
};

export type NovelMetrics = {
  genre: string;
  genreConfidence: number;
  lastAnalyzed: string;
  notes: string[];
  pacing: number;
  plagiarismScore: number;
  readingGrade: number;
  vocabularyDepth: number;
};

export type NovelMonetization = {
  distributionNote: string;
  exportFormats: string[];
  priceUsd: number;
  salesModel: string;
};

export type NovelCanonKind =
  | 'artifact'
  | 'character'
  | 'dynasty'
  | 'faction'
  | 'motif'
  | 'npc'
  | 'plotline'
  | 'quest'
  | 'zone';

export type NovelCanonEntry = {
  canonId: string;
  detail: string;
  kind: NovelCanonKind;
  label: string;
};

export type NovelProject = {
  canonEntries: NovelCanonEntry[];
  canonSources: string[];
  canvas: {
    edges: NovelCanvasEdge[];
    nodes: NovelCanvasNode<PlotNodeData>[];
  };
  chapters: NovelChapter[];
  conflicts: NovelConflict[];
  contributors: NovelContributor[];
  currentReviewerId: string;
  description: string;
  history: NovelHistoryEntry[];
  id: string;
  metrics: NovelMetrics;
  monetization: NovelMonetization;
  subtitle: string;
  tags: string[];
  title: string;
};
