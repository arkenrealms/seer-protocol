// arken/packages/seer/packages/protocol/test/router-routing.test.ts
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

describe('isles/infinite router method routing behavior', () => {
  const { createRouter: createIslesRouter } = loadTsModule('isles/isles.router.ts');
  const { createRouter: createInfiniteRouter } = loadTsModule('infinite/infinite.router.ts');

  test('isles prefers own handler and falls back to evolution by method name', async () => {
    const calls = [];
    const isles = { interact: (input, ctx) => (calls.push(['isles.interact', input, ctx]), { from: 'isles' }) };
    const evolution = {
      getScene: (input, ctx) => (calls.push(['evolution.getScene', input, ctx]), { from: 'evolution' }),
      saveRound: jest.fn(() => ({ from: 'saveRound' })),
    };

    const ctx = { app: { service: { Isles: isles, Evolution: evolution } }, client: { roles: ['guest'] } };
    const caller = createIslesRouter().createCaller(ctx);

    await expect(caller.interact({ shardId: 's', roundId: 1, round: {}, rewardWinnerAmount: 1, lastClients: [] })).resolves.toEqual({ from: 'isles' });
    await expect(caller.getScene({ data: {}, signature: { hash: 'h', address: 'a' } })).resolves.toEqual({ from: 'evolution' });

    expect(calls.map((c) => c[0])).toEqual(['isles.interact', 'evolution.getScene']);
    expect(evolution.saveRound).not.toHaveBeenCalled();
  });

  test('infinite prefers own handler and falls back to evolution by method name', async () => {
    const calls = [];
    const infinite = { interact: (input, ctx) => (calls.push(['infinite.interact', input, ctx]), { from: 'infinite' }) };
    const evolution = {
      getScene: (input, ctx) => (calls.push(['evolution.getScene', input, ctx]), { from: 'evolution' }),
      saveRound: jest.fn(() => ({ from: 'saveRound' })),
    };

    const ctx = { app: { service: { Infinite: infinite, Evolution: evolution } }, client: { roles: ['guest'] } };
    const caller = createInfiniteRouter().createCaller(ctx);

    await expect(caller.interact({ shardId: 's', roundId: 1, round: {}, rewardWinnerAmount: 1, lastClients: [] })).resolves.toEqual({ from: 'infinite' });
    await expect(caller.getScene({ data: {}, signature: { hash: 'h', address: 'a' } })).resolves.toEqual({ from: 'evolution' });

    expect(calls.map((c) => c[0])).toEqual(['infinite.interact', 'evolution.getScene']);
    expect(evolution.saveRound).not.toHaveBeenCalled();
  });

  test('throws deterministic unavailable-handler error when neither service has method', async () => {
    const ctx = { app: { service: { Isles: {}, Evolution: {} } }, client: { roles: ['guest'] } };
    const caller = createIslesRouter().createCaller(ctx);

    await expect(caller.interact({ shardId: 's', roundId: 1, round: {}, rewardWinnerAmount: 1, lastClients: [] })).rejects.toThrow(
      /Isles\.interact handler is unavailable/
    );
  });
});
