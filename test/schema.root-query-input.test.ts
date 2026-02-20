// arken/seer/protocol/test/schema.root-query-input.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('root schema query envelope parity', () => {
  const root = process.cwd();

  test('schema.ts getQueryInput keeps strict pagination + mode enum parity', async () => {
    const source = await fs.readFile(path.resolve(root, 'schema.ts'), 'utf8');
    const getQueryInputBlock = source.match(/export const getQueryInput[\s\S]*?return zod\.union\(\[querySchema, zod\.undefined\(\)\]\);/)?.[0] ?? '';

    expect(getQueryInputBlock).toMatch(/skip:\s*zod\.number\(\)\.int\(\)\.min\(0\)\.default\(0\)\.optional\(\)/);
    expect(getQueryInputBlock).toMatch(/take:\s*zod\.number\(\)\.int\(\)\.min\(0\)\.default\(10\)\.optional\(\)/);
    expect(getQueryInputBlock).toMatch(/limit:\s*zod\.number\(\)\.int\(\)\.min\(0\)\.default\(10\)\.optional\(\)/);
    expect(source).toMatch(/mode:\s*zod\.enum\(\['default',\s*'insensitive'\]\)\.optional\(\)/);
  });
});
