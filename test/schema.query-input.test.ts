// arken/packages/seer/packages/protocol/test/schema.query-input.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('util/schema query envelope shape', () => {
  const root = process.cwd();

  test('getQueryInput supports take + legacy limit and array where guard', async () => {
    const source = await fs.readFile(path.resolve(root, 'util', 'schema.ts'), 'utf8');
    const getQueryInputBlock = source.match(/export const getQueryInput[\s\S]*?return zod\.union\(\[querySchema, zod\.undefined\(\)\]\);/)?.[0] ?? '';

    expect(getQueryInputBlock).toMatch(/take:\s*zod\.number\(\)\.default\(10\)\.optional\(\)/);
    expect(getQueryInputBlock).toMatch(/limit:\s*zod\.number\(\)\.default\(10\)\.optional\(\)/);
    expect(getQueryInputBlock).toMatch(/where:\s*isObjectSchema\s*\?\s*whereSchema\.optional\(\)\s*:\s*zod\.undefined\(\)\.optional\(\)/);
  });

  test('createPrismaWhereSchema logical clauses normalize and operator objects stay strict', async () => {
    const source = await fs.readFile(path.resolve(root, 'util', 'schema.ts'), 'utf8');

    expect(source).toMatch(/const logicalClauseSchema = zod\.preprocess\(/);
    expect(source).toMatch(/if \(Array\.isArray\(input\)\) return input;/);
    expect(source).toMatch(/if \(typeof input === 'object' && input !== null\) return \[input\];/);
    expect(source).toMatch(/\.partial\(\)\s*\.strict\(\)/);
  });
});
