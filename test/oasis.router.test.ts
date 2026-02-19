// arken/packages/seer/packages/protocol/test/oasis.router.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('oasis router dispatch guards', () => {
  const root = process.cwd();

  test('getPatrons uses own-property guarded dispatch with deterministic unavailable-handler error', async () => {
    const source = await fs.readFile(path.resolve(root, 'oasis', 'oasis.router.ts'), 'utf8');
    const getPatronsBlock = source.match(/getPatrons:[\s\S]*?(?=\n\s*interact:)/)?.[0] ?? '';

    expect(source).toMatch(/import\s+\{\s*initTRPC\s*,\s*TRPCError\s*\}\s+from\s+'@trpc\/server';/);

    expect(getPatronsBlock.length).toBeGreaterThan(0);
    expect(getPatronsBlock).toMatch(/Object\.prototype\.hasOwnProperty\.call\(oasisService, 'getPatrons'\)/);
    expect(getPatronsBlock).toMatch(/Object\.getOwnPropertyDescriptor\(oasisService, 'getPatrons'\)/);
    expect(getPatronsBlock).toMatch(/Oasis\.getPatrons handler is unavailable for oasis\.getPatrons/);
    expect(getPatronsBlock).toMatch(/return method\.call\(oasisService, input, ctx\)/);
  });
});
