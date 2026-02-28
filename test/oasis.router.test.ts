// arken/packages/seer/packages/protocol/test/oasis.router.test.ts
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

describe('oasis router dispatch behavior', () => {
  const { createRouter } = loadTsModule('oasis/oasis.router.ts');

  test('getPatrons routes to Oasis service and keeps query semantics', async () => {
    const calls = [];
    const ctx = {
      app: { service: { Oasis: { getPatrons: (input, innerCtx) => (calls.push([input, innerCtx]), []) } } },
      client: { roles: ['guest'] },
    };

    const r = createRouter();
    expect(r._def.procedures.getPatrons._def.type).toBe('query');

    const caller = r.createCaller(ctx);
    await expect(caller.getPatrons(undefined)).resolves.toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toBe(ctx);
  });

  test('getScene safely handles non-object data and object data with applicationId', async () => {
    const caller = createRouter().createCaller({ app: { service: { Oasis: {} } }, client: { roles: ['guest'] } });

    await expect(caller.getScene({ data: null, signature: { hash: 'h', address: 'a' } })).resolves.toEqual({});

    const scene = await caller.getScene({
      data: { applicationId: '668e4e805f9a03927caf883b' },
      signature: { hash: 'h', address: 'a' },
    });

    expect(Array.isArray(scene.objects)).toBe(true);
    expect(scene.objects.length).toBeGreaterThan(0);
  });
});
