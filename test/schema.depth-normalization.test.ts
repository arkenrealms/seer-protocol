// arken/packages/seer/packages/protocol/test/schema.depth-normalization.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('schema where-depth normalization guard', () => {
  const root = process.cwd();

  test('createPrismaWhereSchema normalizes depth before recursion in root schema', async () => {
    const source = await fs.readFile(path.resolve(root, 'schema.ts'), 'utf8');
    const block =
      source.match(/export const createPrismaWhereSchema[\s\S]*?return zod\.object\(\{[\s\S]*?\}\);\n\};/)?.[0] ?? '';

    expect(block).toMatch(/const normalizedDepth = Number\.isFinite\(depth\) \? Math\.max\(0, Math\.floor\(depth\)\) : 0;/);
    expect(block).toMatch(/if \(normalizedDepth <= 0\)/);
    expect(block).toMatch(/createPrismaWhereSchema\(modelSchema, normalizedDepth - 1\)/);
  });
});
