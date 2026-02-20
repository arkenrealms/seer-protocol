// arken/packages/seer/packages/protocol/test/evolution.router.test.ts
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

describe('evolution router dispatch behavior', () => {
  const { createRouter } = loadTsModule('evolution/evolution.router.ts');

  test('keeps expected query/mutation procedure types', () => {
    const r = createRouter();
    const procedures = r._def.procedures;

    expect(procedures.info._def.type).toBe('query');
    expect(procedures.updateConfig._def.type).toBe('mutation');
    expect(procedures.monitorParties._def.type).toBe('query');
    expect(procedures.updateSettings._def.type).toBe('mutation');
  });

  test('dispatches to Evolution service methods with input and ctx', async () => {
    const calls = [];
    const service = {
      Evolution: {
        info: (input, ctx) => {
          calls.push(['info', input, ctx]);
          return { ok: 'info' };
        },
        updateConfig: (input, ctx) => {
          calls.push(['updateConfig', input, ctx]);
          return { ok: 'updateConfig' };
        },
        monitorParties: (input, ctx) => {
          calls.push(['monitorParties', input, ctx]);
          return { ok: 'monitorParties' };
        },
        updateSettings: (input, ctx) => {
          calls.push(['updateSettings', input, ctx]);
          return { ok: 'updateSettings' };
        },
      },
    };

    const ctx = { app: { service }, client: { roles: ['admin', 'user', 'guest'] } };
    const caller = createRouter().createCaller(ctx);

    await expect(caller.info({})).resolves.toEqual({ ok: 'info' });
    await expect(caller.updateConfig({})).resolves.toEqual({ ok: 'updateConfig' });
    await expect(caller.monitorParties(undefined)).resolves.toEqual({ ok: 'monitorParties' });
    await expect(caller.updateSettings({ zoom: 0.5 })).resolves.toEqual({ ok: 'updateSettings' });

    expect(calls.map((c) => c[0])).toEqual(['info', 'updateConfig', 'monitorParties', 'updateSettings']);
    for (const [, , callCtx] of calls) expect(callCtx).toBe(ctx);
  });
});
