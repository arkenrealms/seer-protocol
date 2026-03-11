const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadTsModule(relativePath) {
  const root = process.cwd();
  const filePath = path.resolve(root, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');

  let { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: filePath,
  });

  outputText = outputText.replace(/require\(["'](\.\.?\/[^"']+)["']\)/g, (full, spec) => {
    const tsPath = path.resolve(path.dirname(filePath), `${spec}.ts`);
    if (fs.existsSync(tsPath)) return `require("${spec}.ts")`;
    return full;
  });

  const prior = Module._extensions['.ts'];
  Module._extensions['.ts'] = (mod, filename) => {
    const src = fs.readFileSync(filename, 'utf8');
    let { outputText: js } = ts.transpileModule(src, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    });
    js = js.replace(/require\(["'](\.\.?\/[^"']+)["']\)/g, (f, s) => {
      const maybe = path.resolve(path.dirname(filename), `${s}.ts`);
      return fs.existsSync(maybe) ? `require("${s}.ts")` : f;
    });
    mod._compile(js, filename);
  };

  try {
    const m = new Module.Module(filePath, module);
    m.filename = filePath;
    m.paths = Module.Module._nodeModulePaths(path.dirname(filePath));
    m._compile(outputText, filePath);
    return m.exports;
  } finally {
    Module._extensions['.ts'] = prior;
  }
}

describe('evolution round commit schema', () => {
  const {
    buildRoundCommitEnvelope,
    buildRoundCommitExpectedMessage,
    buildRoundStateCommitment,
    buildSignedRoundCommitEnvelope,
    extractRoundCommitStateHints,
    roundCommitEnvelopeSchema,
    saveRoundInputSchema,
    summarizeRoundCommitTransitionEntityIds,
    stableSerialize,
  } = loadTsModule(
    'evolution/round-commit.ts'
  );

  test('accepts a valid round commit envelope nested inside saveRound input', () => {
    const parsed = saveRoundInputSchema.parse({
      shardId: 'shard-a',
      gameKey: 'evolution',
      round: { id: 'round-1', clients: [], events: [] },
      clients: [],
      commit: {
        version: 1,
        gameKey: 'evolution',
        branchId: 'shard-a',
        roundId: 'round-1',
        baseStateRoot: 'root:before',
        roundHash: 'hash:round',
        patchSetHash: 'hash:patch',
        eventsHash: 'hash:events',
        signature: {
          address: '0xabc',
          hash: '0xsig',
          data: 'signed-message',
        },
      },
    });

    expect(parsed.commit.branchId).toBe('shard-a');
    expect(roundCommitEnvelopeSchema.parse(parsed.commit).roundId).toBe('round-1');
  });

  test('rejects malformed commit signatures', () => {
    expect(() =>
      roundCommitEnvelopeSchema.parse({
        version: 1,
        gameKey: 'evolution',
        branchId: 'shard-a',
        roundId: 'round-1',
        baseStateRoot: 'root:before',
        roundHash: 'hash:round',
        patchSetHash: 'hash:patch',
        eventsHash: 'hash:events',
        signature: {
          address: '0xabc',
          hash: '',
          data: 'signed-message',
        },
      })
    ).toThrow();
  });

  test('stableSerialize is deterministic across object key order', () => {
    const left = stableSerialize({
      b: 2,
      a: { y: 2, x: 1 },
    });
    const right = stableSerialize({
      a: { x: 1, y: 2 },
      b: 2,
    });

    expect(left).toBe(right);
  });

  test('buildRoundCommitEnvelope derives canonical hashes and touched entity ids from a round payload', () => {
    const round = {
      id: 'round-9',
      events: [{ type: 'spawn', entityId: 'mob-1' }],
      clients: [
        {
          id: 'client-1',
          address: '0xabc',
          ops: [
            { entityType: 'character', entityId: 'character-1', ops: [{ op: 'set', key: 'hp', value: 5 }] },
            { entityType: 'profile.meta', entityId: 'profile-1', ops: [{ op: 'inc', key: 'xp', value: 3 }] },
          ],
        },
      ],
    };

    const envelope = buildRoundCommitEnvelope({
      gameKey: 'evolution',
      shardId: 'shard-a',
      round,
    });

    expect(envelope.roundId).toBe('round-9');
    expect(envelope.baseStateRoot).toMatch(/^synthetic:round:/);
    expect(envelope.roundHash).toBeTruthy();
    expect(envelope.patchSetHash).toBeTruthy();
    expect(envelope.eventsHash).toBeTruthy();
    expect(envelope.touchedEntityIds).toEqual(['character:character-1', 'profile.meta:profile-1']);
  });

  test('buildSignedRoundCommitEnvelope signs the canonical shared message', async () => {
    const round = {
      id: 'round-11',
      clients: [],
      events: [],
    };

    const commit = await buildSignedRoundCommitEnvelope(
      {
        gameKey: 'evolution',
        shardId: 'shard-b',
        round,
      },
      async (message) => ({
        address: '0xsigner',
        hash: `sig:${message}`,
        data: message,
      })
    );

    expect(commit.signature.data).toBe(buildRoundCommitExpectedMessage(commit));
    expect(commit.signature.hash).toBe(`sig:${commit.signature.data}`);
    expect(roundCommitEnvelopeSchema.parse(commit).branchId).toBe('shard-b');
  });

  test('extractRoundCommitStateHints lifts real roots and proofs from round.states', () => {
    const hints = extractRoundCommitStateHints({
      id: 'round-12',
      clients: [],
      events: [],
      states: [
        {
          kind: 'zk.updateLeaf',
          entityType: 'character',
          entityId: 'char-1',
          transitionKind: 'insert',
          transitionSource: 'emptyLeaf',
          oldRoot: 'root-before',
          newRoot: 'root-after',
          proof: { ok: true },
          publicSignals: ['root-before', 'root-after'],
        },
        {
          type: 'stateCommitment',
          baseStateRoot: 'root-before',
          postStateRoot: 'root-after',
          touchedEntityIds: ['character:char-1'],
        },
      ],
    });

    expect(hints.baseStateRoot).toBe('root-before');
    expect(hints.postStateRoot).toBe('root-after');
    expect(hints.touchedEntityIds).toEqual(['character:char-1']);
    expect(hints.proofs).toHaveLength(1);
    expect(hints.proofs[0]).toMatchObject({
      kind: 'zk.updateLeaf',
      entityType: 'character',
      entityId: 'char-1',
      transitionKind: 'insert',
      transitionSource: 'emptyLeaf',
      oldRoot: 'root-before',
      newRoot: 'root-after',
    });
    expect(hints.insertedEntityIds).toEqual(['character:char-1']);
  });

  test('buildRoundStateCommitment synthesizes a canonical top-level commitment from round hints and touched ops', () => {
    const stateCommitment = buildRoundStateCommitment({
      round: {
        id: 'round-13',
        events: [],
        states: [
          {
            kind: 'zk.updateLeaf',
            entityType: 'character',
            entityId: 'char-7',
            transitionKind: 'insert',
            transitionSource: 'emptyLeaf',
            oldRoot: 'root-before',
            newRoot: 'root-after',
            proof: { ok: true },
            publicSignals: ['signal-1'],
          },
        ],
        clients: [
          {
            ops: [{ entityType: 'profile.meta', entityId: 'profile-2', ops: [{ op: 'inc', key: 'xp', value: 1 }] }],
          },
        ],
      },
    });

    expect(stateCommitment).toEqual({
      baseStateRoot: 'root-before',
      postStateRoot: 'root-after',
      insertedEntityIds: ['character:char-7'],
      touchedEntityIds: ['character:char-7', 'profile.meta:profile-2'],
      proofs: [
        {
          kind: 'zk.updateLeaf',
          entityType: 'character',
          entityId: 'char-7',
          transitionKind: 'insert',
          transitionSource: 'emptyLeaf',
          oldRoot: 'root-before',
          newRoot: 'root-after',
          proof: { ok: true },
          publicSignals: ['signal-1'],
        },
      ],
    });
  });

  test('buildRoundStateCommitment preserves reusable branch witnesses from top-level state hints', () => {
    const stateCommitment = buildRoundStateCommitment({
      round: {
        id: 'round-13-witness',
        events: [],
        states: [],
        stateCommitment: {
          baseStateRoot: 'root-before',
          postStateRoot: 'root-before',
          snapshotEntityIds: ['character:char-7'],
          leafHashes: {
            'character:char-7': 'leaf-7',
          },
          branchWitnesses: [
            {
              entityType: 'character',
              entityId: 'char-7',
              oldLeaf: 'leaf-7',
              siblings: Array.from({ length: 16 }, (_, index) => `sib-${index}`),
            },
          ],
          importedEntityIds: ['character:char-7'],
        },
        clients: [],
      },
    });

    expect(stateCommitment).toEqual({
      baseStateRoot: 'root-before',
      postStateRoot: 'root-before',
      importedEntityIds: ['character:char-7'],
      snapshotEntityIds: ['character:char-7'],
      leafHashes: {
        'character:char-7': 'leaf-7',
      },
      branchWitnesses: [
        {
          entityType: 'character',
          entityId: 'char-7',
          oldLeaf: 'leaf-7',
          siblings: Array.from({ length: 16 }, (_, index) => `sib-${index}`),
        },
      ],
    });
  });

  test('buildRoundStateCommitment summarizes update and delete transitions from proof-bearing states', () => {
    const stateCommitment = buildRoundStateCommitment({
      round: {
        id: 'round-13b',
        events: [],
        states: [
          {
            kind: 'zk.updateLeaf',
            entityType: 'character',
            entityId: 'char-8',
            transitionKind: 'update',
            transitionSource: 'branchWitness',
            oldRoot: 'root-before',
            newRoot: 'root-mid',
            proof: { ok: true, seq: 1 },
            publicSignals: ['root-before', 'root-mid'],
          },
          {
            kind: 'zk.updateLeaf',
            entityType: 'profile',
            entityId: 'profile-9',
            transitionKind: 'delete',
            oldRoot: 'root-mid',
            newRoot: 'root-after',
            proof: { ok: true, seq: 2 },
            publicSignals: ['root-mid', 'root-after'],
          },
        ],
        clients: [],
      },
    });

    expect(stateCommitment).toEqual({
      baseStateRoot: 'root-before',
      postStateRoot: 'root-after',
      importedEntityIds: ['character:char-8'],
      updatedEntityIds: ['character:char-8'],
      deletedEntityIds: ['profile:profile-9'],
      snapshotEntityIds: ['character:char-8', 'profile:profile-9'],
      touchedEntityIds: ['character:char-8', 'profile:profile-9'],
      proofs: [
        {
          kind: 'zk.updateLeaf',
          entityType: 'character',
          entityId: 'char-8',
          transitionKind: 'update',
          transitionSource: 'branchWitness',
          oldRoot: 'root-before',
          newRoot: 'root-mid',
          proof: { ok: true, seq: 1 },
          publicSignals: ['root-before', 'root-mid'],
        },
        {
          kind: 'zk.updateLeaf',
          entityType: 'profile',
          entityId: 'profile-9',
          transitionKind: 'delete',
          oldRoot: 'root-mid',
          newRoot: 'root-after',
          proof: { ok: true, seq: 2 },
          publicSignals: ['root-mid', 'root-after'],
        },
      ],
    });
  });

  test('summarizeRoundCommitTransitionEntityIds merges explicit summaries with proof-derived transitions', () => {
    const summary = summarizeRoundCommitTransitionEntityIds({
      insertedEntityIds: ['character:char-1'],
      importedEntityIds: ['character:char-4'],
      proofs: [
        {
          kind: 'zk.updateLeaf',
          entityType: 'character',
          entityId: 'char-2',
          transitionKind: 'update',
          transitionSource: 'branchWitness',
        },
        {
          kind: 'zk.updateLeaf',
          entityType: 'profile',
          entityId: 'profile-3',
          transitionKind: 'delete',
        },
      ],
    });

    expect(summary).toEqual({
      insertedCount: 1,
      importedCount: 2,
      updatedCount: 1,
      deletedCount: 1,
      insertedEntityIds: ['character:char-1'],
      importedEntityIds: ['character:char-2', 'character:char-4'],
      updatedEntityIds: ['character:char-2'],
      deletedEntityIds: ['profile:profile-3'],
    });
  });

  test('buildRoundStateCommitment preserves chained proof order and uses the last proof as postStateRoot', () => {
    const stateCommitment = buildRoundStateCommitment({
      round: {
        id: 'round-14',
        events: [],
        states: [
          {
            kind: 'zk.updateLeaf',
            entityType: 'character',
            entityId: 'char-a',
            transitionKind: 'insert',
            transitionSource: 'emptyLeaf',
            oldRoot: 'root-before',
            newRoot: 'root-mid',
            proof: { ok: true, seq: 1 },
            publicSignals: ['root-before', 'root-mid'],
          },
          {
            kind: 'zk.updateLeaf',
            entityType: 'character',
            entityId: 'char-b',
            transitionKind: 'insert',
            transitionSource: 'emptyLeaf',
            oldRoot: 'root-mid',
            newRoot: 'root-final',
            proof: { ok: true, seq: 2 },
            publicSignals: ['root-mid', 'root-final'],
          },
        ],
        clients: [],
      },
    });

    expect(stateCommitment).toEqual({
      baseStateRoot: 'root-before',
      postStateRoot: 'root-final',
      insertedEntityIds: ['character:char-a', 'character:char-b'],
      snapshotEntityIds: ['character:char-a', 'character:char-b'],
      touchedEntityIds: ['character:char-a', 'character:char-b'],
      proofs: [
        {
          kind: 'zk.updateLeaf',
          entityType: 'character',
          entityId: 'char-a',
          transitionKind: 'insert',
          transitionSource: 'emptyLeaf',
          oldRoot: 'root-before',
          newRoot: 'root-mid',
          proof: { ok: true, seq: 1 },
          publicSignals: ['root-before', 'root-mid'],
        },
        {
          kind: 'zk.updateLeaf',
          entityType: 'character',
          entityId: 'char-b',
          transitionKind: 'insert',
          transitionSource: 'emptyLeaf',
          oldRoot: 'root-mid',
          newRoot: 'root-final',
          proof: { ok: true, seq: 2 },
          publicSignals: ['root-mid', 'root-final'],
        },
      ],
    });
  });
});
