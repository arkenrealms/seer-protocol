// arken/packages/seer/packages/protocol/test/schema.query-input.test.ts
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadSchemaRuntime() {
  const root = process.cwd();
  const schemaPath = path.resolve(root, 'util', 'schema.ts');
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

describe('util/schema query envelope behavior', () => {
  const { z, Query, getQueryInput } = loadSchemaRuntime();

  test('Query accepts strict pagination fields including legacy limit alias', () => {
    const parsed = Query.parse({ skip: 0, take: 10, limit: 10 });

    expect(parsed.skip).toBe(0);
    expect(parsed.take).toBe(10);
    expect(parsed.limit).toBe(10);
  });

  test('Query rejects invalid pagination values', () => {
    expect(() => Query.parse({ skip: -1 })).toThrow();
    expect(() => Query.parse({ take: 1.5 })).toThrow();
    expect(() => Query.parse({ limit: '10' })).toThrow();
  });

  test('getQueryInput supports object where mode enum and legacy limit alias', () => {
    const schema = getQueryInput(z.object({ name: z.string() }));

    const valid = schema.parse({
      where: { name: { contains: 'abc', mode: 'insensitive' } },
      skip: 0,
      take: 10,
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


  test('Query and getQueryInput reject blank/whitespace orderBy keys', () => {
    expect(() => Query.parse({ orderBy: { '': 'asc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => Query.parse({ orderBy: { '   ': 'desc' } })).toThrow(/orderBy keys must be non-empty/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ orderBy: { '': 'asc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => schema.parse({ orderBy: { '   ': 'desc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(schema.parse({ orderBy: { name: 'asc' } }).orderBy.name).toBe('asc');
  });

  test('getQueryInput disallows where for non-object schemas', () => {
    const schema = getQueryInput(z.array(z.string()));

    expect(() => schema.parse({ where: { anything: { equals: 'x' } } })).toThrow();
    expect(schema.parse({ data: ['a', 'b'], limit: 10 }).limit).toBe(10);
  });
});
