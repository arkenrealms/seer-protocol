// arken/seer/protocol/test/rpc.hasRole.test.ts
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadRpcRuntime() {
  const root = process.cwd();
  const rpcPath = path.resolve(root, 'util', 'rpc.ts');
  const source = fs.readFileSync(rpcPath, 'utf8');

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: rpcPath,
  });

  const m = new Module.Module(rpcPath, module);
  m.filename = rpcPath;
  m.paths = Module.Module._nodeModulePaths(path.dirname(rpcPath));
  m._compile(outputText, rpcPath);

  return m.exports;
}

describe('hasRole middleware', () => {
  const { hasRole, ARXError } = loadRpcRuntime();
  const t = { middleware: (fn) => fn };

  test('allows clients with required role and stays side-effect free for console.log', async () => {
    const middleware = hasRole('guest', t);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const result = await middleware({
      input: undefined,
      ctx: { client: { roles: ['guest'] } },
      next: async () => ({ status: 1 }),
    });

    expect(result).toEqual({ status: 1 });
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('throws FORBIDDEN when none of the required roles exist', async () => {
    const middleware = hasRole(['admin', 'moderator'], t);

    await expect(
      middleware({
        input: undefined,
        ctx: { client: { roles: ['guest'] } },
        next: async () => ({ status: 1 }),
      })
    ).rejects.toMatchObject({
      name: 'ARXError',
      code: 'FORBIDDEN',
    });

    await expect(
      middleware({
        input: undefined,
        ctx: { client: { roles: ['guest'] } },
        next: async () => ({ status: 1 }),
      })
    ).rejects.toBeInstanceOf(ARXError);
  });
});
