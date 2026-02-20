// arken/seer/protocol/test/schema.root-query-input.test.ts
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadRootSchemaRuntime() {
  const root = process.cwd();
  const schemaPath = path.resolve(root, 'schema.ts');
  const source = fs.readFileSync(schemaPath, 'utf8');

  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: schemaPath,
  });

  const m = new Module.Module(schemaPath, module);
  m.filename = schemaPath;
  m.paths = Module.Module._nodeModulePaths(path.dirname(schemaPath));
  m._compile(outputText, schemaPath);

  return m.exports;
}

describe('root schema query envelope parity', () => {
  const { z, Query, getQueryInput } = loadRootSchemaRuntime();

  test('schema.ts Query accepts strict pagination fields including legacy limit alias', () => {
    const parsed = Query.parse({ skip: 0, take: 10, limit: 10 });

    expect(parsed.skip).toBe(0);
    expect(parsed.take).toBe(10);
    expect(parsed.limit).toBe(10);
  });

  test('schema.ts Query rejects invalid pagination values', () => {
    expect(() => Query.parse({ skip: -1 })).toThrow();
    expect(() => Query.parse({ take: 2.5 })).toThrow();
    expect(() => Query.parse({ limit: '10' })).toThrow();
  });


  test('schema.ts Query and getQueryInput reject blank/whitespace orderBy keys', () => {
    expect(() => Query.parse({ orderBy: { '': 'asc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => Query.parse({ orderBy: { '   ': 'desc' } })).toThrow(/orderBy keys must be non-empty/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ orderBy: { '': 'asc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => schema.parse({ orderBy: { '   ': 'desc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(schema.parse({ orderBy: { name: 'desc' } }).orderBy.name).toBe('desc');
  });

  test('schema.ts getQueryInput enforces mode enum and legacy limit alias', () => {
    const schema = getQueryInput(z.object({ name: z.string() }));

    const valid = schema.parse({
      where: { name: { contains: 'abc', mode: 'insensitive' } },
      limit: 10,
    });

    expect(valid.where.name.mode).toBe('insensitive');
    expect(valid.limit).toBe(10);

    expect(() =>
      schema.parse({
        where: { name: { contains: 'abc', mode: 'invalid' } },
      })
    ).toThrow();
  });
});
