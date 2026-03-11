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

describe('core memory ledger contracts', () => {
  const { MemoryLedger } = loadTsModule('core/core.schema.ts');

  test('requires retrieval request + result for retrieval records', () => {
    expect(() =>
      MemoryLedger.parse({
        recordType: 'retrieval',
      })
    ).toThrow(/retrievalRequest and retrievalResult are required/);
  });

  test('requires writeback event for writeback records', () => {
    expect(() =>
      MemoryLedger.parse({
        recordType: 'writeback',
      })
    ).toThrow(/writebackEvent is required/);
  });

  test('parses retrieval payload and applies defaults', () => {
    const parsed = MemoryLedger.parse({
      recordType: 'retrieval',
      requestId: 'req-1',
      retrievalRequest: {
        requestId: 'req-1',
        queryText: 'what changed?',
        startedAt: '2026-03-04T18:00:00.000Z',
      },
      retrievalResult: {
        requestId: 'req-1',
        completedAt: '2026-03-04T18:00:00.150Z',
        latencyMs: 150,
        selectedCount: 0,
      },
    });

    expect(parsed.tags).toEqual([]);
    expect(parsed.retrievalRequest?.sourcesAttempted).toEqual([]);
    expect(parsed.retrievalResult?.snippets).toEqual([]);
    expect(parsed.retrievalResult?.fallback).toEqual({ used: false });
  });
});
