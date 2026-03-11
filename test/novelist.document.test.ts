const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadTsModule(relativePath) {
  const root = process.cwd();
  const filePath = path.resolve(root, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');

  let { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filePath,
  });

  outputText = outputText.replace(/require\(["'](\.\.?\/[^"']+)["']\)/g, (full, spec) => {
    const tsPath = path.resolve(path.dirname(filePath), `${spec}.ts`);
    return fs.existsSync(tsPath) ? `require("${spec}.ts")` : full;
  });

  const prior = Module._extensions['.ts'];
  Module._extensions['.ts'] = (mod, filename) => {
    const src = fs.readFileSync(filename, 'utf8');
    let { outputText: js } = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    });
    js = js.replace(/require\(["'](\.\.?\/[^"']+)["']\)/g, (full, spec) => {
      const tsPath = path.resolve(path.dirname(filename), `${spec}.ts`);
      return fs.existsSync(tsPath) ? `require("${spec}.ts")` : full;
    });
    mod._compile(js, filename);
  };

  try {
    const loaded = new Module.Module(filePath, module);
    loaded.filename = filePath;
    loaded.paths = Module.Module._nodeModulePaths(path.dirname(filePath));
    loaded._compile(outputText, filePath);
    return loaded.exports;
  } finally {
    Module._extensions['.ts'] = prior;
  }
}

describe('novelist shared document engine', () => {
  const documentRuntime = loadTsModule('novelist/novelist.document.ts');

  const project = {
    canonEntries: [],
    canonSources: ['Seer canon registry'],
    canvas: {
      edges: [],
      nodes: [
        {
          data: {
            accent: '#7cc7ff',
            detail: 'Primary point-of-view salvage linguist.',
            kind: 'character',
            references: ['Page 1'],
            title: 'Mira Vale',
          },
          id: 'mira-vale',
          position: { x: 160, y: 80 },
          type: 'plot',
        },
      ],
    },
    chapters: [
      {
        beat: 'The relay answers back.',
        id: 'signalfall',
        pages: [
          {
            absolutePage: 1,
            id: 'signalfall-p1',
            label: 'Page 1',
            passages: [
              {
                id: 'signalfall-p1-a',
                text: 'Mira expected dust and silence. Instead the relay chamber breathed like a patient engine.',
              },
            ],
            summary: 'Mira enters the relay vault.',
          },
        ],
        title: 'Signalfall',
      },
    ],
    conflicts: [
      {
        chapter: 'Signalfall',
        detail: 'The relay warning still lacks a named source.',
        id: 'seed-conflict-1',
        severity: 'warning',
        title: 'Source of the relay warning is unresolved',
      },
    ],
    contributors: [
      {
        accent: '#7cc7ff',
        additions: 1200,
        id: 'profile-mira',
        initials: 'MS',
        name: 'Mira Sol',
        removals: 180,
        replacements: 42,
        role: 'Lead Writer',
        share: 60,
      },
      {
        accent: '#f0c36f',
        additions: 540,
        id: 'profile-kael',
        initials: 'KR',
        name: 'Kael Rho',
        removals: 90,
        replacements: 18,
        role: 'Reviewer',
        share: 40,
      },
    ],
    currentReviewerId: 'profile-kael',
    description: 'Shared novelist project fixture.',
    history: [],
    id: 'fixture-project',
    metrics: {
      genre: 'Science fantasy',
      genreConfidence: 82,
      lastAnalyzed: '2026-03-10T00:00:00.000Z',
      notes: ['Seeded for protocol tests.'],
      pacing: 74,
      plagiarismScore: 6,
      readingGrade: 8.4,
      vocabularyDepth: 68,
    },
    monetization: {
      distributionNote: 'Shared between contributors.',
      exportFormats: ['pdf', 'epub'],
      priceUsd: 14,
      salesModel: 'collaborative',
    },
    subtitle: 'Protocol fixture',
    tags: ['fixture'],
    title: 'Fixture Novel',
  };

  test('creates a shared document and derives canvas plus review state', () => {
    const document = documentRuntime.createDocumentFromProject(project);
    const reviewItems = documentRuntime.deriveReviewItems(project, document);
    const graphCanvas = documentRuntime.deriveGraphCanvas(document);

    expect(document.projectId).toBe('fixture-project');
    expect(reviewItems.some((item) => item.kind === 'conflict')).toBe(true);
    expect(reviewItems.some((item) => item.kind === 'edition')).toBe(true);
    expect(graphCanvas.nodes.some((node) => node.id === 'mira-vale')).toBe(true);
  });

  test('shared proposal decisions update history through the shared engine', () => {
    let document = documentRuntime.createDocumentFromProject(project);
    const actor = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-mira',
      name: 'Mira Sol',
      roles: [],
    });

    document = documentRuntime.queueProposal(document, {
      actor,
      affectedEntityIds: [],
      confidence: 0.58,
      contextWindow: [],
      createdAt: '2026-03-10T10:07:00.000Z',
      generatedText: 'Mira expected silence. Instead the relay breathed like a witness preparing testimony.',
      id: 'proposal-fixture-1',
      instruction: 'Make the relay feel judicial.',
      isPlaceholder: true,
      mode: 'replace',
      pageNumber: 1,
      passageId: 'signalfall-p1-a',
      rationale: 'Sharpen the institutional tension.',
      sceneId: 'signalfall-p1',
      snapshotFingerprint: documentRuntime.serializePassages(project.chapters[0].pages[0].passages),
      status: 'queued',
      targetText: project.chapters[0].pages[0].passages[0].text,
      warnings: ['placeholder'],
    });
    document = documentRuntime.acceptProposal(document, 'proposal-fixture-1', actor, 'Keep Mira terse.');

    const history = documentRuntime.deriveHistoryEntries(project, document);

    expect(history.some((entry) => entry.kind === 'decision' && entry.reviewerNote === 'Keep Mira terse.')).toBe(true);
    expect(history.some((entry) => entry.candidateText?.includes('witness preparing testimony'))).toBe(true);
  });

  test('placeholder analysis derives from the accepted draft instead of caller-supplied passages', () => {
    let document = documentRuntime.createDocumentFromProject(project);
    const actor = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-mira',
      name: 'Mira Sol',
      roles: [],
    });

    document = documentRuntime.queueProposal(document, {
      actor,
      affectedEntityIds: [],
      confidence: 0.61,
      contextWindow: [],
      createdAt: '2026-03-10T10:11:00.000Z',
      generatedText: 'Lys reached the route before the relay answered. The child heir waited in silence.',
      id: 'proposal-fixture-analysis-1',
      instruction: 'Seed the draft with continuity pressure.',
      isPlaceholder: true,
      mode: 'replace',
      pageNumber: 1,
      passageId: 'signalfall-p1-a',
      rationale: 'Exercise the shared placeholder analysis heuristics.',
      sceneId: 'signalfall-p1',
      snapshotFingerprint: documentRuntime.serializePassages(project.chapters[0].pages[0].passages),
      status: 'queued',
      targetText: project.chapters[0].pages[0].passages[0].text,
      warnings: ['placeholder'],
    });
    document = documentRuntime.acceptProposal(document, 'proposal-fixture-analysis-1', actor);

    const run = documentRuntime.createPlaceholderAnalysisRun(project, {
      currentPageNumber: 1,
      document,
    }, actor, 'standard');

    expect(run.createdBy.id).toBe('profile-mira');
    expect(run.conflicts.map((conflict) => conflict.id)).toEqual(
      expect.arrayContaining(['seed-conflict-1', 'heuristic-heir-sense', 'heuristic-lys-route'])
    );
  });

  test('canon conflict votes replace prior votes per actor and surface tallies', () => {
    let document = documentRuntime.createDocumentFromProject(project);
    const owner = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-mira',
      name: 'Mira Sol',
      roles: [],
    });
    const reviewer = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-kael',
      name: 'Kael Rho',
      roles: [],
    });

    document = documentRuntime.addGraphNode(
      document,
      {
        accent: '#7cc7ff',
        canonId: 'canon-mira-vale-zone',
        detail: 'Registry mislabels Mira Vale as a zone for fixture voting.',
        id: 'canon-mira-vale-zone',
        kind: 'zone',
        label: 'Mira Vale',
        references: [],
        sceneIds: [],
        source: 'canon',
      },
      owner,
      1
    );

    document = documentRuntime.voteCanonConflict(document, 'canon-conflict-mira-vale', 'merge', owner, 1);
    document = documentRuntime.voteCanonConflict(document, 'canon-conflict-mira-vale', 'dismiss', owner, 1);
    document = documentRuntime.voteCanonConflict(document, 'canon-conflict-mira-vale', 'relink', reviewer, 1);

    const [conflict] = documentRuntime.deriveVisibleConflicts(project, document);

    expect(conflict.voteSummary.total).toBe(2);
    expect(conflict.voteSummary.counts.merge).toBe(0);
    expect(conflict.voteSummary.counts.dismiss).toBe(1);
    expect(conflict.voteSummary.counts.relink).toBe(1);
    expect(conflict.voteSummary.weightedCounts.dismiss).toBe(3);
    expect(conflict.voteSummary.weightedCounts.relink).toBe(2);
    expect(conflict.voteSummary.requiredVoteCount).toBe(2);
    expect(conflict.voteSummary.requiredWeight).toBe(3);
    expect(conflict.voteSummary.leadingVote).toBe('dismiss');
    expect(conflict.voteSummary.resolutionVote).toBeNull();
    expect(conflict.votes.map((vote) => `${vote.actor.id}:${vote.vote}`)).toEqual(
      expect.arrayContaining(['profile-mira:dismiss', 'profile-kael:relink'])
    );
    expect(document.activity[0]?.kind).toBe('canon_conflict_voted');
    expect(document.activity[0]?.vote).toBe('relink');
  });

  test('canon conflict weighted majority auto-merges after two supporting votes', () => {
    let document = documentRuntime.createDocumentFromProject(project);
    const owner = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-mira',
      name: 'Mira Sol',
      roles: [],
    });
    const reviewer = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-kael',
      name: 'Kael Rho',
      roles: [],
    });

    document = documentRuntime.addGraphNode(
      document,
      {
        accent: '#7cc7ff',
        canonId: 'canon-mira-vale-zone',
        detail: 'Registry mislabels Mira Vale as a zone for fixture voting.',
        id: 'canon-mira-vale-zone',
        kind: 'zone',
        label: 'Mira Vale',
        references: [],
        sceneIds: [],
        source: 'canon',
      },
      owner,
      1
    );

    document = documentRuntime.voteCanonConflict(document, 'canon-conflict-mira-vale', 'merge', owner, 1);
    document = documentRuntime.voteCanonConflict(document, 'canon-conflict-mira-vale', 'merge', reviewer, 1);

    expect(documentRuntime.deriveVisibleConflicts(project, document).some((conflict) => conflict.id === 'canon-conflict-mira-vale')).toBe(false);
    expect(document.activity[0]?.kind).toBe('canon_conflict_resolved');
    expect(document.activity[0]?.resolution).toBe('merge');
    expect(document.activity[0]?.resolutionSource).toBe('vote_threshold');
    expect(document.activity[0]?.label).toContain('Auto-merged');
  });

  test('canon conflict dismiss votes auto-dismiss after two supporting votes', () => {
    let document = documentRuntime.createDocumentFromProject(project);
    const owner = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-mira',
      name: 'Mira Sol',
      roles: [],
    });
    const reviewer = documentRuntime.buildActingContributor(project, document, {
      id: 'profile-kael',
      name: 'Kael Rho',
      roles: [],
    });

    document = documentRuntime.addGraphNode(
      document,
      {
        accent: '#7cc7ff',
        canonId: 'canon-mira-vale-zone',
        detail: 'Registry mislabels Mira Vale as a zone for fixture voting.',
        id: 'canon-mira-vale-zone',
        kind: 'zone',
        label: 'Mira Vale',
        references: [],
        sceneIds: [],
        source: 'canon',
      },
      owner,
      1
    );

    document = documentRuntime.voteCanonConflict(document, 'canon-conflict-mira-vale', 'dismiss', owner, 1);
    document = documentRuntime.voteCanonConflict(document, 'canon-conflict-mira-vale', 'dismiss', reviewer, 1);

    expect(documentRuntime.deriveVisibleConflicts(project, document).some((conflict) => conflict.id === 'canon-conflict-mira-vale')).toBe(false);
    expect(document.dismissedConflictIds).toContain('canon-conflict-mira-vale');
    expect(document.conflictDismissals[0]?.resolutionSource).toBe('vote_threshold');
    expect(document.conflictDismissals[0]?.vote).toBe('dismiss');
  });
});
