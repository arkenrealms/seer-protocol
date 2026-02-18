// arken/packages/seer/packages/protocol/test/evolution.router.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('evolution router dispatch guards', () => {
  const root = process.cwd();

  test('updateSettings is mutation-based and uses guarded own-property dispatch', async () => {
    const source = await fs.readFile(path.resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

    const updateSettingsBlock =
      source.match(/updateSettings:[\s\S]*?(?=\n\s*getPayments:)/)?.[0] ?? '';

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
