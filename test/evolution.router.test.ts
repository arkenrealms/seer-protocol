// arken/packages/seer/packages/protocol/test/evolution.router.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('evolution router dispatch guards', () => {
  const root = process.cwd();

  test('updateConfig and updateSettings are mutation-based and use guarded own-property dispatch', async () => {
    const source = await fs.readFile(path.resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

    const updateConfigBlock = source.match(/updateConfig:[\s\S]*?(?=\n\s*updateGameStats:)/)?.[0] ?? '';
    const updateSettingsBlock =
      source.match(/updateSettings:[\s\S]*?(?=\n\s*getPayments:)/)?.[0] ?? '';

    expect(source).toMatch(/import\s+\{\s*initTRPC\s*,\s*TRPCError\s*\}\s+from\s+'@trpc\/server';/);

    expect(updateConfigBlock.length).toBeGreaterThan(0);
    expect(updateConfigBlock).toMatch(/\.mutation\(\(\{ input, ctx \}\) =>/);
    expect(updateConfigBlock).not.toMatch(/\.query\(\(\{ input, ctx \}\) =>/);
    expect(updateConfigBlock).toMatch(/Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'updateConfig'\)/);
    expect(updateConfigBlock).toMatch(/Object\.getOwnPropertyDescriptor\(evolutionService, 'updateConfig'\)/);
    expect(updateConfigBlock).toMatch(/Evolution\.updateConfig handler is unavailable for evolution\.updateConfig/);
    expect(updateConfigBlock).toMatch(/return method\.call\(evolutionService, input, ctx\)/);

    expect(updateSettingsBlock.length).toBeGreaterThan(0);
    expect(updateSettingsBlock).toMatch(/\.mutation\(\(\{ input, ctx \}\) =>/);
    expect(updateSettingsBlock).not.toMatch(/\.query\(\(\{ input, ctx \}\) =>/);
    expect(updateSettingsBlock).toMatch(/Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'updateSettings'\)/);
    expect(updateSettingsBlock).toMatch(/Object\.getOwnPropertyDescriptor\(evolutionService, 'updateSettings'\)/);
    expect(updateSettingsBlock).toMatch(
      /Evolution\.updateSettings handler is unavailable for evolution\.updateSettings/
    );
    expect(updateSettingsBlock).toMatch(/return method\.call\(evolutionService, input, ctx\)/);
  });
});
