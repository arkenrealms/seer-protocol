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

  test('Query and getQueryInput apply default pagination envelope values when omitted', () => {
    const queryDefaults = Query.parse({});
    expect(queryDefaults.skip).toBe(0);
    expect(queryDefaults.take).toBe(10);
    expect(queryDefaults.limit).toBe(10);

    const schema = getQueryInput(z.object({ name: z.string() }));
    const inputDefaults = schema.parse({});
    expect(inputDefaults.skip).toBe(0);
    expect(inputDefaults.take).toBe(10);
    expect(inputDefaults.limit).toBe(10);

    expect(schema.parse(undefined)).toBeUndefined();
  });

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

  test('Query and getQueryInput reject mismatched take/limit values', () => {
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
    expect(() => Query.parse({ orderBy: { ' name ': 'asc' } })).toThrow(/must not contain leading or trailing whitespace/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ orderBy: { '': 'asc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => schema.parse({ orderBy: { '   ': 'desc' } })).toThrow(/orderBy keys must be non-empty/);
    expect(() => schema.parse({ orderBy: { ' name ': 'asc' } })).toThrow(/must not contain leading or trailing whitespace/);
    expect(schema.parse({ orderBy: { name: 'asc' } }).orderBy.name).toBe('asc');
  });

  test('Query and getQueryInput reject blank/whitespace include/select keys', () => {
    expect(() => Query.parse({ include: { '': true } })).toThrow(/selection keys must be non-empty/);
    expect(() => Query.parse({ select: { '   ': false } })).toThrow(/selection keys must be non-empty/);
    expect(() => Query.parse({ include: { ' profile ': true } })).toThrow(/must not contain leading or trailing whitespace/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ include: { '': true } })).toThrow(/selection keys must be non-empty/);
    expect(() => schema.parse({ select: { '   ': false } })).toThrow(/selection keys must be non-empty/);
    expect(() => schema.parse({ select: { ' name ': true } })).toThrow(/must not contain leading or trailing whitespace/);
    expect(schema.parse({ include: { profile: true } }).include.profile).toBe(true);
    expect(schema.parse({ select: { name: true } }).select.name).toBe(true);
  });

  test('Query and getQueryInput reject blank/whitespace cursor keys', () => {
    expect(() => Query.parse({ cursor: { '': 'abc' } })).toThrow(/cursor keys must be non-empty/);
    expect(() => Query.parse({ cursor: { '   ': 1 } })).toThrow(/cursor keys must be non-empty/);
    expect(() => Query.parse({ cursor: { ' id ': 'abc' } })).toThrow(/must not contain leading or trailing whitespace/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ cursor: { '': 'abc' } })).toThrow(/cursor keys must be non-empty/);
    expect(() => schema.parse({ cursor: { '   ': 1 } })).toThrow(/cursor keys must be non-empty/);
    expect(() => schema.parse({ cursor: { ' id ': 'abc' } })).toThrow(/must not contain leading or trailing whitespace/);
    expect(schema.parse({ cursor: { id: 'abc' } }).cursor.id).toBe('abc');
  });

  test('Query and getQueryInput reject reserved prototype-pollution keys', () => {
    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => Query.parse({ include: { constructor: true } })).toThrow(/reserved key/);
    expect(() => Query.parse({ cursor: { prototype: 'abc' } })).toThrow(/reserved key/);

    expect(() => schema.parse({ select: { constructor: true } })).toThrow(/reserved key/);
    expect(() => schema.parse({ cursor: { prototype: 'abc' } })).toThrow(/reserved key/);
    expect(() => schema.parse({ include: { constructor: true } })).toThrow(/reserved key/);
  });

  test('Query and getQueryInput reject empty logical where arrays', () => {
    expect(() => Query.parse({ where: { AND: [] } })).toThrow(/AND must contain at least one condition/);
    expect(() => Query.parse({ where: { OR: [] } })).toThrow(/OR must contain at least one condition/);
    expect(() => Query.parse({ where: { NOT: [] } })).toThrow(/NOT must contain at least one condition/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ where: { AND: [] } })).toThrow(/AND must contain at least one condition/);
    expect(() => schema.parse({ where: { OR: [] } })).toThrow(/OR must contain at least one condition/);
    expect(() => schema.parse({ where: { NOT: [] } })).toThrow(/NOT must contain at least one condition/);

    const valid = schema.parse({ where: { AND: [{ name: { equals: 'abc' } }] } });
    expect(valid.where.AND).toHaveLength(1);
  });

  test('Query and getQueryInput reject empty in/notIn arrays in where filters', () => {
    expect(() => Query.parse({ where: { name: { in: [] } } })).toThrow(/in must contain at least one value/);
    expect(() => Query.parse({ where: { name: { notIn: [] } } })).toThrow(/notIn must contain at least one value/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ where: { name: { in: [] } } })).toThrow(/in must contain at least one value/);
    expect(() => schema.parse({ where: { name: { notIn: [] } } })).toThrow(/notIn must contain at least one value/);

    const valid = schema.parse({ where: { name: { in: ['abc'] } } });
    expect(valid.where.name.in).toEqual(['abc']);
  });

  test('Query and getQueryInput reject empty where operator objects', () => {
    expect(() => Query.parse({ where: { name: {} } })).toThrow(/must include at least one operator/);

    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ where: { name: {} } })).toThrow(/must include at least one operator/);
    expect(schema.parse({ where: { name: { equals: 'abc' } } }).where.name.equals).toBe('abc');
  });

  test('getQueryInput disallows where for non-object schemas', () => {
    const schema = getQueryInput(z.array(z.string()));

    expect(() => schema.parse({ where: { anything: { equals: 'x' } } })).toThrow();
    expect(schema.parse({ data: ['a', 'b'], limit: 10 }).limit).toBe(10);
  });

  test('getQueryInput rejects non-plain shorthand objects instead of silently stripping them', () => {
    const schema = getQueryInput(z.object({ name: z.string() }));

    expect(() => schema.parse({ where: { name: new String('abc') } })).toThrow(/Expected string/);
  });
});
