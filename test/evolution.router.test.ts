// arken/packages/seer/packages/protocol/test/evolution.router.test.ts
const fs = require('node:fs/promises');
const path = require('node:path');

describe('evolution router dispatch guards', () => {
  const root = process.cwd();

  test('info, updateConfig, monitorParties, and updateSettings use guarded own-property dispatch', async () => {
    const source = await fs.readFile(path.resolve(root, 'evolution', 'evolution.router.ts'), 'utf8');

    const infoBlock = source.match(/info:[\s\S]*?(?=\n\s*updateConfig:)/)?.[0] ?? '';
    const updateConfigBlock = source.match(/updateConfig:[\s\S]*?(?=\n\s*updateGameStats:)/)?.[0] ?? '';
    const monitorPartiesBlock =
      source.match(/monitorParties:[\s\S]*?(?=\n\s*getParties:)/)?.[0] ?? '';
    const updateSettingsBlock =
      source.match(/updateSettings:[\s\S]*?(?=\n\s*getPayments:)/)?.[0] ?? '';

    expect(source).toMatch(/import\s+\{\s*initTRPC\s*,\s*TRPCError\s*\}\s+from\s+'@trpc\/server';/);

    expect(infoBlock.length).toBeGreaterThan(0);
    expect(infoBlock).toMatch(/\.query\(\(\{ input, ctx \}\) =>/);
    expect(infoBlock).toMatch(/Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'info'\)/);
    expect(infoBlock).toMatch(/Object\.getOwnPropertyDescriptor\(evolutionService, 'info'\)/);
    expect(infoBlock).toMatch(/Evolution\.info handler is unavailable for evolution\.info/);
    expect(infoBlock).toMatch(/return method\.call\(evolutionService, input, ctx\)/);

    expect(updateConfigBlock.length).toBeGreaterThan(0);
    expect(updateConfigBlock).toMatch(/\.mutation\(\(\{ input, ctx \}\) =>/);
    expect(updateConfigBlock).not.toMatch(/\.query\(\(\{ input, ctx \}\) =>/);
    expect(updateConfigBlock).toMatch(/Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'updateConfig'\)/);
    expect(updateConfigBlock).toMatch(/Object\.getOwnPropertyDescriptor\(evolutionService, 'updateConfig'\)/);
    expect(updateConfigBlock).toMatch(/Evolution\.updateConfig handler is unavailable for evolution\.updateConfig/);
    expect(updateConfigBlock).toMatch(/return method\.call\(evolutionService, input, ctx\)/);

    expect(monitorPartiesBlock.length).toBeGreaterThan(0);
    expect(monitorPartiesBlock).toMatch(/\.query\(\(\{ input, ctx \}\) =>/);
    expect(monitorPartiesBlock).toMatch(
      /Object\.prototype\.hasOwnProperty\.call\(evolutionService, 'monitorParties'\)/
    );
    expect(monitorPartiesBlock).toMatch(/Object\.getOwnPropertyDescriptor\(evolutionService, 'monitorParties'\)/);
    expect(monitorPartiesBlock).toMatch(
      /Evolution\.monitorParties handler is unavailable for evolution\.monitorParties/
    );
    expect(monitorPartiesBlock).toMatch(/return method\.call\(evolutionService, input, ctx\)/);

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
