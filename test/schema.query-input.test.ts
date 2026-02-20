// arken/packages/seer/packages/protocol/test/schema.query-input.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('util/schema query envelope shape', () => {
  const root = process.cwd();

  test('getQueryInput supports take + legacy limit, strict where mode enum, and array where guard', async () => {
    const source = await fs.readFile(path.resolve(root, 'util', 'schema.ts'), 'utf8');
    const getQueryInputBlock = source.match(/export const getQueryInput[\s\S]*?return zod\.union\(\[querySchema, zod\.undefined\(\)\]\);/)?.[0] ?? '';

    expect(getQueryInputBlock).toMatch(/skip:\s*zod\.number\(\)\.int\(\)\.min\(0\)\.default\(0\)\.optional\(\)/);
    expect(getQueryInputBlock).toMatch(/take:\s*zod\.number\(\)\.int\(\)\.min\(0\)\.default\(10\)\.optional\(\)/);
    expect(getQueryInputBlock).toMatch(/limit:\s*zod\.number\(\)\.int\(\)\.min\(0\)\.default\(10\)\.optional\(\)/);
    expect(getQueryInputBlock).toMatch(/where:\s*isObjectSchema\s*\?\s*whereSchema\.optional\(\)\s*:\s*zod\.undefined\(\)\.optional\(\)/);
    expect(source).toMatch(/mode:\s*zod\.enum\(\['default',\s*'insensitive'\]\)\.optional\(\)/);
  });

  test('Query helper uses strict pagination fields and legacy limit alias', async () => {
    const source = await fs.readFile(path.resolve(root, 'util', 'schema.ts'), 'utf8');
    const queryBlock = source.match(/export const Query = z\.object\([\s\S]*?\n\}\);/)?.[0] ?? '';

    expect(queryBlock).toMatch(/skip:\s*z\.number\(\)\.int\(\)\.min\(0\)\.default\(0\)\.optional\(\)/);
    expect(queryBlock).toMatch(/take:\s*z\.number\(\)\.int\(\)\.min\(0\)\.default\(10\)\.optional\(\)/);
    expect(queryBlock).toMatch(/limit:\s*z\.number\(\)\.int\(\)\.min\(0\)\.default\(10\)\.optional\(\)/);
  });
});
