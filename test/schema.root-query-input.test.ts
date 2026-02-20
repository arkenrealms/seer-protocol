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

  test('schema.ts Query and getQueryInput reject mismatched take/limit values', () => {
    expect(() => Query.parse({ take: 10, limit: 5 })).toThrow(/take and limit must match/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ take: 10, limit: 5 })).toThrow(/take and limit must match/);
    expect(schema.parse({ take: 10, limit: 10 }).take).toBe(10);
  });


  test('Query and getQueryInput normalize single pagination alias', () => {
    const queryFromLimit = Query.parse({ limit: 7 });
    expect(queryFromLimit.take).toBe(7);
    expect(queryFromLimit.limit).toBe(7);

    const queryFromTake = Query.parse({ take: 9 });
    expect(queryFromTake.take).toBe(9);
    expect(queryFromTake.limit).toBe(9);

    const schema = getQueryInput(z.object({ name: z.string() }));

    const inputFromLimit = schema.parse({ limit: 4 });
    expect(inputFromLimit.take).toBe(4);
    expect(inputFromLimit.limit).toBe(4);

    const inputFromTake = schema.parse({ take: 6 });
    expect(inputFromTake.take).toBe(6);
    expect(inputFromTake.limit).toBe(6);
  });

  test('schema.ts Query and getQueryInput reject blank/whitespace orderBy keys', () => {
    expect(() => Query.parse({ orderBy: { '': 'asc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => Query.parse({ orderBy: { '   ': 'desc' } })).toThrow(/orderBy keys must be non-empty/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ orderBy: { '': 'asc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => schema.parse({ orderBy: { '   ': 'desc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(schema.parse({ orderBy: { name: 'desc' } }).orderBy.name).toBe('desc');
  });

  test('schema.ts Query and getQueryInput reject blank/whitespace include/select keys', () => {
    expect(() => Query.parse({ include: { '': true } })).toThrow(/selection keys must be non-empty/);
    expect(() => Query.parse({ select: { '   ': false } })).toThrow(/selection keys must be non-empty/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ include: { '': true } })).toThrow(/selection keys must be non-empty/);
    expect(() => schema.parse({ select: { '   ': false } })).toThrow(/selection keys must be non-empty/);
    expect(schema.parse({ include: { profile: true } }).include.profile).toBe(true);
    expect(schema.parse({ select: { name: true } }).select.name).toBe(true);
  });

  test('schema.ts Query and getQueryInput reject blank/whitespace cursor keys', () => {
    expect(() => Query.parse({ cursor: { '': 'abc' } })).toThrow(/cursor keys must be non-empty/);
    expect(() => Query.parse({ cursor: { '   ': 1 } })).toThrow(/cursor keys must be non-empty/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ cursor: { '': 'abc' } })).toThrow(/cursor keys must be non-empty/);
    expect(() => schema.parse({ cursor: { '   ': 1 } })).toThrow(/cursor keys must be non-empty/);
    expect(schema.parse({ cursor: { id: 'abc' } }).cursor.id).toBe('abc');
  });

  test('schema.ts Query and getQueryInput reject reserved prototype-pollution keys', () => {
    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => Query.parse({ include: { constructor: true } })).toThrow(/reserved key/);
    expect(() => Query.parse({ cursor: { prototype: 'abc' } })).toThrow(/reserved key/);

    expect(() => schema.parse({ select: { constructor: true } })).toThrow(/reserved key/);
    expect(() => schema.parse({ cursor: { prototype: 'abc' } })).toThrow(/reserved key/);
  });

  test('schema.ts Query and getQueryInput reject empty logical where arrays', () => {
    expect(() => Query.parse({ where: { AND: [] } })).toThrow(/AND must contain at least one condition/);
    expect(() => Query.parse({ where: { OR: [] } })).toThrow(/OR must contain at least one condition/);
    expect(() => Query.parse({ where: { NOT: [] } })).toThrow(/NOT must contain at least one condition/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ where: { AND: [] } })).toThrow(/AND must contain at least one condition/);
    expect(() => schema.parse({ where: { OR: [] } })).toThrow(/OR must contain at least one condition/);
    expect(() => schema.parse({ where: { NOT: [] } })).toThrow(/NOT must contain at least one condition/);

    const valid = schema.parse({ where: { OR: [{ name: { equals: 'abc' } }] } });
    expect(valid.where.OR).toHaveLength(1);
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
