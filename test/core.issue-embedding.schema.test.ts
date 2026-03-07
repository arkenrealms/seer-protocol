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

describe('core issue embedding contracts', () => {
  const {
    IssueEmbedding,
    IssueEmbeddingUpsertInput,
    IssueEmbeddingBatchUpsertInput,
  } = loadTsModule('core/core.schema.ts');

  const baseRecord = {
    entityType: 'issue',
    issueRef: 'arkenrealms/evolution#13',
    modelId: 'text-embedding-3-small',
    modelVersion: '2026-01-01',
    vectorDimensions: 3,
    vectorHash: 'vec-hash-1',
    sourceTextHash: 'src-hash-1',
    vector: [0.11, 0.22, 0.33],
    embeddedAt: '2026-02-26T21:00:00.000Z',
    sourceUpdatedAt: '2026-02-26T20:59:00.000Z',
  };

  test('accepts valid issue embedding payload', () => {
    const parsed = IssueEmbedding.parse(baseRecord);
    expect(parsed.issueRef).toBe('arkenrealms/evolution#13');
    expect(parsed.entityType).toBe('issue');
    expect(parsed.vectorDimensions).toBe(3);
  });

  test('rejects vector length / dimensions mismatch', () => {
    expect(() =>
      IssueEmbedding.parse({
        ...baseRecord,
        vectorDimensions: 4,
      })
    ).toThrow(/vectorDimensions 4 does not match vector length 3/);
  });

  test('single upsert contract rejects expected model mismatch', () => {
    expect(() =>
      IssueEmbeddingUpsertInput.parse({
        record: baseRecord,
        expectedModelId: 'text-embedding-3-large',
      })
    ).toThrow(/modelId mismatch/);
  });

  test('batch upsert contract rejects mixed model/version/dimensions', () => {
    expect(() =>
      IssueEmbeddingBatchUpsertInput.parse({
        records: [
          baseRecord,
          {
            ...baseRecord,
            issueRef: 'arkenrealms/evolution#14',
            modelVersion: '2026-01-02',
            vectorDimensions: 2,
            vector: [0.1, 0.2],
          },
        ],
      })
    ).toThrow(/mismatch in batch/);
  });
});
