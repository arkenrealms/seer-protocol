// arken/packages/seer/packages/protocol/test/schema.depth-normalization.test.ts
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

describe('schema where-depth normalization behavior', () => {
  const { z, createPrismaWhereSchema } = loadRootSchemaRuntime();
  const modelSchema = z.object({ name: z.string() });

  test('normalizes non-finite and negative depth to base-shape behavior', () => {
    const nanDepth = createPrismaWhereSchema(modelSchema, Number.NaN);
    const negativeDepth = createPrismaWhereSchema(modelSchema, -2);

    expect(() => nanDepth.parse({ AND: [{ name: 'x' }], name: 'alice' })).toThrow(
      /Unrecognized key\(s\) in object: 'AND'/
    );
    expect(() => negativeDepth.parse({ OR: [{ name: 'x' }], name: 'alice' })).toThrow(
      /Unrecognized key\(s\) in object: 'OR'/
    );

    expect(nanDepth.parse({ name: 'alice' })).toEqual({ name: { equals: 'alice' } });
    expect(negativeDepth.parse({ name: 'alice' })).toEqual({ name: { equals: 'alice' } });
  });

  test('normalizes fractional depth before recursive where construction', () => {
    const depthOnePointNine = createPrismaWhereSchema(modelSchema, 1.9);

    expect(() =>
      depthOnePointNine.parse({
        AND: [
          {
            name: 'alice',
            AND: [{ name: 'nested-too-deep' }],
          },
        ],
      })
    ).toThrow(/Unrecognized key\(s\) in object: 'AND'/);

    const parsed = depthOnePointNine.parse({
      AND: [{ name: 'alice' }],
    });

    expect(parsed).toEqual({
      AND: [
        {
          name: { equals: 'alice' },
        },
      ],
    });
  });
});
